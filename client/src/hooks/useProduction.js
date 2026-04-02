import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/axios";

// ---------------------------------------------------------------------------
// Query keys
// ---------------------------------------------------------------------------
export const productionKeys = {
  all: ["productions"],
  details: () => [...productionKeys.all, "detail"],
  detail: (id) => [...productionKeys.details(), id],
};

// ---------------------------------------------------------------------------
// Fetch single production (with populated members)
// ---------------------------------------------------------------------------
export function useProduction(id) {
  return useQuery({
    queryKey: productionKeys.detail(id),
    queryFn: async () => {
      const { data } = await api.get(`/productions/${id}`);
      return data.data;
    },
    enabled: !!id,
  });
}

// ---------------------------------------------------------------------------
// Add member to production
// ---------------------------------------------------------------------------
export function useAddMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productionId, userId, role }) => {
      const { data } = await api.post(`/productions/${productionId}/members`, {
        userId,
        role,
      });
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: productionKeys.detail(variables.productionId) });
      qc.invalidateQueries({ queryKey: productionKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Remove member from production
// ---------------------------------------------------------------------------
export function useRemoveMember() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ productionId, userId }) => {
      const { data } = await api.delete(
        `/productions/${productionId}/members/${userId}`
      );
      return data.data;
    },
    onSuccess: (_data, variables) => {
      qc.invalidateQueries({ queryKey: productionKeys.detail(variables.productionId) });
      qc.invalidateQueries({ queryKey: productionKeys.all });
    },
  });
}

// ---------------------------------------------------------------------------
// Fetch all users (for Add Member dialog)
// ---------------------------------------------------------------------------
export function useAllUsers() {
  return useQuery({
    queryKey: ["users"],
    queryFn: async () => {
      const { data } = await api.get("/auth/users");
      // API returns { success, data: { users: [...] } }
      return data.data?.users || data.data || [];
    },
  });
}
