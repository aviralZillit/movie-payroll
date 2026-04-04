import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Mongoose models before importing the module under test
// We need chainable .sort().populate().populate()... that ultimately resolves via await
vi.mock('../models/index.js', () => {
  // Creates a thenable chain object: every method returns itself, and
  // .then() resolves to `resolveValue` so `await chain` works.
  const createChain = (resolveValue) => {
    const chain = {
      sort: vi.fn(),
      populate: vi.fn(),
      then: (resolve) => resolve(resolveValue),
    };
    chain.sort.mockReturnValue(chain);
    chain.populate.mockReturnValue(chain);
    return chain;
  };

  const rateCardChain = createChain(null);
  const overtimeRuleChain = createChain([]);

  return {
    RateCard: {
      findOne: vi.fn().mockReturnValue(rateCardChain),
      _mockChain: rateCardChain,
    },
    OvertimeRule: {
      find: vi.fn().mockReturnValue(overtimeRuleChain),
      _mockChain: overtimeRuleChain,
    },
  };
});

import { validateRate, lookupRate, getOvertimeRules } from '../services/rateEngine.js';
import { RateCard, OvertimeRule } from '../models/index.js';

// ---------------------------------------------------------------------------
// validateRate
// ---------------------------------------------------------------------------
describe('validateRate', () => {
  it('proposed >= minimum: valid', () => {
    const result = validateRate(30, 25);

    expect(result.isValid).toBe(true);
    expect(result.proposed).toBe(30);
    expect(result.minimum).toBe(25);
    expect(result.difference).toBe(5);
    expect(result.warningMessage).toBeNull();
  });

  it('proposed === minimum: valid', () => {
    const result = validateRate(25, 25);

    expect(result.isValid).toBe(true);
    expect(result.difference).toBe(0);
    expect(result.warningMessage).toBeNull();
  });

  it('proposed < minimum: invalid with warning', () => {
    const result = validateRate(20, 25);

    expect(result.isValid).toBe(false);
    expect(result.proposed).toBe(20);
    expect(result.minimum).toBe(25);
    expect(result.difference).toBe(-5);
    expect(result.warningMessage).toContain('below the minimum');
    expect(result.warningMessage).toContain('20.00');
    expect(result.warningMessage).toContain('25.00');
    expect(result.warningMessage).toContain('5.00');
  });

  it('proposed = 0, minimum > 0: invalid', () => {
    const result = validateRate(0, 25);

    expect(result.isValid).toBe(false);
    expect(result.proposed).toBe(0);
    expect(result.difference).toBe(-25);
    expect(result.warningMessage).toContain('below the minimum');
  });

  it('both zero: valid (0 >= 0)', () => {
    const result = validateRate(0, 0);

    expect(result.isValid).toBe(true);
    expect(result.warningMessage).toBeNull();
  });

  it('string numbers are coerced correctly', () => {
    const result = validateRate('30.50', '25.00');

    expect(result.isValid).toBe(true);
    expect(result.proposed).toBe(30.50);
    expect(result.minimum).toBe(25.00);
  });

  it('throws on non-numeric proposed', () => {
    expect(() => validateRate('abc', 25)).toThrow('Rates must be valid numbers');
  });

  it('throws on non-numeric minimum', () => {
    expect(() => validateRate(30, 'xyz')).toThrow('Rates must be valid numbers');
  });

  it('proposed slightly above minimum: valid', () => {
    const result = validateRate(25.01, 25.00);
    expect(result.isValid).toBe(true);
  });

  it('proposed slightly below minimum: invalid', () => {
    const result = validateRate(24.99, 25.00);
    expect(result.isValid).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// lookupRate (mocked DB)
// ---------------------------------------------------------------------------
describe('lookupRate', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls RateCard.findOne with correct query shape', async () => {
    await lookupRate({
      unionId: 'u1',
      departmentId: 'd1',
      designationId: 'des1',
      budgetTierId: 'bt1',
      date: '2024-06-15',
    });

    expect(RateCard.findOne).toHaveBeenCalled(); // May be called twice due to tier fallback
    const query = RateCard.findOne.mock.calls[0][0];
    expect(query.unionId).toBe('u1');
    expect(query.departmentId).toBe('d1');
    expect(query.designationId).toBe('des1');
    expect(query.budgetTierId).toBe('bt1');
    expect(query.isActive).toBe(true);
  });

  it('returns null when no rate card found', async () => {
    const result = await lookupRate({
      unionId: 'u1',
      departmentId: 'd1',
      designationId: 'des1',
      budgetTierId: 'bt1',
    });

    expect(result).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// getOvertimeRules (mocked DB)
// ---------------------------------------------------------------------------
describe('getOvertimeRules', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls OvertimeRule.find with correct query', async () => {
    await getOvertimeRules('union-1', 'dept-1');

    expect(OvertimeRule.find).toHaveBeenCalledOnce();
    const query = OvertimeRule.find.mock.calls[0][0];
    expect(query.unionId).toBe('union-1');
    expect(query.isActive).toBe(true);
  });

  it('returns empty array when no rules found', async () => {
    const result = await getOvertimeRules('union-1', 'dept-1');
    expect(result).toEqual([]);
  });
});
