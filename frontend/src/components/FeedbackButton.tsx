import { useState } from "react";
import { posthog } from "../lib/posthog";
import { useWallet } from "../hooks/useWallet";

export function FeedbackButton() {
  const { address } = useWallet();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);

  if (sent) {
    return <p className="text-sm text-slate-500 dark:text-slate-400">Thanks for the feedback!</p>;
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm font-medium text-slate-500 underline underline-offset-2 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
      >
        Got feedback on this experience?
      </button>
    );
  }

  return (
    <form
      className="mx-auto flex max-w-md flex-col gap-2 rounded-xl border border-slate-200 bg-white p-4 text-left dark:border-slate-800 dark:bg-slate-900"
      onSubmit={(e) => {
        e.preventDefault();
        if (!message.trim()) return;
        posthog.capture("feedback_submitted", { message, address });
        setSent(true);
      }}
    >
      <label htmlFor="feedback" className="text-sm font-medium text-slate-700 dark:text-slate-300">
        What worked, what didn't?
      </label>
      <textarea
        id="feedback"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        rows={3}
        className="rounded-lg border border-slate-300 bg-white p-2 text-sm text-slate-900 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100"
        placeholder="Buying was confusing, checkout was slow, etc."
      />
      <div className="flex justify-end gap-2">
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="rounded-lg px-3 py-1.5 text-sm text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-1.5 text-sm font-medium text-white hover:bg-slate-700 dark:bg-slate-100 dark:text-slate-900"
        >
          Send
        </button>
      </div>
    </form>
  );
}
