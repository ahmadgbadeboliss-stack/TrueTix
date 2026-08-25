# Attendee Flow

The end-to-end journey for someone attending an event through TrueTix.

1. **Open the app** at [truetix.vercel.app](https://truetix.vercel.app) — the event page loads
   immediately, showing the event name, price, and live on-chain stats (Sold / Remaining /
   Checked in), no wallet needed yet.
2. **Connect a wallet** — see [Wallet & TUSDC Setup](/guides/wallet-setup) if this is the first
   time.
3. **Buy a ticket** — see the [Ticket Purchase Flow](/guides/ticket-purchase) for the exact
   steps and what happens on chain.
4. **View "My Tickets"** — every ticket owned by the connected wallet appears as a card showing
   its event name, ticket number, and a **Valid / Used** status pulled live from the contract.
5. **Show up to the event** — each ticket card displays the wallet's full public address with
   a **Copy Address** button. That address is what the attendee shows the organizer at the
   door — see [Check-in / Verification Flow](/guides/check-in-flow).
6. **Leave feedback (optional)** — a "Got feedback on this experience?" box at the bottom of
   the event page collects free-text feedback, tied to the wallet address, feeding directly
   into the same analytics pipeline (see [Analytics & Monitoring](/analytics-monitoring)).

## What "my ticket" actually is

There's no PDF, QR image, or file to lose. A ticket is a `Ticket { owner, used }` record
stored in the Soroban contract, keyed by a ticket ID, plus a reverse index
(`OwnerTickets(address) -> [ticket_id, ...]`) that the app queries to build the "My Tickets"
list. Ownership is provable by anyone, at any time, by querying the contract directly — the
frontend is just a convenient viewer for state that already exists on chain.
