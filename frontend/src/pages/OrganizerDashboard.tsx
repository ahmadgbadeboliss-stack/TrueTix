import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useWallet } from "../hooks/useWallet";
import { useEvent } from "../hooks/useEvent";
import { getContractClient } from "../lib/contract";
import { ORGANIZER_ADDRESS, TUSDC_SAC_ID } from "../lib/env";
import { StatTile, StatTileSkeleton } from "../components/StatTile";
import { posthog } from "../lib/posthog";

function CreateEventForm({ onCreated }: { onCreated: () => void }) {
  const { address, signTransaction } = useWallet();
  const [name, setName] = useState("");
  const [price, setPrice] = useState("5");
  const [supply, setSupply] = useState("20");
  const [error, setError] = useState<string | null>(null);

  const createEvent = useMutation({
    mutationFn: async () => {
      if (!address) throw new Error("Connect your wallet first");
      const client = getContractClient({ publicKey: address, signTransaction });
      const tx = await client.mint_tickets({
        organizer: address,
        name,
        ticket_price: BigInt(Math.round(Number(price) * 1e7)),
        total_supply: Number(supply),
        payment_token: TUSDC_SAC_ID,
      });
      const sent = await tx.signAndSend();
      sent.result.unwrap();
    },
    onSuccess: () => {
      setError(null);
      posthog.capture("event_created", { name, price, supply });
      onCreated();
    },
    onError: (err: Error) => setError(err.message),
  });

  return (
    <form
      className="mx-auto max-w-md space-y-4 rounded-2xl border border-slate-200 bg-white p-6 dark:border-slate-800 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault();
        createEvent.mutate();
      }}
    >
      <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Create Event</h2>
      <div>
        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
          Event name
        </label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        />
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Price (TUSDC)
          </label>
          <input
            required
            type="number"
            min="0.01"
            step="0.01"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Total supply
          </label>
          <input
            required
            type="number"
            min="1"
            step="1"
            value={supply}
            onChange={(e) => setSupply(e.target.value)}
            className="mt-1 w-full rounded-lg border border-slate-300 p-2 text-sm dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
          />
        </div>
      </div>
      <button
        type="submit"
        disabled={createEvent.isPending}
        className="w-full rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-50 dark:bg-slate-100 dark:text-slate-900"
      >
        {createEvent.isPending ? "Minting tickets…" : "Mint Tickets"}
      </button>
      {error && <p className="text-sm text-red-600 dark:text-red-400">{error}</p>}
    </form>
  );
}

export function OrganizerDashboard() {
  const { address, connect } = useWallet();
  const event = useEvent();
  const queryClient = useQueryClient();

  if (!address) {
    return (
      <div className="text-center">
        <p className="mb-3 text-sm text-slate-600 dark:text-slate-400">
          Connect the organizer wallet to view the dashboard.
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

  if (event.isLoading) {
    return (
      <div className="grid grid-cols-3 gap-3">
        <StatTileSkeleton />
        <StatTileSkeleton />
        <StatTileSkeleton />
      </div>
    );
  }

  const isNotInitialized = event.isError && (event.error as Error).message === "NotInitialized";

  if (isNotInitialized) {
    if (address !== ORGANIZER_ADDRESS) {
      return (
        <p className="text-center text-sm text-slate-600 dark:text-slate-400">
          No event has been created yet.
        </p>
      );
    }
    return (
      <CreateEventForm
        onCreated={() => queryClient.invalidateQueries({ queryKey: ["event"] })}
      />
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
  const isOrganizer = address === ORGANIZER_ADDRESS;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{e.name}</h1>
        {!isOrganizer && (
          <p className="mt-1 text-sm text-amber-600 dark:text-amber-400">
            Viewing as a non-organizer wallet — read-only.
          </p>
        )}
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Sold" value={e.tickets_sold} />
        <StatTile label="Remaining" value={remaining} />
        <StatTile label="Checked in" value={e.tickets_checked_in} />
        <StatTile label="Total supply" value={e.total_supply} />
      </div>

      <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
        <div>
          Organizer: <span className="font-mono text-xs">{e.organizer}</span>
        </div>
        <div>
          Price: {(Number(e.ticket_price) / 1e7).toString()} TUSDC
        </div>
      </div>
    </div>
  );
}
