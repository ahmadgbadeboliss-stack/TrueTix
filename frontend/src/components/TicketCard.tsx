export function TicketCard({
  ticketId,
  used,
  eventName,
}: {
  ticketId: number;
  used: boolean;
  eventName: string;
}) {
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
      </div>
    </div>
  );
}
