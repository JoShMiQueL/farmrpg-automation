import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "../api";

export function useCatchFish() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ locationId, baitId }: { locationId: number; baitId: number }) =>
      apiClient.catchFish(locationId, baitId),
    onSuccess: () => {
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ["player", "stats"] });
    },
  });
}

export function useBaitInfo(locationId?: number) {
  return useQuery({
    queryKey: ["fishing", "bait", locationId],
    queryFn: () => apiClient.getBaitInfo(locationId),
  });
}
