import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
import { useEvent } from "../hooks/useEvent";
import { useMyTickets } from "../hooks/useMyTickets";
import { useTusdcStatus } from "../hooks/useTusdcStatus";
import { getContractClient } from "../lib/contract";
import { buildTrustlineTransaction, requestFaucet, submitSignedTransaction } from "../lib/usdc";
import { StatTile, StatTileSkeleton } from "../components/StatTile";
import { TicketCard } from "../components/TicketCard";
import { posthog } from "../lib/posthog";
import { FeedbackButton } from "../components/FeedbackButton";

export function EventPage() {
  const { address, connect, signTransaction } = useWallet();
  const event = useEvent();
  const myTickets = useMyTickets(address);
  const tusdc = useTusdcStatus(address);
  const queryClient = useQueryClient();
  const [actionError, setActionError] = useState<string | null>(null);

  const addTrustline = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect your wallet first");
      const xdr = await buildTrustlineTransaction(address);
      const { signedTxXdr } = await signTransaction(xdr);
      await submitSignedTransaction(signedTxXdr);
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["tusdcStatus", address] });
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const faucet = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect your wallet first");
      const result = await requestFaucet(address);
      if (!result.ok) throw new Error(result.message);
    },
    onSuccess: () => {
      setActionError(null);
      queryClient.invalidateQueries({ queryKey: ["tusdcStatus", address] });
    },
    onError: (err: Error) => setActionError(err.message),
  });

  const buyTicket = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect your wallet first");
      const client = getContractClient({ publicKey: address, signTransaction });
      const tx = await client.buy_ticket({ buyer: address });
      const sent = await tx.signAndSend();
      return sent.result.unwrap();
    },
    onSuccess: (ticketId) => {
      setActionError(null);
      posthog.capture("ticket_purchased", { ticket_id: ticketId, address });
      queryClient.invalidateQueries({ queryKey: ["event"] });
      queryClient.invalidateQueries({ queryKey: ["myTickets", address] });
    },
    onError: (err: Error) => setActionError(err.message),
  });

  if (event.isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 w-64 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <StatTileSkeleton />
          <StatTileSkeleton />
          <StatTileSkeleton />
        </div>
      </div>
    );
  }

  if (event.isError) {
    return (
      <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300">
        Couldn't load the event: {(event.error as Error).message}
      </div>
    );
  }

  const e = event.data!;
  const remaining = e.total_supply - e.tickets_sold;
  const soldOut = remaining <= 0;
  const ownedTickets = myTickets.data ?? [];
  const priceDisplay = (Number(e.ticket_price) / 1e7).toString();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100 sm:text-3xl">
          {e.name}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {priceDisplay} TUSDC per ticket · issued and verified on Stellar
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        <StatTile label="Sold" value={e.tickets_sold} />
        <StatTile label="Remaining" value={remaining} />
        <StatTile label="Checked in" value={e.tickets_checked_in} />
      </div>

      {ownedTickets.length > 0 && (
        <section>
          <h2 className="mb-3 text-lg font-semibold text-slate-900 dark:text-slate-100">
            My Tickets
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {ownedTickets.map((t) => (
              <TicketCard key={t.id} ticketId={t.id} used={t.used} eventName={e.name} />
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-slate-200 bg-white p-5 dark:border-slate-800 dark:bg-slate-900">
        {!address && (
          <div className="text-center">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              Connect a wallet to buy a ticket.
            </p>
            <button
              type="button"
              onClick={connect}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
            >
              Connect Wallet
            </button>
          </div>
        )}

        {address && soldOut && (
          <p className="text-center text-sm font-medium text-slate-600 dark:text-slate-400">
            This event is sold out.
          </p>
        )}

        {address && !soldOut && tusdc.isLoading && (
          <div className="h-10 animate-pulse rounded bg-slate-200 dark:bg-slate-800" />
        )}

        {address && !soldOut && tusdc.data && !tusdc.data.hasTrustline && (
          <div className="text-center">
            <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
              First, add a trustline so your wallet can hold test USDC (TUSDC).
            </p>
            <button
              type="button"
              onClick={() => addTrustline.mutate()}
              disabled={addTrustline.isPending}
              className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
            >
              {addTrustline.isPending ? "Adding trustline…" : "Add TUSDC trustline"}
            </button>
          </div>
        )}

        {address &&
          !soldOut &&
          tusdc.data?.hasTrustline &&
          Number(tusdc.data.balance) < Number(priceDisplay) && (
            <div className="text-center">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Your balance is {tusdc.data.balance} TUSDC. Grab test funds from the faucet to
                complete a purchase.
              </p>
              <button
                type="button"
                onClick={() => faucet.mutate()}
                disabled={faucet.isPending}
                className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
              >
                {faucet.isPending ? "Requesting…" : "Get test funds"}
              </button>
            </div>
          )}

        {address &&
          !soldOut &&
          tusdc.data?.hasTrustline &&
          Number(tusdc.data.balance) >= Number(priceDisplay) && (
            <div className="text-center">
              <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
                Balance: {tusdc.data.balance} TUSDC
              </p>
              <button
                type="button"
                onClick={() => buyTicket.mutate()}
                disabled={buyTicket.isPending}
                className="rounded-lg bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
              >
                {buyTicket.isPending ? "Buying…" : `Buy Ticket · ${priceDisplay} TUSDC`}
              </button>
            </div>
          )}

        {actionError && (
          <p className="mt-3 text-center text-sm text-red-600 dark:text-red-400">{actionError}</p>
        )}
      </section>

      <div className="text-center">
        <FeedbackButton />
      </div>
    </div>
  );
}
