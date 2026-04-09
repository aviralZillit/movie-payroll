import path from 'path';
import { DealMemo, Production, ProductionSettings } from '../models/index.js';
import * as rateEngine from '../services/rateEngine.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';
import { UPLOADS_DIR } from '../middleware/upload.js';

const VALID_TRANSITIONS = {
  draft: ['sent', 'issued', 'cancelled'],
  issued: ['sent', 'signed', 'negotiating', 'active', 'cancelled'],
  sent: ['negotiating', 'signed', 'cancelled'],
  negotiating: ['sent', 'signed', 'cancelled'],
  signed: ['pending_approval', 'active', 'cancelled'],
  pending_approval: ['active', 'draft', 'cancelled'],
  active: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

/**
 * Generate a unique deal number in format DM-YYYY-NNN
 */
const generateDealNumber = async () => {
  const year = new Date().getFullYear();
  const prefix = `DM-${year}-`;

  const lastDeal = await DealMemo.findOne({ dealNumber: { $regex: `^${prefix}` } })
    .sort({ dealNumber: -1 })
    .select('dealNumber');

  let nextNumber = 1;
  if (lastDeal) {
    const parts = lastDeal.dealNumber.split('-');
    nextNumber = parseInt(parts[2], 10) + 1;
  }

  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
};

/**
 * POST /api/deal-memos
 */
export const create = asyncHandler(async (req, res) => {
  const {
    productionId,
    personId,
    unionId,
    departmentId,
    designationId,
    budgetTierId,
    startDate,
    ...rest
  } = req.body;

  // Verify production exists
  const production = await Production.findById(productionId);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  // Auto-populate rates from rate engine (skip if IDs are missing)
  let rateCard = null;
  if (unionId && departmentId && designationId && budgetTierId) {
    rateCard = await rateEngine.lookupRate({
      unionId,
      departmentId,
      designationId,
      budgetTierId,
      date: startDate,
    });
  }

  // Map form field names to model field names
  if (rest.guaranteedHours != null) {
    rest.guaranteedHoursPerWeek = rest.guaranteedHours;
    rest.guaranteedHoursPerDay = Math.round(rest.guaranteedHours / 5);
    delete rest.guaranteedHours;
  }
  if (rest.apprenticeLevyPct != null) {
    rest.apprenticeshipLevyPct = rest.apprenticeLevyPct;
    delete rest.apprenticeLevyPct;
  }
  if (rest.mealPenaltyEnabled != null && rest.mealPenaltyAmount != null) {
    rest.mealPenaltyRate = rest.mealPenaltyAmount;
  }
  if (rest.mealPenaltyAfterHrs != null) {
    rest.mealPenaltyAfterHrs = rest.mealPenaltyAfterHrs;
  }

  const dealData = {
    dealNumber: await generateDealNumber(),
    productionId,
    personId,
    createdById: req.user._id,
    unionId: unionId || undefined,
    departmentId: departmentId || undefined,
    designationId: designationId || undefined,
    budgetTierId: budgetTierId || undefined,
    startDate,
    ...rest,
  };

  // If rate card found, populate defaults (can be overridden by rest)
  if (rateCard) {
    dealData.weeklyRate = dealData.weeklyRate ?? rateCard.weeklyRate;
    dealData.dailyRate = dealData.dailyRate ?? rateCard.dailyRate;
    dealData.hourlyRate = dealData.hourlyRate ?? rateCard.hourlyRate;
    dealData.otRate1x5 = dealData.otRate1x5 ?? rateCard.overtimeRate1x5;
    dealData.otRate2x = dealData.otRate2x ?? rateCard.overtimeRate2x;
    dealData.rateCardId = rateCard._id;
    dealData.rateCardSourceUrl = rateCard.sourceUrl;
    if (rateCard.holidayPayInclusive) {
      dealData.holidayPayInclusive = true;
    }
    if (rateCard.nightPremiumPct != null) {
      dealData.nightPremiumPct = dealData.nightPremiumPct ?? rateCard.nightPremiumPct;
    }
  }

  // Calculate OT rates from hourly if not provided
  if (!dealData.otRate1x5 && dealData.hourlyRate) {
    dealData.otRate1x5 = dealData.hourlyRate * 1.5;
  }
  if (!dealData.otRate2x && dealData.hourlyRate) {
    dealData.otRate2x = dealData.hourlyRate * 2;
  }

  const dealMemo = await DealMemo.create(dealData);

  const populated = await DealMemo.findById(dealMemo._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .populate('contractingEntityId', 'name');

  res.status(201).json({ success: true, data: populated });
});

/**
 * PUT /api/deal-memos/:id
 */
export const update = asyncHandler(async (req, res) => {
  const dealMemo = await DealMemo.findById(req.params.id);
  if (!dealMemo) {
    throw new AppError('Deal memo not found.', 404);
  }

  if (['completed', 'cancelled'].includes(dealMemo.status)) {
    throw new AppError(`Cannot update a ${dealMemo.status} deal memo.`, 400);
  }

  // If rates are being updated, validate against minimum
  if (req.body.weeklyRate || req.body.dailyRate || req.body.hourlyRate) {
    const rateCard = await rateEngine.lookupRate({
      unionId: dealMemo.unionId,
      departmentId: dealMemo.departmentId,
      designationId: dealMemo.designationId,
      budgetTierId: dealMemo.budgetTierId,
      date: dealMemo.startDate,
    });

    if (rateCard) {
      if (req.body.weeklyRate) {
        const validation = rateEngine.validateRate(req.body.weeklyRate, rateCard.weeklyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
      if (req.body.dailyRate) {
        const validation = rateEngine.validateRate(req.body.dailyRate, rateCard.dailyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
      if (req.body.hourlyRate) {
        const validation = rateEngine.validateRate(req.body.hourlyRate, rateCard.hourlyRate);
        if (!validation.isValid) {
          throw new AppError(validation.warningMessage, 400);
        }
      }
    }
  }

  Object.assign(dealMemo, req.body);
  await dealMemo.save();

  const populated = await DealMemo.findById(dealMemo._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name');

  res.json({ success: true, data: populated });
});

/**
 * GET /api/deal-memos
 */
export const getAll = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.status) filter.status = req.query.status;
  if (req.query.productionId) filter.productionId = req.query.productionId;
  if (req.query.personId) filter.personId = req.query.personId;

  // Crew members only see their own deal memos
  if (req.user.role === 'crew_member') {
    filter.personId = req.user._id;
  }
  // Dept heads see deals for their department's productions
  // (for now, they see all — can be scoped later)

  const page = parseInt(req.query.page, 10) || 1;
  const limit = parseInt(req.query.limit, 10) || 20;
  const skip = (page - 1) * limit;

  const [deals, total] = await Promise.all([
    DealMemo.find(filter)
      .populate('productionId', 'name code')
      .populate('personId', 'firstName lastName email')
      .populate('createdById', 'firstName lastName email')
      .populate('unionId', 'code name')
      .populate('departmentId', 'code name')
      .populate('designationId', 'code name')
      .populate('budgetTierId', 'code name')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    DealMemo.countDocuments(filter),
  ]);

  res.json({
    success: true,
    data: deals,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  });
});

/**
 * GET /api/deal-memos/:id
 */
export const getById = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('createdById', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .populate('contractingEntityId', 'name')
    .populate('rateCardId')
    .populate('statusHistory.changedBy', 'firstName lastName email');

  if (!deal) {
    throw new AppError('Deal memo not found.', 404);
  }

  // Crew members can only view their own deal memos
  if (
    req.user.role === 'crew_member' &&
    deal.personId._id.toString() !== req.user._id.toString()
  ) {
    throw new AppError('You do not have permission to view this deal memo.', 403);
  }

  res.json({ success: true, data: deal });
});

/**
 * GET /api/deal-memos/production/:productionId
 */
export const getByProduction = asyncHandler(async (req, res) => {
  const deals = await DealMemo.find({ productionId: req.params.productionId })
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: deals });
});

/**
 * GET /api/deal-memos/my-deals
 */
export const getMyDeals = asyncHandler(async (req, res) => {
  const deals = await DealMemo.find({ personId: req.user._id })
    .populate('productionId', 'name code')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .sort({ createdAt: -1 });

  res.json({ success: true, data: deals });
});

/**
 * PATCH /api/deal-memos/:id/transition
 * Body: { toStatus, note }
 */
export const transitionStatus = asyncHandler(async (req, res) => {
  const { toStatus, note } = req.body;

  const deal = await DealMemo.findById(req.params.id);
  if (!deal) {
    throw new AppError('Deal memo not found.', 404);
  }

  const allowed = VALID_TRANSITIONS[deal.status];
  if (!allowed || !allowed.includes(toStatus)) {
    throw new AppError(
      `Cannot transition from '${deal.status}' to '${toStatus}'. Allowed: ${(allowed || []).join(', ') || 'none'}.`,
      400
    );
  }

  const role = req.user.role;
  const isAdmin = ['super_admin', 'payroll_admin', 'production_accountant'].includes(role);
  const isPersonOnDeal = deal.personId.toString() === req.user._id.toString();

  // Per-transition authorization
  const from = deal.status;

  if (from === 'draft' && toStatus === 'sent') {
    // Only admin/accountant can send
    if (!isAdmin) {
      throw new AppError('Only admins or accountants can send deal memos.', 403);
    }
  } else if (from === 'sent' && toStatus === 'signed') {
    // The crew member who is the personId on the deal, or admin
    if (!isAdmin && !isPersonOnDeal) {
      throw new AppError('Only the assigned crew member or an admin can sign this deal memo.', 403);
    }
  } else if (from === 'signed' && toStatus === 'active') {
    // Only admin/accountant can activate
    if (!isAdmin) {
      throw new AppError('Only admins or accountants can activate deal memos.', 403);
    }
  } else if (toStatus === 'cancelled') {
    // Only admin can cancel
    if (!['super_admin', 'payroll_admin'].includes(role)) {
      throw new AppError('Only admins can cancel deal memos.', 403);
    }
  } else if (from === 'negotiating' || toStatus === 'negotiating') {
    // Negotiating transitions: either party (admin or the person on the deal)
    if (!isAdmin && !isPersonOnDeal) {
      throw new AppError('Only the assigned crew member or an admin can transition negotiating deals.', 403);
    }
  }

  const fromStatus = deal.status;
  deal.status = toStatus;

  if (toStatus === 'signed') {
    deal.signedAt = new Date();
  }

  deal.statusHistory.push({
    fromStatus,
    toStatus,
    changedBy: req.user._id,
    note,
  });

  await deal.save();

  const populated = await DealMemo.findById(deal._id)
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .populate('budgetTierId', 'code name')
    .populate('statusHistory.changedBy', 'firstName lastName email');

  res.json({ success: true, data: populated });
});

/**
 * PATCH /api/deal-memos/:id/crew-complete
 * Crew member updates their own fields (NI, bank, DOB, etc.)
 * Only the assigned person can update. Only CREW_FIELDS allowed.
 */
const CREW_FIELDS = [
  'dateOfBirth', 'address', 'crewAddress', 'emergencyContact',
  'niNumber', 'taxCode', 'studentLoan', 'starterDeclaration', 'p45Received', 'p45',
  'bankSortCode', 'bankAccountNumber',
  'ssn', 'w4FilingStatus', 'w4Allowances', 'stateWithholding', 'achRoutingNumber', 'achAccountNumber',
  'tfn', 'superFund', 'superMemberNumber', 'bsb',
  'sin', 'province', 'td1Federal', 'td1Provincial', 'bankTransit', 'bankInstitution', 'bankAccount',
  'taxId', 'iban', 'swift',
  'ltdCompanyName', 'ltdCompanyReg',
  'corpName', 'corpEin',
  // India
  'aadhaar', 'pan', 'uan', 'esiNumber', 'ifsc', 'gstin',
  // France
  'numSecSociale', 'congespectacle', 'audiensMember', 'mutuelle',
  // Germany
  'steuerID', 'sozialversicherung', 'steuerklasse', 'steuernummer', 'ustIdNr', 'handelsregister',
  // Spain
  'nie', 'numSegSocial', 'iaeCode',
];

export const crewComplete = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  // Only the assigned crew member can update their fields
  if (deal.personId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the assigned crew member can complete these fields.', 403);
  }

  // Filter to only allowed crew fields + parse dates
  const DATE_FIELDS = ['dateOfBirth'];
  const updates = {};
  for (const [key, value] of Object.entries(req.body)) {
    if (CREW_FIELDS.includes(key)) {
      if (DATE_FIELDS.includes(key) && value) {
        // Parse date: handle DD-MM-YYYY, DD/MM/YYYY, YYYY-MM-DD
        let parsed = new Date(value);
        if (isNaN(parsed.getTime()) && typeof value === 'string') {
          const parts = value.split(/[-\/]/);
          if (parts.length === 3) {
            if (parts[0].length === 4) parsed = new Date(`${parts[0]}-${parts[1]}-${parts[2]}`); // YYYY-MM-DD
            else parsed = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`); // DD-MM-YYYY → YYYY-MM-DD
          }
        }
        updates[key] = isNaN(parsed.getTime()) ? value : parsed;
      } else {
        updates[key] = value;
      }
    }
  }

  if (Object.keys(updates).length === 0) {
    throw new AppError('No valid crew fields provided.', 400);
  }

  Object.assign(deal, updates);

  // Auto-update compliance checklist: check items whose crewField was just filled
  if (deal.complianceChecklist && deal.complianceChecklist.length > 0) {
    const updatedFields = Object.keys(updates).filter((k) => updates[k]); // non-empty values
    for (const item of deal.complianceChecklist) {
      if (item.crewField && updatedFields.includes(item.crewField) && !item.isChecked) {
        item.isChecked = true;
        item.checkedAt = new Date();
        item.checkedBy = req.user._id;
      }
    }
  }

  await deal.save();

  const populated = await DealMemo.findById(deal._id)
    .populate('productionId', 'name code country currency')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name');

  res.json({ success: true, data: populated });
});

// ═══════════════════════════════════════════════════════════════════════
// Document Upload, Download & Signing
// ═══════════════════════════════════════════════════════════════════════

/**
 * POST /api/deal-memos/:id/documents/:docIndex/upload
 * Upload a file for a signing document. Requires multer middleware.
 */
export const uploadDocument = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  const docIndex = parseInt(req.params.docIndex);
  if (!deal.signingDocuments || docIndex >= deal.signingDocuments.length) {
    throw new AppError('Document index out of range.', 400);
  }

  if (!req.file) throw new AppError('No file uploaded.', 400);

  deal.signingDocuments[docIndex].fileUrl = `/uploads/${req.file.filename}`;
  deal.signingDocuments[docIndex].fileSize = req.file.size;
  deal.signingDocuments[docIndex].filename = req.file.originalname;
  await deal.save();

  res.json({ success: true, data: { fileUrl: deal.signingDocuments[docIndex].fileUrl, filename: req.file.originalname } });
});

/**
 * GET /api/deal-memos/:id/documents/:docIndex/download
 * Download a signing document file.
 */
export const downloadDocument = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  const docIndex = parseInt(req.params.docIndex);
  if (!deal.signingDocuments || docIndex >= deal.signingDocuments.length) {
    throw new AppError('Document index out of range.', 400);
  }

  const doc = deal.signingDocuments[docIndex];
  if (!doc.fileUrl) throw new AppError('No file uploaded for this document.', 404);

  const filePath = path.join(UPLOADS_DIR, path.basename(doc.fileUrl));
  res.download(filePath, doc.filename || 'document.pdf');
});

/**
 * POST /api/deal-memos/:id/documents/:docIndex/sign
 * Crew member signs a document (built-in e-signing).
 * Body: { signatureText: "John Smith", agreed: true }
 */
export const signDocument = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  // Only the assigned crew member can sign
  if (deal.personId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the assigned crew member can sign documents.', 403);
  }

  const docIndex = parseInt(req.params.docIndex);
  if (!deal.signingDocuments || docIndex >= deal.signingDocuments.length) {
    throw new AppError('Document index out of range.', 400);
  }

  const { signatureText, agreed } = req.body;
  if (!signatureText || !agreed) {
    throw new AppError('Signature text and agreement confirmation required.', 400);
  }

  const doc = deal.signingDocuments[docIndex];
  if (!doc.requiresSignature) {
    throw new AppError('This document does not require a signature.', 400);
  }
  if (doc.status === 'signed') {
    throw new AppError('This document is already signed.', 400);
  }

  doc.status = 'signed';
  doc.signedAt = new Date();
  doc.signedBy = req.user._id;
  doc.signatureText = signatureText;
  doc.signedIP = req.ip || req.headers['x-forwarded-for'] || 'unknown';
  doc.signatureMethod = 'typed';

  // Check if ALL required documents are now signed
  const allRequiredSigned = deal.signingDocuments
    .filter((d) => d.requiresSignature)
    .every((d) => d.status === 'signed');

  await deal.save();

  // Auto-transition to 'signed' if all docs signed
  let autoTransitioned = false;
  if (allRequiredSigned && deal.status === 'sent') {
    deal.status = 'signed';
    deal.signedAt = new Date();
    deal.statusHistory.push({
      fromStatus: 'sent',
      toStatus: 'signed',
      changedBy: req.user._id,
      note: 'All required documents signed',
    });
    await deal.save();
    autoTransitioned = true;
  }

  res.json({
    success: true,
    data: {
      documentStatus: doc.status,
      signedAt: doc.signedAt,
      allDocumentsSigned: allRequiredSigned,
      dealMemoStatus: deal.status,
      autoTransitioned,
    },
  });
});

// ═══════════════════════════════════════════════════════════════════════
// Flexible Approval Chain
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/deal-memos/pending-approvals
 * List deal memos pending the current user's approval.
 */
export const getPendingApprovals = asyncHandler(async (req, res) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  // Find deals in 'pending_approval' status where current step matches this user's role
  const deals = await DealMemo.find({ status: 'pending_approval' })
    .populate('productionId', 'name code')
    .populate('personId', 'firstName lastName email')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name')
    .sort({ updatedAt: -1 })
    .lean();

  // Filter to only deals where current approval step matches this user
  const pending = deals.filter((deal) => {
    if (!deal.approvalStatus || deal.currentApprovalStep == null) return false;
    const currentStep = deal.approvalStatus.find(
      (s) => s.step === deal.currentApprovalStep && s.status === 'pending'
    );
    if (!currentStep) return false;
    // Match by userId or by role
    if (currentStep.approverId?.toString() === userId.toString()) return true;
    if (currentStep.approverRole === userRole) return true;
    return false;
  });

  res.json({ success: true, data: pending });
});

/**
 * PATCH /api/deal-memos/:id/approve
 * Approve the current approval step.
 */
export const approveDealMemo = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  if (deal.status !== 'pending_approval') {
    throw new AppError('Deal memo is not pending approval.', 400);
  }

  const currentStep = deal.approvalStatus?.find(
    (s) => s.step === deal.currentApprovalStep && s.status === 'pending'
  );
  if (!currentStep) throw new AppError('No pending approval step found.', 400);

  // Verify this user can approve this step
  const canApprove = currentStep.approverId?.toString() === req.user._id.toString() ||
    currentStep.approverRole === req.user.role ||
    ['super_admin', 'payroll_admin'].includes(req.user.role);

  if (!canApprove) throw new AppError('You are not authorized to approve this step.', 403);

  currentStep.status = 'approved';
  currentStep.approverId = req.user._id;
  currentStep.approvedAt = new Date();
  currentStep.note = req.body.note || '';

  // Check if there's a next step
  const nextStep = deal.approvalStatus?.find(
    (s) => s.step === deal.currentApprovalStep + 1 && s.status === 'pending'
  );

  if (nextStep) {
    deal.currentApprovalStep += 1;
  } else {
    // All steps approved → activate
    deal.status = 'active';
    deal.statusHistory.push({
      fromStatus: 'pending_approval',
      toStatus: 'active',
      changedBy: req.user._id,
      note: 'All approval steps completed',
    });
  }

  await deal.save();

  res.json({ success: true, data: deal });
});

/**
 * PATCH /api/deal-memos/:id/reject-approval
 * Reject the current approval step with reason.
 */
export const rejectApproval = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  if (deal.status !== 'pending_approval') {
    throw new AppError('Deal memo is not pending approval.', 400);
  }

  const { reason } = req.body;
  if (!reason) throw new AppError('Rejection reason is required.', 400);

  const currentStep = deal.approvalStatus?.find(
    (s) => s.step === deal.currentApprovalStep && s.status === 'pending'
  );
  if (currentStep) {
    currentStep.status = 'rejected';
    currentStep.approverId = req.user._id;
    currentStep.approvedAt = new Date();
    currentStep.note = reason;
  }

  // Reset to draft for rework
  deal.status = 'draft';
  deal.currentApprovalStep = 0;
  deal.statusHistory.push({
    fromStatus: 'pending_approval',
    toStatus: 'draft',
    changedBy: req.user._id,
    note: `Approval rejected: ${reason}`,
  });

  await deal.save();

  res.json({ success: true, data: deal });
});

/**
 * PATCH /api/deal-memos/:id/compliance/:itemIndex/toggle
 * Toggle a compliance checklist item (PRODUCTION items only).
 */
export const toggleComplianceItem = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  const itemIndex = parseInt(req.params.itemIndex);
  if (!deal.complianceChecklist || itemIndex >= deal.complianceChecklist.length) {
    throw new AppError('Compliance item not found.', 400);
  }

  const item = deal.complianceChecklist[itemIndex];

  // Admins can toggle any item. Crew can toggle CREW UPLOADS items on their own deal.
  const isAdmin = ['super_admin', 'payroll_admin', 'production_accountant'].includes(req.user.role);
  const isCrewOnOwnDeal = deal.personId.toString() === req.user._id.toString();
  const canToggle = isAdmin || (isCrewOnOwnDeal && item.responsibility === 'CREW UPLOADS');
  if (!canToggle) {
    throw new AppError('You do not have permission to toggle this item.', 403);
  }

  item.isChecked = !item.isChecked;
  item.checkedAt = item.isChecked ? new Date() : null;
  item.checkedBy = item.isChecked ? req.user._id : null;

  await deal.save();

  const populated = await DealMemo.findById(deal._id)
    .populate('productionId', 'name code country currency')
    .populate('unionId', 'code name')
    .populate('departmentId', 'code name')
    .populate('designationId', 'code name');

  res.json({ success: true, data: populated });
});

// ═══════════════════════════════════════════════════════════════════════
// RIGHT TO WORK — Document Request / Upload / Verify
// ═══════════════════════════════════════════════════════════════════════

/**
 * GET /api/deal-memos/:id/rtw-documents
 */
export const getRtwDocuments = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id)
    .populate('rightToWork.documents.requestedBy', 'firstName lastName')
    .populate('rightToWork.documents.uploadedBy', 'firstName lastName')
    .populate('rightToWork.documents.verifiedBy', 'firstName lastName');
  if (!deal) throw new AppError('Deal memo not found.', 404);

  res.json({
    success: true,
    data: {
      status: deal.rightToWork?.status || 'pending',
      rtwDocType: deal.rightToWork?.rtwDocType,
      notes: deal.rightToWork?.notes,
      documents: deal.rightToWork?.documents || [],
    },
  });
});

/**
 * POST /api/deal-memos/:id/rtw-documents
 * Admin adds a document request.
 */
export const addRtwDocumentRequest = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  const { docType, reference, expiryDate, required = true } = req.body;
  if (!docType) throw new AppError('Document type is required.', 400);

  if (!deal.rightToWork) deal.rightToWork = { status: 'pending', documents: [] };
  if (!deal.rightToWork.documents) deal.rightToWork.documents = [];

  deal.rightToWork.documents.push({
    docType, reference: reference || '', expiryDate: expiryDate || null,
    required, status: 'requested', requestedBy: req.user._id, requestedAt: new Date(),
  });

  await deal.save();
  res.status(201).json({ success: true, data: deal.rightToWork });
});

/**
 * POST /api/deal-memos/:id/rtw-documents/:docIdx/upload
 * Crew uploads a file for a requested RTW document.
 */
export const uploadRtwDocument = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  if (deal.personId.toString() !== req.user._id.toString()) {
    throw new AppError('Only the assigned crew member can upload RTW documents.', 403);
  }

  const docIdx = parseInt(req.params.docIdx);
  if (!deal.rightToWork?.documents || docIdx >= deal.rightToWork.documents.length) {
    throw new AppError('Document index out of range.', 400);
  }
  if (!req.file) throw new AppError('No file uploaded.', 400);

  const doc = deal.rightToWork.documents[docIdx];
  doc.uploadedFile = req.file.originalname;
  doc.fileUrl = `/uploads/${req.file.filename}`;
  doc.fileSize = req.file.size;
  doc.uploadedBy = req.user._id;
  doc.uploadedAt = new Date();
  doc.status = 'uploaded';
  if (req.body.reference) doc.reference = req.body.reference;
  if (req.body.expiryDate) doc.expiryDate = req.body.expiryDate;

  await deal.save();
  res.json({ success: true, data: doc });
});

/**
 * PATCH /api/deal-memos/:id/rtw-documents/:docIdx/verify
 * Admin verifies or rejects a crew-uploaded document.
 */
export const verifyRtwDocument = asyncHandler(async (req, res) => {
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  const docIdx = parseInt(req.params.docIdx);
  if (!deal.rightToWork?.documents || docIdx >= deal.rightToWork.documents.length) {
    throw new AppError('Document index out of range.', 400);
  }

  const { status, rejectionNote } = req.body;
  if (!['verified', 'rejected'].includes(status)) {
    throw new AppError('Status must be "verified" or "rejected".', 400);
  }

  const doc = deal.rightToWork.documents[docIdx];
  doc.status = status;
  if (status === 'verified') {
    doc.verifiedBy = req.user._id;
    doc.verifiedAt = new Date();
    doc.rejectionNote = undefined;
  } else {
    doc.rejectionNote = rejectionNote || 'Document rejected — please re-upload.';
  }

  // Auto-update RTW status if all required docs verified
  const requiredDocs = deal.rightToWork.documents.filter(d => d.required);
  const allVerified = requiredDocs.length > 0 && requiredDocs.every(d => d.status === 'verified');
  deal.rightToWork.status = allVerified ? 'verified' : 'pending';
  if (allVerified) {
    deal.rightToWork.verifiedBy = req.user._id;
    deal.rightToWork.verifiedAt = new Date();
  }

  await deal.save();
  res.json({ success: true, data: { document: doc, rtwStatus: deal.rightToWork.status } });
});

/**
 * POST /api/deal-memos/:id/countersign
 * Record a counter-signature on the deal memo.
 * Body: { signatureText, note }
 */
export const countersignDealMemo = asyncHandler(async (req, res) => {
  const { signatureText, note } = req.body;
  const deal = await DealMemo.findById(req.params.id);
  if (!deal) throw new AppError('Deal memo not found.', 404);

  if (!signatureText) throw new AppError('Signature text is required.', 400);

  // Record counter-signature
  if (!deal.counterSignatures) deal.counterSignatures = [];
  deal.counterSignatures.push({
    signedBy: req.user._id,
    signatureText,
    signedAt: new Date(),
    note: note || '',
  });

  await deal.save();
  res.json({ success: true, data: deal, message: 'Counter-signature recorded.' });
});
