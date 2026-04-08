import { Production, ProductionSettings } from '../models/index.js';
import { getDefaultsForCountry } from '../config/onboardingDefaults.js';
import asyncHandler from '../utils/asyncHandler.js';
import AppError from '../utils/AppError.js';

/**
 * GET /api/productions/:id/settings/onboarding
 * Return onboarding requirements for a production.
 * If the production has custom overrides, use those; otherwise fall back
 * to country defaults from onboardingDefaults config.
 */
export const getOnboardingRequirements = asyncHandler(async (req, res) => {
  const production = await Production.findById(req.params.id);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  const settings = await ProductionSettings.findOne({ productionId: production._id });

  // If settings exist and onboardingRequirements array is non-empty, use those
  if (settings?.onboardingRequirements?.length > 0) {
    return res.json({
      success: true,
      data: {
        requirements: settings.onboardingRequirements,
        isCustomized: true,
      },
    });
  }

  // Otherwise return defaults based on the production's country
  const defaults = getDefaultsForCountry(production.country);

  res.json({
    success: true,
    data: {
      requirements: defaults,
      isCustomized: false,
    },
  });
});

/**
 * PUT /api/productions/:id/settings/onboarding
 * Save custom onboarding requirements for a production.
 * Body: { requirements: [{ key, label, category, required, isCustom }] }
 * Only admin roles can save (enforced by route middleware).
 */
export const saveOnboardingRequirements = asyncHandler(async (req, res) => {
  const { requirements } = req.body;

  if (!Array.isArray(requirements)) {
    throw new AppError('requirements must be an array.', 400);
  }

  const production = await Production.findById(req.params.id);
  if (!production) {
    throw new AppError('Production not found.', 404);
  }

  // Upsert production settings with the new onboarding requirements
  const settings = await ProductionSettings.findOneAndUpdate(
    { productionId: production._id },
    { $set: { onboardingRequirements: requirements } },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({
    success: true,
    data: {
      requirements: settings.onboardingRequirements,
      isCustomized: true,
    },
  });
});

/**
 * GET /api/productions/:id/settings
 * Get all production settings.
 */
export const getProductionSettings = asyncHandler(async (req, res) => {
  let settings = await ProductionSettings.findOne({ productionId: req.params.id });
  if (!settings) {
    settings = { bureauContacts: [], onboardingRequirements: [], dayTypes: [] };
  }
  res.json({ success: true, data: settings });
});

/**
 * PUT /api/productions/:id/settings
 * Update production settings (partial — only updates fields provided).
 */
export const updateProductionSettings = asyncHandler(async (req, res) => {
  const updates = {};
  if (req.body.bureauContacts !== undefined) updates.bureauContacts = req.body.bureauContacts;
  if (req.body.dayTypes !== undefined) updates.dayTypes = req.body.dayTypes;
  if (req.body.workingDayType !== undefined) updates.workingDayType = req.body.workingDayType;
  if (req.body.onboardingRequirements !== undefined) updates.onboardingRequirements = req.body.onboardingRequirements;

  const settings = await ProductionSettings.findOneAndUpdate(
    { productionId: req.params.id },
    { $set: updates },
    { new: true, upsert: true, runValidators: true }
  );

  res.json({ success: true, data: settings });
});
