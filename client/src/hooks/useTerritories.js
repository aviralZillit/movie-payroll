import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 10 * 60 * 1000; // 10 minutes — territories rarely change

// ── List all territories ─────────────────────────────────────────────
export function useTerritories() {
  return useQuery({
    queryKey: ["territories"],
    queryFn: async () => {
      const { data } = await api.get("/territories");
      return data.data;
    },
    staleTime: STALE_TIME,
  });
}

// ── Get single territory with rules ──────────────────────────────────
export function useTerritory(code) {
  return useQuery({
    queryKey: ["territories", code],
    queryFn: async () => {
      const { data } = await api.get(`/territories/${code}`);
      return data.data;
    },
    enabled: !!code,
    staleTime: STALE_TIME,
  });
}

// ── Get territory rules ──────────────────────────────────────────────
export function useTerritoryRules(code) {
  return useQuery({
    queryKey: ["territories", code, "rules"],
    queryFn: async () => {
      const { data } = await api.get(`/territories/${code}/rules`);
      return data.data;
    },
    enabled: !!code,
    staleTime: STALE_TIME,
  });
}

// ── Get specific agreement rule ──────────────────────────────────────
export function useTerritoryRule(code, unionKey) {
  return useQuery({
    queryKey: ["territories", code, "rules", unionKey],
    queryFn: async () => {
      const { data } = await api.get(`/territories/${code}/rules/${unionKey}`);
      return data.data;
    },
    enabled: !!code && !!unionKey,
    staleTime: STALE_TIME,
  });
}

// ── Get deal memo defaults from territory rule ───────────────────────
export function useDealMemoDefaults(territory, unionKey) {
  return useQuery({
    queryKey: ["deal-memo-defaults", territory, unionKey],
    queryFn: async () => {
      // Look up territory rule and derive defaults
      const { data } = await api.get(`/territories/${territory}/rules/${unionKey}`);
      const rule = data.data;
      if (!rule) return null;

      return {
        standardWorkDayHrs: rule.basicHrs || 10,
        lunchBreakHrs: 1,
        otRate1x5Multiplier: rule.ot1Multiplier || 1.5,
        otRate2xMultiplier: rule.ot2Multiplier || 2.0,
        goldenTimeEnabled: !!rule.goldenTimeMultiplier,
        goldenTimeAfterHours: rule.goldenTimeAfterHours,
        otRateCap: rule.otRateCap,
        sixthDayMultiplier: rule.sixthDayMultiplier || 1.5,
        seventhDayMultiplier: rule.seventhDayMultiplier || 2.0,
        hpMode: rule.hpMode || 'excl',
        holidayPayPct: rule.holidayPayPct || 0,
        nightPremiumPct: rule.nightPremiumValue ? rule.nightPremiumValue / 100 : 0,
        nightStartTime: rule.nightStartTime || '23:00',
        mealPenaltyAfterHrs: rule.mealIntervalHrs || 6,
        mealPenaltyAmounts: rule.mealPenaltyAmounts || [35],
        mealPaidStatus: rule.mealPaidStatus || 'unpaid',
        turnaroundMinHrs: rule.turnaroundMinHrs || 11,
        unionPensionPct: rule.rfPensionPct || 0.03,
        hwPerHour: rule.rfHwPerHour || 0,
        kitAllowance: rule.rfKitDefault || 0,
        perDiemRate: rule.rfPerDiemDefault || 0,
        perDiemMandatory: rule.rfPerDiemMandatory || false,
        workingDayTypes: rule.workingDayTypes || [],
        specialProvisions: rule.specialProvisions || [],
      };
    },
    enabled: !!territory && !!unionKey,
    staleTime: STALE_TIME,
  });
}
