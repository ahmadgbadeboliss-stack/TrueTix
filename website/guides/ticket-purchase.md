# Ticket Purchase Flow

What actually happens, on screen and on chain, when an attendee buys a ticket.

## On screen

1. With a wallet connected, a trustline in place, and a TUSDC balance ≥ the ticket price, the
   event page shows a **"Buy Ticket · 5 TUSDC"** button.
2. Clicking it opens one wallet signature prompt for a Soroban contract invocation
   (`buy_ticket`) — not a raw payment, since the contract itself moves the funds as part of
   ticket issuance.
3. After confirmation (typically a few seconds on testnet), the new ticket appears under **My
   Tickets**, and the event's **Sold** / **Remaining** counters update.

## On chain

The frontend calls the contract's `buy_ticket(buyer)` entry point. Inside a single atomic
transaction, the contract:

1. Requires the buyer's authorization (`buyer.require_auth()`).
2. Loads the event; fails with `SoldOut` if `tickets_sold >= total_supply` — supply is
   enforced here, not in the UI.
3. Invokes the configured payment token's `transfer(buyer, organizer, ticket_price)` — the 5
   TUSDC moves directly from the buyer's wallet to the organizer's, inside the same
   transaction as ticket issuance.
4. Writes a new `Ticket { owner: buyer, used: false }` at the next sequential ticket ID.
5. Appends that ticket ID to the buyer's `OwnerTickets` index.
6. Increments `tickets_sold`.

Because every step happens inside one transaction, there's no possible state where a buyer
pays but doesn't receive a ticket (or vice versa) — either the whole thing lands, or none of
it does.

## Loading and error states

- **Insufficient trustline/balance** — the UI walks the buyer through
  [adding a trustline and hitting the faucet](/guides/wallet-setup) before the buy button ever
  becomes available, rather than letting the transaction fail on chain.
- **Sold out** — the buy button is replaced with "This event is sold out."
- **Wallet rejects the signature, or the transaction fails on chain** — the error surfaces
  inline on the page (e.g. the contract's `SoldOut` error if two people buy the last ticket in
  the same instant); nothing is silently swallowed.
- All reads (event stats, wallet balance, ticket list) go through React Query, giving
  consistent loading skeletons and automatic retry/refetch behavior throughout.
