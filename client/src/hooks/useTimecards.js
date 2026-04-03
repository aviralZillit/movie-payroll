import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

// ── List timecards with filters ───────────────────────────────────────
export function useTimecards(filters = {}) {
  const { productionId, weekEnding, status, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["timecards", { productionId, weekEnding, status, page, limit }],
    queryFn: async () => {
      const params = { page, limit };
      if (productionId) params.productionId = productionId;
      if (weekEnding) params.weekEnding = weekEnding;
      if (status) params.status = status;

      const { data } = await api.get("/timecards", { params });
      return data;
    },
    staleTime: STALE_TIME,
  });
}

// ── Single timecard detail ────────────────────────────────────────────
export function useTimecard(id) {
  return useQuery({
    queryKey: ["timecards", id],
    queryFn: async () => {
      const { data } = await api.get(`/timecards/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

// ── Update timecard entries (batch) ───────────────────────────────────
export function useUpdateTimecardEntries(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entries) => {
      const { data } = await api.put(`/timecards/${id}/entries`, { entries });
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["timecards", id], (old) => ({
        ...old,
        ...data,
      }));
    },
  });
}

// ── Calculate timecard (server-side OT calculation) ───────────────────
export function useCalculateTimecard(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/timecards/${id}/calculate`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["timecards", id], (old) => ({
        ...old,
        ...data,
      }));
    },
  });
}

// ── Submit timecard ───────────────────────────────────────────────────
export function useSubmitTimecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/timecards/${id}/submit`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", id] });
      queryClient.invalidateQueries({ queryKey: ["timecards"] });
    },
  });
}

// ── Approve timecard ──────────────────────────────────────────────────
export function useApproveTimecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/timecards/${id}/dept-approve`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", id] });
      queryClient.invalidateQueries({ queryKey: ["timecards"] });
    },
  });
}

// ── Payroll Approve timecard ──────────────────────────────────────────
export function usePayrollApproveTimecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id) => {
      const { data } = await api.patch(`/timecards/${id}/payroll-approve`);
      return data.data;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", id] });
      queryClient.invalidateQueries({ queryKey: ["timecards"] });
    },
  });
}

// ── Reject timecard ───────────────────────────────────────────────────
export function useRejectTimecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }) => {
      const { data } = await api.patch(`/timecards/${id}/reject`, { reason });
      return data.data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ["timecards", id] });
      queryClient.invalidateQueries({ queryKey: ["timecards"] });
    },
  });
}

// ── Create timecard ───────────────────────────────────────────────────
export function useCreateTimecard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/timecards", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["timecards"] });
    },
  });
}

// ── Productions list (for filters) ────────────────────────────────────
export function useProductions() {
  return useQuery({
    queryKey: ["productions"],
    queryFn: async () => {
      const { data } = await api.get("/productions");
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
