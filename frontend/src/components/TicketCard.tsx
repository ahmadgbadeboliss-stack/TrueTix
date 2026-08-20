import { useState } from "react";

export function TicketCard({
  ticketId,
  used,
  eventName,
  ownerAddress,
}: {
  ticketId: number;
  used: boolean;
  eventName: string;
  ownerAddress: string;
}) {
  const [copied, setCopied] = useState(false);

  async function copyAddress() {
    try {
      await navigator.clipboard.writeText(ownerAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // Clipboard API can be unavailable (e.g. insecure context); the full
      // address is already shown on the card as a fallback.
    }
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
      <div className="flex items-center justify-between bg-slate-900 px-4 py-3 text-white dark:bg-slate-800">
        <span className="text-sm font-medium">TrueTix</span>
        <span
          className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
            used ? "bg-slate-600 text-slate-200" : "bg-emerald-500 text-emerald-950"
          }`}
        >
          {used ? "Used" : "Valid"}
        </span>
      </div>
      <div className="p-4">
        <div className="text-lg font-semibold text-slate-900 dark:text-slate-100">{eventName}</div>
        <div className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          Ticket #{ticketId.toString().padStart(4, "0")}
        </div>

        <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-800">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
            Show this address at the door
          </div>
          <div className="mt-1 break-all font-mono text-xs text-slate-700 dark:text-slate-300">
            {ownerAddress}
          </div>
          <button
            type="button"
            onClick={copyAddress}
            className="mt-2 w-full rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            {copied ? "Copied!" : "Copy Address"}
          </button>
        </div>
      </div>
    </div>
  );
}
