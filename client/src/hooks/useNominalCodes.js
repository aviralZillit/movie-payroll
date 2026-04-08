import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";

/**
 * Fetch the designation → budget code mapping for a given designation and department.
 */
export function useDesignationCodeMap(designationName, departmentName) {
  return useQuery({
    queryKey: ["nominal-code-map", designationName, departmentName],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (designationName) params.set("designation", designationName);
      if (departmentName) params.set("department", departmentName);
      const { data } = await api.get(`/nominal-codes/map?${params}`);
      return data.data || data;
    },
    enabled: !!designationName,
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes
  });
}

/**
 * Fetch all nominal codes (for reference/lookup).
 */
export function useNominalCodes(filters = {}) {
  return useQuery({
    queryKey: ["nominal-codes", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.type) params.set("type", filters.type);
      if (filters.category) params.set("category", filters.category);
      if (filters.isCategory) params.set("isCategory", "true");
      const { data } = await api.get(`/nominal-codes?${params}`);
      return data.data || data;
    },
    staleTime: 1000 * 60 * 60, // Cache for 1 hour
  });
}
