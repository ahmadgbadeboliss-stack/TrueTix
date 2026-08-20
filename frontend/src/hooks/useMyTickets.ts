import { useQuery } from "@tanstack/react-query";
import { getContractClient } from "../lib/contract";

export function useMyTickets(owner: string | undefined) {
  return useQuery({
    queryKey: ["myTickets", owner],
    enabled: !!owner,
    queryFn: async () => {
      const client = getContractClient();
      const idsTx = await client.get_my_tickets({ owner: owner! });
      const ids = idsTx.result;

      const tickets = await Promise.all(
        ids.map(async (id) => {
          const ticketTx = await client.get_ticket({ ticket_id: id });
          return { id, ...ticketTx.result.unwrap() };
        }),
      );
      return tickets;
    },
    refetchInterval: 10_000,
  });
}
