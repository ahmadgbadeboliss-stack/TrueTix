# Frontend Architecture

React 19 + TypeScript + Vite, deployed as a static site on Vercel with one serverless
function.

```
                     ┌─────────────────────────┐
                     │   Soroban contract       │
                     │   (contracts/ticketing)  │
                     │                           │
                     │  mint_tickets  buy_ticket │
                     │  check_in      get_event  │
                     └────────────┬──────────────┘
                                  │ invoke / simulate (Soroban RPC)
                     ┌────────────┴──────────────┐
                     │   React frontend (Vite)    │
                     │                             │
   /            ─────┤  EventPage   (attendee)     │
   /organizer   ─────┤  OrganizerDashboard          │
   /scanner     ─────┤  Scanner     (door check-in) │
                     │                             │
                     │  Stellar Wallets Kit         │
                     │  (Freighter/xBull/Rabet/...) │
                     │  React Query · PostHog        │
                     └────────────┬──────────────┘
                                  │
                     ┌────────────┴──────────────┐
                     │  /api/faucet (Vercel fn)    │
                     │  grants test TUSDC to new    │
                     │  testers after they add a    │
                     │  trustline                   │
                     └─────────────────────────────┘
```

## Routes / pages

| Route | File | Role |
|---|---|---|
| `/` | `pages/EventPage.tsx` | Attendee: browse, connect, trustline/faucet gating, buy, My Tickets, feedback |
| `/organizer` | `pages/OrganizerDashboard.tsx` | Organizer: create event, live sold/remaining/checked-in stats |
| `/scanner` | `pages/Scanner.tsx` | Organizer: wallet-address lookup + check-in |

## Components

`Layout` (nav + wallet button) · `WalletButton` · `StatTile` (+ skeleton) · `TicketCard`
(ticket display, full address, Copy Address) · `FeedbackButton` (in-app feedback → PostHog) ·
`ErrorBoundary` (top-level crash guard, reports to PostHog).

## Hooks

`useWallet` (React Context: connect/disconnect/sign, wraps Stellar Wallets Kit) · `useEvent`
(React Query wrapper around `get_event`) · `useMyTickets` (owner's ticket list + per-ticket
state) · `useTusdcStatus` (trustline existence + balance, read via Horizon).

## Lib

`env.ts` (typed config with working testnet defaults baked in, override via `.env`) ·
`contract.ts` (typed Soroban contract client factory) · `walletKit.ts` (Stellar Wallets Kit
setup: Freighter, xBull, Rabet, Albedo, Lobstr) · `usdc.ts` (trustline build/submit, faucet
request) · `posthog.ts` (analytics init, no-ops cleanly if unconfigured).

## Contract client

`src/contracts/ticketing-client/` holds TypeScript bindings generated directly from the
deployed contract via `stellar contract bindings typescript`, giving fully typed, spec-checked
calls to every contract method — reads resolve from simulation alone, writes go through
`AssembledTransaction.signAndSend()` using whichever wallet is connected.

## Data flow philosophy

Every piece of state the UI shows — event stats, ticket ownership, TUSDC balance — is read
live from the chain (or Horizon, for the classic-asset balance) through React Query, not
cached in application state. There is no backend database: the Soroban contract *is* the
database.

## Serverless faucet

`api/faucet.ts` is the one piece of server-side code, deployed as a Vercel function. It holds
the TUSDC issuer's secret (as a Vercel environment variable, never in the repo), verifies the
requesting wallet already has a trustline, and sends 100 test TUSDC — removing the "how do I
even get funds" barrier for new testers. See [Deployment](/deployment) for the exact
environment variables involved.
