import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { StrKey } from "@stellar/stellar-sdk";
import { useWallet } from "../hooks/useWallet";
import { useMyTickets } from "../hooks/useMyTickets";
import { getContractClient } from "../lib/contract";
import { ORGANIZER_ADDRESS } from "../lib/env";
import { posthog } from "../lib/posthog";

export function Scanner() {
  const { address, connect, signTransaction } = useWallet();
  const [lookup, setLookup] = useState("");
  const [queried, setQueried] = useState<string | undefined>(undefined);
  const tickets = useMyTickets(queried);
  const queryClient = useQueryClient();
  const isOrganizer = address === ORGANIZER_ADDRESS;

  const checkIn = useMutation({
    mutationFn: async (ticketId: number) => {
      if (!address) throw new Error("Connect the organizer wallet first");
      const client = getContractClient({ publicKey: address, signTransaction });
      const tx = await client.check_in({ caller: address, ticket_id: ticketId });
      const sent = await tx.signAndSend();
      sent.result.unwrap();
      return ticketId;
    },
    onSuccess: (ticketId) => {
      posthog.capture("ticket_checked_in", { ticket_id: ticketId, attendee: queried });
      queryClient.invalidateQueries({ queryKey: ["myTickets", queried] });
      queryClient.invalidateQueries({ queryKey: ["event"] });
    },
  });

  if (!address) {
    return (
      <div className="text-center">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Connect the organizer wallet to run the door scanner.
        </p>
        <button
          type="button"
          onClick={connect}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          Connect Wallet
        </button>
      </div>
    );
  }

  if (!isOrganizer) {
    return (
      <p className="text-center text-sm text-amber-600 dark:text-amber-400">
        Only the event organizer's wallet can check tickets in.
      </p>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Door Scanner</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Paste the attendee's wallet address to look up their ticket.
        </p>
      </div>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(e) => {
          e.preventDefault();
          if (!StrKey.isValidEd25519PublicKey(lookup.trim())) return;
          setQueried(lookup.trim());
        }}
      >
        <input
          value={lookup}
          onChange={(e) => setLookup(e.target.value)}
          placeholder="G..."
          className="flex-1 rounded-lg border border-slate-300 p-2 font-mono text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          Look up
        </button>
      </form>

      {queried && !StrKey.isValidEd25519PublicKey(lookup.trim()) && (
        <p className="text-sm text-red-600 dark:text-red-400">Not a valid Stellar address.</p>
      )}

      {queried && tickets.isLoading && (
        <div className="h-16 animate-pulse rounded-xl bg-slate-200 dark:bg-slate-800" />
      )}

      {queried && tickets.data && tickets.data.length === 0 && (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
          No ticket found for this wallet.
        </p>
      )}

      {queried && tickets.data && tickets.data.length > 0 && (
        <div className="space-y-3">
          {tickets.data.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900"
            >
              <div>
                <div className="font-medium text-slate-900 dark:text-slate-100">
                  Ticket #{t.id.toString().padStart(4, "0")}
                </div>
                <div
                  className={`text-sm font-semibold ${
                    t.used ? "text-slate-500" : "text-emerald-600 dark:text-emerald-400"
                  }`}
                >
                  {t.used ? "Already checked in" : "Valid — not yet used"}
                </div>
              </div>
              <button
                type="button"
                disabled={t.used || checkIn.isPending}
                onClick={() => checkIn.mutate(t.id)}
                className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {checkIn.isPending ? "Checking in…" : "Check In"}
              </button>
            </div>
          ))}
        </div>
      )}

      {checkIn.isError && (
        <p className="text-sm text-red-600 dark:text-red-400">
          {(checkIn.error as Error).message}
        </p>
      )}
    </div>
  );
}
