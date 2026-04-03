import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 10 * 60 * 1000;

// ── List all bible entries (without rate rows — lightweight) ─────────
export function useRatesBibleList(filters = {}) {
  const { territory, status } = filters;
  return useQuery({
    queryKey: ["rates-bible", "list", filters],
    queryFn: async () => {
      const params = {};
      if (territory) params.territory = territory;
      if (status) params.status = status;
      const { data } = await api.get("/rates-bible", { params });
      return data.data;
    },
    staleTime: STALE_TIME,
  });
}

// ── Get all agreements for a territory (with full rate data) ─────────
export function useRatesBibleByTerritory(territoryCode) {
  return useQuery({
    queryKey: ["rates-bible", "territory", territoryCode],
    queryFn: async () => {
      const { data } = await api.get(`/rates-bible/territory/${territoryCode}`);
      return data.data;
    },
    enabled: !!territoryCode,
    staleTime: STALE_TIME,
  });
}

// ── Get a single agreement by ID (with full rate data) ───────────────
export function useRatesBibleEntry(agreementId) {
  return useQuery({
    queryKey: ["rates-bible", "entry", agreementId],
    queryFn: async () => {
      const { data } = await api.get(`/rates-bible/${agreementId}`);
      return data.data;
    },
    enabled: !!agreementId,
    staleTime: STALE_TIME,
  });
}

// ── Search rates across all territories ──────────────────────────────
export function useRatesSearch(query, filters = {}) {
  const { territory, union, budgetTier, limit } = filters;
  return useQuery({
    queryKey: ["rates-bible", "search", query, filters],
    queryFn: async () => {
      const params = { q: query };
      if (territory) params.territory = territory;
      if (union) params.union = union;
      if (budgetTier) params.budgetTier = budgetTier;
      if (limit) params.limit = limit;
      const { data } = await api.get("/rates-bible/search", { params });
      return data.data;
    },
    enabled: query?.length >= 2,
    staleTime: 30000,
  });
}

// ── Verify a rate against the bible ──────────────────────────────────
export function useVerifyRate() {
  return useMutation({
    mutationFn: async ({ territoryCode, agreementId, grade, budgetTier, proposedWeeklyRate }) => {
      const { data } = await api.post("/rates-bible/verify", {
        territoryCode,
        agreementId,
        grade,
        budgetTier,
        proposedWeeklyRate,
      });
      return data.data;
    },
  });
}
