# TrueTix

**On-chain event ticketing on Stellar.** A ticket is a Soroban contract entry, not a PDF or a
screenshot — it can't be duplicated, and once an event sells out, the contract itself refuses
to mint another one. Built for the Stellar Level 4 (Green Belt) production MVP milestone.

<div class="quick-links">

**[▶ Live App](https://truetix.vercel.app)** · **[▶ Demo Video](https://www.loom.com/share/91019546636c4587a8d6d7cd4a4102ec)** · **[▶ GitHub Repository](https://github.com/ahmadgbadeboliss-stack/TrueTix)**

</div>

## The problem

Paper and PDF tickets in emerging-market event scenes (Nigeria, and similar markets) are
trivial to forge, and popular events get bought up by resellers who mark up prices 3–5x —
with organizers seeing none of that markup.

## The solution

TrueTix fixes both problems at the protocol level, not with policy:

- **Authenticity is a signature check, not trust in a printed barcode.** A ticket is a record
  in a Soroban smart contract, owned by a specific Stellar wallet address. It can't be
  screenshotted or reprinted.
- **Scarcity is enforced by code.** `buy_ticket` hard-fails the instant `tickets_sold` reaches
  `total_supply` — on chain, not just in a UI that could be bypassed.
- **A ticket can only ever be used once.** `check_in` flips a `used` flag inside the same
  atomic transaction that checks it, so a ticket can't be checked in twice even under
  concurrent scan attempts.

## Features

- **Event creation** — an organizer connects a wallet and mints a fixed batch of tickets for
  one event (name, price, supply) in a single on-chain call.
- **Ticket purchase** — an attendee connects a wallet, pays in a Stellar-native test token
  (TUSDC), and the contract transfers a ticket out of the organizer's remaining supply.
- **Door check-in** — a scanner view looks up a wallet address and marks its ticket used; the
  contract rejects a second check-in of the same ticket.
- **Supply enforcement** — hard-capped, on chain, not a UI-only limit.
- **Organizer visibility** — a live dashboard of tickets sold / remaining / checked-in.
- **Analytics & feedback** — every connect, purchase, and check-in is tracked in PostHog, with
  an in-app feedback widget feeding the same pipeline.

Resale-price-cap enforcement, multi-event support, and fiat on/off-ramp are mainnet-vision
items from the original proposal, intentionally out of scope for this MVP.

## Where to go next

| I want to... | Go to |
|---|---|
| Get a wallet ready to try it | [Wallet & TUSDC Setup](/guides/wallet-setup) |
| Walk through buying a ticket | [Ticket Purchase Flow](/guides/ticket-purchase) |
| Understand the organizer side | [Organizer Flow](/guides/organizer-flow) |
| See how door check-in works | [Check-in / Verification Flow](/guides/check-in-flow) |
| Understand the codebase | [Frontend Architecture](/architecture/frontend) · [Contract Architecture](/architecture/contract) |
| Run it locally | [Development Setup](/development/setup) |
| See what's deployed where | [Deployment](/deployment) |
| See real pilot results | [Pilot Results & Feedback](/pilot-results) |

<style>
.quick-links {
  font-size: 1.05em;
  padding: 12px 16px;
  border: 1px solid var(--vp-c-divider);
  border-radius: 8px;
  background: var(--vp-c-bg-soft);
  margin: 24px 0;
}
</style>
