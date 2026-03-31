import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

const STALE_TIME = 1000 * 60 * 5; // 5 minutes

/**
 * Fetch all rate cards with optional filters and pagination.
 * @param {Object} params - { unionCode, deptCode, budgetTierCode, search, page, limit }
 */
export function useAdminRateCards(params = {}) {
  return useQuery({
    queryKey: ["admin-rate-cards", params],
    queryFn: async () => {
      const { data } = await api.get("/admin/rate-cards", { params });
      return data;
    },
    staleTime: STALE_TIME,
    keepPreviousData: true,
  });
}

/**
 * Fetch aggregate summary stats for rate cards.
 */
export function useAdminRateCardsSummary() {
  return useQuery({
    queryKey: ["admin-rate-cards", "summary"],
    queryFn: async () => {
      const { data } = await api.get("/admin/rate-cards/summary");
      return data.data;
    },
    staleTime: STALE_TIME,
  });
}

/**
 * Update a rate card by ID.
 */
export function useUpdateRateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }) => {
      const { data } = await api.put(`/admin/rate-cards/${id}`, updates);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rate-cards"] });
    },
  });
}

/**
 * Create a new rate card.
 */
export function useCreateRateCard() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload) => {
      const { data } = await api.post("/admin/rate-cards", payload);
      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-rate-cards"] });
    },
  });
}
