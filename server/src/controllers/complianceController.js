import { buildComplianceCards, buildComplianceChecklist, getOutstandingFields } from '../services/complianceService.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getCards = asyncHandler(async (req, res) => {
  const { territory, unionKey } = req.query;
  const cards = buildComplianceCards(territory || 'UK', unionKey);
  res.json({ success: true, data: cards });
});

export const getChecklist = asyncHandler(async (req, res) => {
  const { territory } = req.query;
  const checklist = buildComplianceChecklist(territory || 'UK');
  res.json({ success: true, data: checklist });
});

export const getOutstanding = asyncHandler(async (req, res) => {
  const { territory, employmentStatus } = req.query;
  const fields = getOutstandingFields(territory || 'UK', employmentStatus);
  res.json({ success: true, data: fields });
});
