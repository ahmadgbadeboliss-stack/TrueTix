import { useQuery } from "@tanstack/react-query";
import { getTusdcStatus } from "../lib/usdc";

export function useTusdcStatus(address: string | undefined) {
  return useQuery({
    queryKey: ["tusdcStatus", address],
    enabled: !!address,
    queryFn: () => getTusdcStatus(address!),
    refetchInterval: 8_000,
  });
}
