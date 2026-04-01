import { useQuery, useMutation } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 1000 * 60 * 10; // 10 minutes

export function useUnions(country) {
  return useQuery({
    queryKey: ["rate-cards", "unions", country],
    queryFn: async () => {
      const { data } = await api.get("/rate-cards/unions");
      if (country) {
        return data.data.filter((u) => u.country === country);
      }
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

export function useBudgetTiers(unionId, country) {
  return useQuery({
    queryKey: ["rate-cards", "budget-tiers", unionId, country],
    queryFn: async () => {
      const { data } = await api.get("/rate-cards/budget-tiers", {
        params: { unionId },
      });
      if (country) {
        return data.data.filter((t) => t.country === country);
      }
      return data.data;
    },
    enabled: !!unionId,
    staleTime: STALE_TIME,
  });
}

export function useRateLookup() {
  return useMutation({
    mutationFn: async ({ unionId, departmentId, designationId, budgetTierId, dealType }) => {
      const { data } = await api.post("/rate-cards/lookup", {
        unionId,
        departmentId,
        designationId,
        budgetTierId,
        dealType, // if omitted, API returns all deal types
      });
      // data.data = primary rate card, data.variants = all deal types
      return { primary: data.data, variants: data.variants || [data.data] };
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
