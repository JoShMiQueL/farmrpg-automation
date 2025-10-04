import { useQuery } from "@tanstack/react-query";
import { apiClient } from "../api";

export function useInventory(category?: string) {
  return useQuery({
    queryKey: ["inventory", category],
    queryFn: () => apiClient.getInventory(category),
  });
}
