import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/**
 * Fetch crew timeline data — all weeks for a crew member on a production.
 * Returns phases, cumulative earnings, stats, and per-week breakdowns.
 */
export function useCrewTimeline(crewId, productionId) {
  return useQuery({
    queryKey: ["crew-timeline", crewId, productionId],
    queryFn: async () => {
      const { data } = await api.get(`/portal/${crewId}/production/${productionId}`);
      return data.data;
    },
    enabled: !!crewId && !!productionId,
    staleTime: 30_000,
  });
}

/**
 * Fetch all productions for a crew member (to show production selector).
 */
export function useCrewProductions(crewId) {
  return useQuery({
    queryKey: ["crew-productions", crewId],
    queryFn: async () => {
      const { data } = await api.get(`/timecards?ownerId=${crewId}&limit=200`);
      // Extract unique productions from timecards
      const prodMap = {};
      (data.data || []).forEach((tc) => {
        const prod = tc.productionId;
        if (prod && !prodMap[prod._id]) {
          prodMap[prod._id] = { id: prod._id, name: prod.name, code: prod.code, country: prod.country };
        }
      });
      return Object.values(prodMap);
    },
    enabled: !!crewId,
  });
}
