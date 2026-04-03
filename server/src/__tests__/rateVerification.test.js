import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import mongoose from 'mongoose';
import { RateBibleEntry } from '../models/index.js';
import { verifyRate, searchRates } from '../services/rateVerificationService.js';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/payroll-test';
let connected = false;

describe('rateVerificationService', () => {
  beforeAll(async () => {
    try {
      if (mongoose.connection.readyState === 0) {
        await mongoose.connect(MONGODB_URI);
      }
      // Seed test data if not present
      const count = await RateBibleEntry.countDocuments({ agreementId: 'uk-cam' });
      if (count === 0) {
        await RateBibleEntry.create({
          territoryCode: 'uk', agreementId: 'uk-cam',
          agreementName: 'Test Camera Branch', union: 'BECTU', type: 'crew',
          status: 'confirmed', access: 'public', effectiveFrom: new Date('2025-01-01'),
          sourceUrl: 'https://test.com',
          rates: [
            { grade: 'DOP', primaryRate: 'Ind. Neg.', isIndividuallyNegotiated: true, budgetTier: 'MMP' },
            { grade: 'Camera Operator', primaryRate: '4,038/50hr', weeklyRate: 4038, dailyRate: 808, budgetTier: 'MMP £30m+', dealType: '50hr_week' },
          ],
        });
      }
      connected = true;
    } catch (e) {
      console.warn('Skipping rate verification tests — no MongoDB:', e.message);
    }
  });

  afterAll(async () => {
    if (connected && mongoose.connection.readyState) {
      await mongoose.disconnect();
    }
  });

  beforeEach(() => {
    if (!connected) return;
  });

  describe('verifyRate', () => {
    it('returns compliant for rate >= minimum', async () => {
      if (!mongoose.connection.readyState) return;
      const result = await verifyRate({
        territoryCode: 'uk',
        agreementId: 'uk-cam',
        grade: 'Camera Operator',
        budgetTier: 'MMP',
        proposedWeeklyRate: 4038,
      });
      expect(result.isCompliant).toBe(true);
      expect(result.minimum).toBe(4038);
      expect(result.difference).toBe(0);
    });

    it('returns non-compliant for rate below minimum', async () => {
      if (!mongoose.connection.readyState) return;
      const result = await verifyRate({
        territoryCode: 'uk',
        agreementId: 'uk-cam',
        grade: 'Camera Operator',
        budgetTier: 'MMP',
        proposedWeeklyRate: 3500,
      });
      expect(result.isCompliant).toBe(false);
      expect(result.difference).toBe(-538);
      expect(result.warning).toContain('below');
    });

    it('returns Ind. Neg. for DOP', async () => {
      if (!mongoose.connection.readyState) return;
      const result = await verifyRate({
        territoryCode: 'uk',
        agreementId: 'uk-cam',
        grade: 'DOP',
        proposedWeeklyRate: 10000,
      });
      expect(result.isIndividuallyNegotiated).toBe(true);
    });

    it('handles missing agreement gracefully', async () => {
      if (!mongoose.connection.readyState) return;
      const result = await verifyRate({
        territoryCode: 'zz',
        agreementId: 'nonexistent',
        grade: 'Test',
        proposedWeeklyRate: 1000,
      });
      expect(result.isCompliant).toBe(true);
      expect(result.warning).toBeTruthy();
    });
  });

  describe('searchRates', () => {
    it('finds Camera Operator across territories', async () => {
      if (!mongoose.connection.readyState) return;
      const results = await searchRates({ query: 'Camera Operator' });
      expect(results.length).toBeGreaterThan(0);
      expect(results.some(r => r.territory === 'uk')).toBe(true);
    });

    it('filters by territory', async () => {
      if (!mongoose.connection.readyState) return;
      const results = await searchRates({ query: 'Camera', territoryCode: 'us' });
      expect(results.every(r => r.territory === 'us')).toBe(true);
    });
  });
});
