import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const dealMemoKeys = {
  all: ["deal-memos"],
  lists: () => [...dealMemoKeys.all, "list"],
  list: (filters) => [...dealMemoKeys.lists(), filters],
  details: () => [...dealMemoKeys.all, "detail"],
  detail: (id) => [...dealMemoKeys.details(), id],
};

// ---------------------------------------------------------------------------
// Fetch all deal memos (with optional filters)
// ---------------------------------------------------------------------------
export function useDealMemos(filters = {}) {
  return useQuery({
    queryKey: dealMemoKeys.list(filters),
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.status) params.append("status", filters.status);
      if (filters.productionId) params.append("productionId", filters.productionId);
      if (filters.union) params.append("union", filters.union);
      const { data } = await api.get(`/deal-memos?${params.toString()}`);
      return data.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch single deal memo
// ---------------------------------------------------------------------------
export function useDealMemo(id) {
  return useQuery({
    queryKey: dealMemoKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/deal-memos/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Create deal memo
// ---------------------------------------------------------------------------
export function useCreateDealMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/deal-memos", payload);
      return data.data;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: dealMemoKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Update deal memo
// ---------------------------------------------------------------------------
export function useUpdateDealMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, ...payload }) => {
      const { data } = await api.patch(`/deal-memos/${id}`, payload);
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: dealMemoKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: dealMemoKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Transition deal memo status (send, sign, activate, complete, cancel)
// ---------------------------------------------------------------------------
const ACTION_TO_STATUS = {
  send: 'sent',
  sign: 'signed',
  activate: 'active',
  complete: 'completed',
  cancel: 'cancelled',
};

export function useTransitionDealMemo() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, action, note }) => {
      const toStatus = ACTION_TO_STATUS[action] || action;
      const { data } = await api.patch(`/deal-memos/${id}/transition`, { toStatus, note });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: dealMemoKeys.detail(variables.id) });
      qc.invalidateQueries({ queryKey: dealMemoKeys.lists() });
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch productions for dropdown
// ---------------------------------------------------------------------------
export function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: async () => {
      const { data } = await api.get("/productions");
      return data.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Rate card lookup (cascading selects data)
// ---------------------------------------------------------------------------
export function useRateCardLookup() {
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await api.post("/rate-cards/lookup", params);
      return data.data;
    },
  });
}

// ---------------------------------------------------------------------------
// Validate a single rate against union minimums
// ---------------------------------------------------------------------------
export function useValidateRate() {
  return useMutation({
    mutationFn: async (params) => {
      const { data } = await api.post("/rate-cards/validate-rate", params);
      return data.data;
    },
  });
}
