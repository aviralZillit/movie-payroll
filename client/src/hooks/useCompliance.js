import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useComplianceCards(territory, unionKey) {
  return useQuery({
    queryKey: ["compliance", "cards", territory, unionKey],
    queryFn: async () => {
      const { data } = await api.get("/compliance/cards", { params: { territory, unionKey } });
      return data.data;
    },
    enabled: !!territory,
    staleTime: 10 * 60 * 1000,
  });
}

export function useComplianceChecklist(territory) {
  return useQuery({
    queryKey: ["compliance", "checklist", territory],
    queryFn: async () => {
      const { data } = await api.get("/compliance/checklist", { params: { territory } });
      return data.data;
    },
    enabled: !!territory,
    staleTime: 10 * 60 * 1000,
  });
}
