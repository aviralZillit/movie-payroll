import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export function useUnions() {
  return useQuery({
    queryKey: ["rate-cards", "unions"],
    queryFn: async () => {
      const { data } = await api.get("/rate-cards/unions");
      return data.data;
    },
    staleTime: STALE_TIME,
  });
}

export function useDepartments(unionId) {
  return useQuery({
    queryKey: ["rate-cards", "departments", unionId],
    queryFn: async () => {
      const { data } = await api.get(
        `/rate-cards/unions/${unionId}/departments`
      );
      return data.data;
    },
    enabled: !!unionId,
    staleTime: STALE_TIME,
  });
}

export function useDesignations(departmentId) {
  return useQuery({
    queryKey: ["rate-cards", "designations", departmentId],
    queryFn: async () => {
      const { data } = await api.get(
        `/rate-cards/departments/${departmentId}/designations`
      );
      return data.data;
    },
    enabled: !!departmentId,
    staleTime: STALE_TIME,
  });
}

export function useBudgetTiers(unionId) {
  return useQuery({
    queryKey: ["rate-cards", "budget-tiers", unionId],
    queryFn: async () => {
      const { data } = await api.get("/rate-cards/budget-tiers", {
        params: { unionId },
      });
      return data.data;
    },
    enabled: !!unionId,
    staleTime: STALE_TIME,
  });
}

export function useRateLookup() {
  return useMutation({
    mutationFn: async ({ unionId, departmentId, designationId, budgetTierId }) => {
      const { data } = await api.post("/rate-cards/lookup", {
        unionId,
        departmentId,
        designationId,
        budgetTierId,
      });
      return data.data;
    },
  });
}

export function useOvertimeRules(unionId) {
  return useQuery({
    queryKey: ["rate-cards", "overtime-rules", unionId],
    queryFn: async () => {
      const { data } = await api.get(`/rate-cards/unions/${unionId}/overtime-rules`);
      return data.data;
    },
    enabled: !!unionId,
    staleTime: STALE_TIME,
  });
}
