import { ContractingEntity } from '../models/index.js';
import asyncHandler from '../utils/asyncHandler.js';

export const getByProduction = asyncHandler(async (req, res) => {
  const entities = await ContractingEntity.find({
    productionId: req.query.productionId,
    isActive: true,
  }).sort({ isPrimary: -1, name: 1 }).lean();

  res.json({ success: true, data: entities });
});

export const create = asyncHandler(async (req, res) => {
  const entity = await ContractingEntity.create(req.body);
  res.status(201).json({ success: true, data: entity });
});
