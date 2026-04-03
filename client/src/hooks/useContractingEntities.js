import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

export function useContractingEntities(productionId) {
  return useQuery({
    queryKey: ["contracting-entities", productionId],
    queryFn: async () => {
      const { data } = await api.get("/contracting-entities", { params: { productionId } });
      return data.data;
    },
    enabled: !!productionId,
    staleTime: 5 * 60 * 1000,
  });
}
