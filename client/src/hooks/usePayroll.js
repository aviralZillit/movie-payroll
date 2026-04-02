import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 1000 * 60 * 5;

// ── List payroll runs ─────────────────────────────────────────────────
export function usePayrollRuns(filters = {}) {
  const { productionId, status, page = 1, limit = 20 } = filters;

  return useQuery({
    queryKey: ["payroll-runs", { productionId, status, page, limit }],
    queryFn: async () => {
      const params = { page, limit };
      if (productionId) params.productionId = productionId;
      if (status) params.status = status;

      const { data } = await api.get("/payroll", { params });
      return data;
    },
    staleTime: STALE_TIME,
  });
}

// ── Single payroll run ────────────────────────────────────────────────
export function usePayrollRun(id) {
  return useQuery({
    queryKey: ["payroll-runs", id],
    queryFn: async () => {
      const { data } = await api.get(`/payroll/${id}`);
      return data.data;
    },
    enabled: !!id,
    staleTime: STALE_TIME,
  });
}

// ── Create payroll run ────────────────────────────────────────────────
export function useCreatePayrollRun() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ productionId, weekStarting, weekEnding }) => {
      const { data } = await api.post("/payroll", { productionId, weekStarting, weekEnding });
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}

// ── Calculate payroll run ─────────────────────────────────────────────
export function useCalculatePayroll(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/payroll/${id}/calculate`);
      return data.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(["payroll-runs", id], (old) => ({
        ...old,
        ...data,
      }));
    },
  });
}

// ── Approve payroll run ───────────────────────────────────────────────
export function useApprovePayroll(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/payroll/${id}/approve`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs", id] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}

// ── Mark payroll as paid ──────────────────────────────────────────────
export function useMarkPayrollPaid(id) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/payroll/${id}/mark-paid`);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["payroll-runs", id] });
      queryClient.invalidateQueries({ queryKey: ["payroll-runs"] });
    },
  });
}

// ── Export payroll CSV ────────────────────────────────────────────────
export function useExportPayrollCSV(id) {
  return useMutation({
    mutationFn: async () => {
      const { data } = await api.get(`/payroll/${id}/export`, {
        responseType: "blob",
      });
      // Trigger browser download
      const url = window.URL.createObjectURL(new Blob([data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `payroll-${id}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    },
  });
}

// ── Payroll dashboard stats ───────────────────────────────────────────
export function usePayrollStats() {
  return useQuery({
    queryKey: ["payroll-stats"],
    queryFn: async () => {
      const { data } = await api.get("/payroll/stats");
      return data.data;
    },
    staleTime: STALE_TIME,
  });
}

// ── Payroll trend data (weekly) ───────────────────────────────────────
export function usePayrollTrend(weeks = 8) {
  return useQuery({
    queryKey: ["payroll-trend", weeks],
    queryFn: async () => {
      const { data } = await api.get("/payroll/trend", { params: { weeks } });
      return data.data;
    },
    staleTime: 1000 * 60 * 10,
  });
}
