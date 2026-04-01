import Anthropic from '@anthropic-ai/sdk';
import { Production, User, Union, Department, Designation, BudgetTier, RateCard, OvertimeRule } from '../models/index.js';
import * as rateEngine from '../services/rateEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

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

const TOOLS = [
  {
    name: 'search_productions',
    description: 'Search productions by name. Returns matching productions with id, name, budget, productionType, status, and members.',
    input_schema: {
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
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'User name or email to search for' },
      },
      required: ['query'],
    },
  },
  {
    name: 'find_designation',
    description: 'Find a union, department and designation by role name/description. Searches across all unions and departments to find the best match. Returns unionId, departmentId, designationId with their names and codes.',
    input_schema: {
      type: 'object',
      properties: {
        role: { type: 'string', description: "Role name like 'Camera Operator', 'Gaffer', 'Boom Operator', 'Lead Actor', '1st AC', 'DOP', etc." },
      },
      required: ['role'],
    },
  },
  {
    name: 'get_budget_tier',
    description: "Determine the correct budget tier based on a production's budget amount and type (feature_film or tv_drama). Returns the matching budget tier with id, name, code.",
    input_schema: {
      type: 'object',
      properties: {
        budget: { type: 'number', description: 'Production budget in GBP' },
        productionType: { type: 'string', description: 'Production type: feature_film, tv_drama, commercial, etc.' },
      },
      required: ['budget', 'productionType'],
    },
  },
  {
    name: 'lookup_rate',
    description: 'Look up the minimum union rate card for a specific role and budget tier. Returns weekly, daily, hourly rates and OT rates from verified union rate cards.',
    input_schema: {
      type: 'object',
      properties: {
        unionId: { type: 'string', description: 'MongoDB ObjectId of the union' },
        departmentId: { type: 'string', description: 'MongoDB ObjectId of the department' },
        designationId: { type: 'string', description: 'MongoDB ObjectId of the designation' },
        budgetTierId: { type: 'string', description: 'MongoDB ObjectId of the budget tier' },
        dealType: { type: 'string', description: 'Deal type: 50hr_week, 55hr_week, daily, etc. Defaults to 55hr_week for BECTU film.' },
      },
      required: ['unionId', 'departmentId', 'designationId', 'budgetTierId'],
    },
  },
  {
    name: 'get_union_rules',
    description: 'Get overtime rules, standard work day hours, turnaround requirements, and meal penalty rules for a specific union. Returns complete working conditions.',
    input_schema: {
      type: 'object',
      properties: {
        unionId: { type: 'string', description: 'MongoDB ObjectId of the union' },
        departmentId: { type: 'string', description: 'Optional: MongoDB ObjectId of department for department-specific rules' },
      },
      required: ['unionId'],
    },
  },
];

// ---------------------------------------------------------------------------
// Tool execution
// ---------------------------------------------------------------------------
async function executeTool(name, input) {
  switch (name) {
    case 'search_productions': {
      const { query } = input;
      const productions = await Production.find({
        name: { $regex: query, $options: 'i' },
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
      const { query } = input;
      const users = await User.find({
        $or: [
          { firstName: { $regex: query, $options: 'i' } },
          { lastName: { $regex: query, $options: 'i' } },
          { email: { $regex: query, $options: 'i' } },
        ],
      })
        .limit(10)
        .lean();

      return users.map((u) => ({
        id: u._id.toString(),
        firstName: u.firstName,
        lastName: u.lastName,
        email: u.email,
        role: u.role,
      }));
    }

    case 'find_designation': {
      const { role } = input;
      const desigs = await Designation.find({
        name: { $regex: role, $options: 'i' },
      })
        .populate({
          path: 'departmentId',
          populate: { path: 'unionId' },
        })
        .limit(5)
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
      const tiers = await BudgetTier.find({
        isActive: true,
        $or: [
          { productionType },
          { productionType: null },
        ],
        minBudget: { $lte: budget },
        $or: [
          { maxBudget: { $gte: budget } },
          { maxBudget: null },
        ],
      })
        .sort({ sortOrder: 1 })
        .lean();

      // MongoDB $or at the top level gets merged, so do a manual filter
      const matching = tiers.filter((t) => {
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
        description: t.description,
      }));
    }

    case 'lookup_rate': {
      const { unionId, departmentId, designationId, budgetTierId, dealType } = input;
      const rateCard = await rateEngine.lookupRate({
        unionId,
        departmentId,
        designationId,
        budgetTierId,
        dealType: dealType || '55hr_week',
      });

      if (!rateCard) {
        return { found: false, message: 'No rate card found for this combination. Rates will need to be entered manually.' };
      }

      return {
        found: true,
        dealType: rateCard.dealType,
        weeklyRate: rateCard.weeklyRate,
        dailyRate: rateCard.dailyRate,
        hourlyRate: rateCard.hourlyRate,
        guaranteedHours: rateCard.guaranteedHours,
        sourceUrl: rateCard.sourceUrl,
        sourceDocument: rateCard.sourceDocument,
        effectiveFrom: rateCard.effectiveFrom,
        effectiveTo: rateCard.effectiveTo,
      };
    }

    case 'get_union_rules': {
      const { unionId, departmentId } = input;
      const union = await Union.findById(unionId).lean();
      const rules = await rateEngine.getOvertimeRules(unionId, departmentId);

      return {
        union: union
          ? {
              id: union._id.toString(),
              name: union.name,
              code: union.code,
              standardWorkDayHrs: union.standardWorkDayHrs,
              lunchBreakHrs: union.lunchBreakHrs,
              turnaroundMinHrs: union.turnaroundMinHrs,
              mealPenaltyEnabled: union.mealPenaltyEnabled,
              mealPenaltyAmount: union.mealPenaltyAmount,
              mealPenaltyAfterHrs: union.mealPenaltyAfterHrs,
              nightPremiumPct: union.nightPremiumPct,
              sixthDayMultiplier: union.sixthDayMultiplier,
              seventhDayMultiplier: union.seventhDayMultiplier,
              holidayPayPct: union.holidayPayPct,
              employerNiPct: union.employerNiPct,
              pensionPct: union.pensionPct,
              apprenticeLevyPct: union.apprenticeLevyPct,
            }
          : null,
        overtimeRules: rules.map((r) => ({
          id: r._id.toString(),
          afterHours: r.afterHours,
          multiplier: r.multiplier,
          description: r.description,
          dayType: r.dayType,
          priority: r.priority,
        })),
      };
    }

    default:
      return { error: `Unknown tool: ${name}` };
  }
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------
export const aiDealMemo = asyncHandler(async (req, res) => {
  const { message } = req.body;

  if (!message) {
    throw new AppError('Message is required', 400);
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    throw new AppError('AI not configured. Set ANTHROPIC_API_KEY.', 500);
  }

  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  let messages = [{ role: 'user', content: message }];

  // Initial request to Claude
  let response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    tools: TOOLS,
    messages,
  });

  // Tool use loop -- Claude may call multiple tools in sequence
  while (response.stop_reason === 'tool_use') {
    const toolUseBlocks = response.content.filter((b) => b.type === 'tool_use');
    const toolResults = [];

    for (const toolUse of toolUseBlocks) {
      try {
        const result = await executeTool(toolUse.name, toolUse.input);
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify(result),
        });
      } catch (err) {
        toolResults.push({
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: JSON.stringify({ error: err.message }),
          is_error: true,
        });
      }
    }

    messages = [
      ...messages,
      { role: 'assistant', content: response.content },
      { role: 'user', content: toolResults },
    ];

    response = await client.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      tools: TOOLS,
      messages,
    });
  }

  // Extract the final text response
  const textBlock = response.content.find((b) => b.type === 'text');
  const text = textBlock?.text || '';

  // Parse the deal memo data from the response
  const dataMatch = text.match(/<deal_memo_data>([\s\S]*?)<\/deal_memo_data>/);
  let formData = null;
  if (dataMatch) {
    try {
      formData = JSON.parse(dataMatch[1]);
    } catch (e) {
      // If JSON parsing fails, formData stays null and raw text is returned
    }
  }

  res.json({
    success: true,
    data: {
      message: text.replace(/<deal_memo_data>[\s\S]*?<\/deal_memo_data>/, '').trim(),
      formData,
    },
  });
});
