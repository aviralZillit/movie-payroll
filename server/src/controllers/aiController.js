import OpenAI from 'openai';
import Anthropic from '@anthropic-ai/sdk';
import { Production, User, Union, Department, Designation, BudgetTier, RateCard, OvertimeRule } from '../models/index.js';
import * as rateEngine from '../services/rateEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

// ─── Provider selection via env flag ──────────────────────────────────────────
// AI_PROVIDER=openai (default) or AI_PROVIDER=anthropic
// Keys: OPENAI_API_KEY or ANTHROPIC_API_KEY
const AI_PROVIDER = process.env.AI_PROVIDER || 'openai';

const SYSTEM_PROMPT = `You are a UK film production payroll assistant. Your job is to help create deal memos by looking up the correct data from the production database.

When the user describes a deal memo they want to create, you MUST:
1. Use search_productions to find the production
2. Use search_users to find the person
3. Use find_designation to match the role to union/department/designation
4. Use get_budget_tier to determine the correct tier from the production budget
5. Use lookup_rate to get the exact minimum union rates
6. Use get_union_rules to get overtime and penalty rules

IMPORTANT: Never invent or guess rates. Always use lookup_rate to get exact figures from the database.
If a rate card is not found, set rates to 0 and include a note explaining rates need to be manually entered.

For ALLOWANCES, use these standard BECTU/industry defaults unless the user specifies otherwise:
- Kit allowance: £150/week for HoDs (DOP, Gaffer, Key Grip, Production Designer), £75/week for operators/ACs, £0 for trainees
- Phone allowance: £10/week
- Computer allowance: £25/week for post-production and office roles, £0 for set roles
- Car allowance: £150/week for Art Department, Locations, Production Manager. £0 for others.
- Travel allowance: £0 (negotiated per production based on location)
- Per diem: £30/day for overnight locations, £0 for local shoots
These are typical industry figures, not union minimums. Mark them as suggested defaults in the summary.

After gathering all data, respond with a JSON object containing ALL deal memo form fields.

Your response MUST be valid JSON wrapped in <deal_memo_data> tags like:
<deal_memo_data>
{
  "productionId": "...",
  "personId": "...",
  "unionId": "...",
  "departmentId": "...",
  "designationId": "...",
  "budgetTierId": "...",
  "startDate": "YYYY-MM-DD",
  "dealType": "55hr_week",
  "weeklyRate": 4845,
  "dailyRate": 969,
  "hourlyRate": 81,
  "holidayPayPct": 12.07,
  "employerNiPct": 15,
  "pensionPct": 3,
  "apprenticeLevyPct": 0,
  "standardWorkDayHrs": 11,
  "lunchBreakHrs": 1,
  "sixthDayMultiplier": 1.5,
  "seventhDayMultiplier": 2,
  "nightPremiumPct": 50,
  "mealPenaltyEnabled": true,
  "mealPenaltyAmount": 82,
  "mealPenaltyAfterHrs": 6,
  "turnaroundMinHrs": 11,
  "kitAllowance": 0,
  "travelAllowance": 0,
  "perDiem": 0,
  "phoneAllowance": 0,
  "computerAllowance": 0,
  "carAllowance": 0,
  "summary": "Deal for Tom Harris as Camera Operator on The Last Horizon. BECTU Camera, MMP tier. Weekly: £4,845 (55hr deal).",
  "labels": {
    "production": "The Last Horizon",
    "person": "Tom Harris",
    "union": "BECTU",
    "department": "Camera",
    "designation": "Camera Operator",
    "budgetTier": "MMP (£30m+)"
  }
}
</deal_memo_data>

Also include a "message" field with a human-readable summary of what was filled.`;

// ─── Tool definitions (shared format, converted per provider) ─────────────────

const TOOL_DEFS = [
  {
    name: 'search_productions',
    description: 'Search productions by name. Returns matching productions with id, name, budget, productionType, status, and members.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Production name or partial name to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'search_users',
    description: 'Search users by name or email. Returns matching users with id, firstName, lastName, email, role.',
    parameters: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'User name or email to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_designation',
    description: 'Find a union, department and designation by role name. Returns unionId, departmentId, designationId with names.',
    parameters: {
      type: 'object',
      properties: {
        role: { type: 'string', description: "Role name like 'Camera Operator', 'Gaffer', '1st AC', 'Lead Actor', etc." },
      },
      required: ['role'],
    },
  },
  {
    name: 'get_budget_tier',
    description: 'Determine the correct budget tier from production budget amount and type.',
    parameters: {
      type: 'object',
      properties: {
        budget: { type: 'number', description: 'Production budget in GBP' },
        productionType: { type: 'string', description: 'feature_film, tv_drama, commercial, etc.' },
      },
      required: ['budget', 'productionType'],
    },
  },
  {
    name: 'lookup_rate',
    description: 'Look up the minimum union rate card for a specific role and budget tier.',
    parameters: {
      type: 'object',
      properties: {
        unionId: { type: 'string', description: 'MongoDB ObjectId of the union' },
        departmentId: { type: 'string', description: 'MongoDB ObjectId of the department' },
        designationId: { type: 'string', description: 'MongoDB ObjectId of the designation' },
        budgetTierId: { type: 'string', description: 'MongoDB ObjectId of the budget tier' },
        dealType: { type: 'string', description: 'Deal type: 50hr_week, 55hr_week, daily, etc.' },
      },
      required: ['unionId', 'departmentId', 'designationId', 'budgetTierId'],
    },
  },
  {
    name: 'get_union_rules',
    description: 'Get overtime rules, turnaround, meal penalty rules for a union.',
    parameters: {
      type: 'object',
      properties: {
        unionId: { type: 'string', description: 'MongoDB ObjectId of the union' },
        departmentId: { type: 'string', description: 'Optional department ObjectId for dept-specific rules' },
      },
      required: ['unionId'],
    },
  },
];

// Convert to Anthropic format
function getAnthropicTools() {
  return TOOL_DEFS.map((t) => ({
    name: t.name,
    description: t.description,
    input_schema: t.parameters,
  }));
}

// Convert to OpenAI format
function getOpenAITools() {
  return TOOL_DEFS.map((t) => ({
    type: 'function',
    function: {
      name: t.name,
      description: t.description,
      parameters: t.parameters,
    },
  }));
}

// ─── Tool execution (shared) ──────────────────────────────────────────────────

async function executeTool(name, input) {
  switch (name) {
    case 'search_productions': {
      const productions = await Production.find({
        name: { $regex: input.query, $options: 'i' },
      })
        .populate('members.userId', 'firstName lastName')
        .limit(5)
        .lean();
      return productions.map((p) => ({
        id: p._id.toString(),
        name: p.name,
        budget: p.budget,
        productionType: p.productionType,
        status: p.status,
        members: (p.members || []).map((m) => ({
          userId: m.userId?._id?.toString() || m.userId?.toString(),
          firstName: m.userId?.firstName,
          lastName: m.userId?.lastName,
          role: m.role,
        })),
      }));
    }

    case 'search_users': {
      // Split query into words and search each against first/last name
      const queryWords = input.query.trim().split(/\s+/);
      const orConditions = queryWords.flatMap(w => [
        { firstName: { $regex: w, $options: 'i' } },
        { lastName: { $regex: w, $options: 'i' } },
        { email: { $regex: w, $options: 'i' } },
      ]);
      const users = await User.find({ $or: orConditions }).limit(10).lean();
      return users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
      }));
    }

    case 'find_designation': {
      // Search by name, code, and individual words for fuzzy matching
      const role = input.role;
      const words = role.split(/[\s\/,]+/).filter(w => w.length > 1);
      const regexPatterns = [
        role, // exact phrase
        ...words, // individual words
      ];
      const orConditions = regexPatterns.flatMap(p => [
        { name: { $regex: p, $options: 'i' } },
        { code: { $regex: p.replace(/\s+/g, '_'), $options: 'i' } },
      ]);
      const desigs = await Designation.find({ $or: orConditions })
        .populate({ path: 'departmentId', populate: { path: 'unionId' } })
        .limit(10)
        .lean();
      return desigs.map((d) => ({
        designationId: d._id.toString(),
        designationName: d.name,
        designationCode: d.code,
        departmentId: d.departmentId?._id?.toString(),
        departmentName: d.departmentId?.name,
        departmentCode: d.departmentId?.code,
        unionId: d.departmentId?.unionId?._id?.toString(),
        unionName: d.departmentId?.unionId?.name,
        unionCode: d.departmentId?.unionId?.code,
      }));
    }

    case 'get_budget_tier': {
      const { budget, productionType } = input;
      const allTiers = await BudgetTier.find({ isActive: true }).sort({ sortOrder: 1 }).lean();
      const matching = allTiers.filter((t) => {
        const typeMatch = !t.productionType || t.productionType === productionType;
        const minMatch = t.minBudget == null || t.minBudget <= budget;
        const maxMatch = t.maxBudget == null || t.maxBudget >= budget;
        return typeMatch && minMatch && maxMatch;
      });
      return matching.map((t) => ({
        id: t._id.toString(),
        name: t.name,
        code: t.code,
        productionType: t.productionType,
        minBudget: t.minBudget,
        maxBudget: t.maxBudget,
      }));
    }

    case 'lookup_rate': {
      let { unionId, departmentId, designationId, budgetTierId, dealType } = input;

      // If budgetTierId looks invalid (placeholder or non-ObjectId), try to resolve it
      if (!budgetTierId || budgetTierId.length !== 24 || budgetTierId.includes('placeholder')) {
        // Try to find MMP tier as default for feature films
        const fallbackTier = await BudgetTier.findOne({ code: 'FILM_MMP' }).lean();
        if (fallbackTier) budgetTierId = fallbackTier._id.toString();
      }

      const rateCard = await rateEngine.lookupRate({
        unionId,
        departmentId,
        designationId,
        budgetTierId,
        dealType: dealType || '55hr_week',
      });
      if (!rateCard) {
        return { found: false, message: 'No rate card found. Rates must be entered manually.', budgetTierId };
      }
      return {
        found: true,
        dealType: rateCard.dealType,
        weeklyRate: rateCard.weeklyRate,
        dailyRate: rateCard.dailyRate,
        hourlyRate: rateCard.hourlyRate,
        overtimeRate1x5: rateCard.overtimeRate1x5,
        overtimeRate2x: rateCard.overtimeRate2x,
        sixthDayRate: rateCard.sixthDayRate,
        seventhDayRate: rateCard.seventhDayRate,
        isVerified: rateCard.isVerified,
        sourceUrl: rateCard.sourceUrl,
        sourceDocument: rateCard.sourceDocument,
      };
    }

    case 'get_union_rules': {
      const union = await Union.findById(input.unionId).lean();
      const rules = await rateEngine.getOvertimeRules(input.unionId, input.departmentId);
      return {
        union: union ? {
          name: union.name, code: union.code,
          standardWorkDayHrs: union.standardWorkDayHrs,
          lunchBreakHrs: union.standardLunchHrs,
          turnaroundMinHrs: union.minTurnaroundHrs,
          holidayPayPct: union.holidayPayPct,
        } : null,
        overtimeRules: rules.map((r) => ({
          name: r.name, afterHours: r.afterHours, multiplier: r.multiplier,
          appliesTo: r.appliesTo, isNightRate: r.isNightRate,
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ─── OpenAI handler ───────────────────────────────────────────────────────────

async function handleOpenAI(message) {
  const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  let messages = [
    { role: 'system', content: SYSTEM_PROMPT },
    { role: 'user', content: message },
  ];

  let response = await client.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4o',
    messages,
    tools: getOpenAITools(),
    tool_choice: 'auto',
    max_tokens: 4096,
  });

  let choice = response.choices[0];

  // Tool use loop
  while (choice.finish_reason === 'tool_calls' && choice.message.tool_calls) {
    messages.push(choice.message);

    for (const toolCall of choice.message.tool_calls) {
      const args = JSON.parse(toolCall.function.arguments);
      console.log(`[AI Tool] ${toolCall.function.name}(${JSON.stringify(args).slice(0, 200)})`);
      const result = await executeTool(toolCall.function.name, args);
      console.log(`[AI Result] ${toolCall.function.name} →`, JSON.stringify(result).slice(0, 300));
      messages.push({
        role: 'tool',
        tool_call_id: toolCall.id,
        content: JSON.stringify(result),
      });
    }

    response = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o',
      messages,
      tools: getOpenAITools(),
      tool_choice: 'auto',
      max_tokens: 4096,
    });
    choice = response.choices[0];
  }

  return choice.message.content || '';
}

// ─── Anthropic handler ────────────────────────────────────────────────────────

async function handleAnthropic(message) {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let messages = [{ role: 'user', content: message }];

  let response = await client.messages.create({
    model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: getAnthropicTools(),
    messages,
  });

  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    const toolResults = [];

    for (const toolUse of toolUseBlocks) {
      try {
        const result = await executeTool(toolUse.name, toolUse.input);
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify(result) });
      } catch (err) {
        toolResults.push({ type: 'tool_result', tool_use_id: toolUse.id, content: JSON.stringify({ error: err.message }), is_error: true });
      }
    }

    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ];

    response = await client.messages.create({
      model: process.env.ANTHROPIC_MODEL || 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: getAnthropicTools(),
      messages,
    });
  }

  const textBlock = response.content.find((b) => b.type === 'text');
  return textBlock?.text || '';
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export const aiDealMemo = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new AppError('Message is required', 400);

  // Check API key based on provider
  const provider = AI_PROVIDER;
  if (provider === 'openai' && !process.env.OPENAI_API_KEY) {
    throw new AppError('AI not configured. Set OPENAI_API_KEY in environment.', 500);
  }
  if (provider === 'anthropic' && !process.env.ANTHROPIC_API_KEY) {
    throw new AppError('AI not configured. Set ANTHROPIC_API_KEY in environment.', 500);
  }

  // Call the appropriate provider
  let text;
  if (provider === 'anthropic') {
    text = await handleAnthropic(message);
  } else {
    text = await handleOpenAI(message);
  }

  // Parse the deal memo data from the response
  const dataMatch = text.match(/<deal_memo_data>([\s\S]*?)<\/deal_memo_data>/);
  let formData = null;
  if (dataMatch) {
    try { formData = JSON.parse(dataMatch[1]); } catch (_e) { /* raw text returned */ }
  }

  res.json({
    success: true,
    data: {
      message: text.replace(/<deal_memo_data>[\s\S]*?<\/deal_memo_data>/, '').trim(),
      formData,
      provider,
    },
  });
});
