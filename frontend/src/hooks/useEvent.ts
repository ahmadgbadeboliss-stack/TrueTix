import { useQuery } from "@tanstack/react-query";
import { getContractClient } from "../lib/contract";

export function useEvent() {
  return useQuery({
    queryKey: ["event"],
    queryFn: async () => {
      const client = getContractClient();
      const tx = await client.get_event();
      return tx.result.unwrap();
    },
    // Ticket counts change as people buy/check in; keep the dashboard and
    // event page reasonably live without hammering the RPC endpoint.
    refetchInterval: 10_000,
  });
}
