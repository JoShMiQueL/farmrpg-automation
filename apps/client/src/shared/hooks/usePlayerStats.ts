import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export function usePlayerStats() {
  return useQuery({
    queryKey: ["player", "stats"],
    queryFn: () => apiClient.getPlayerStats(),
  });
}
