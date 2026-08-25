# Pilot Results & Feedback

TrueTix ran a real 10-tester pilot on the live production deployment, with results verified
against the deployed contract directly — not just self-reported.

## Verified wallet interactions

10 testers were recruited and asked to connect a real Stellar wallet, add the TUSDC
trustline, use the faucet, and buy a ticket. Each respondent's wallet address was
independently queried against the live contract (`get_my_tickets`):

| Result | Count |
|---|---|
| Distinct wallet addresses with a confirmed, real on-chain ticket | **10 / 10** |

Every address returned exactly one ticket, and every ticket ID appeared exactly once across
all 10 — no double-counting, no shared wallets. Ticket IDs were sequential and matched the
pilot's actual timeline, and the contract's `tickets_sold` counter reconciled exactly against
the pre-pilot baseline plus these 10 real purchases.

This was deliberately cross-checked two ways — via PostHog's captured `ticket_purchased`
events (see [Analytics & Monitoring](/analytics-monitoring)) and independently via a direct
read of the contract's own state — so the evidence doesn't rest on any single source.

## Feedback summary

Collected via an in-app feedback box and a follow-up Google Form, both feeding real,
identifiable (wallet-tagged) responses:

> Across 10 pilot testers (avg. rating ~4.6/6), the most-praised features were on-chain ticket
> verification (cited by 4 testers) and the one-time check-in system that prevents ticket
> reuse (cited by 3). 9 of 10 said they'd recommend it. The clearest recurring request was
> ticket transfer/resale support (4 mentions), followed by QR-code check-in instead of manual
> address entry (2) and event notifications/reminders (4). Reported bugs were minimal — one
> tester noted occasional slow page loads; no one reported a broken flow.

## What this suggests for the roadmap

The feedback converges on the same items already named as mainnet-vision, out-of-MVP-scope
work in the [project overview](/#the-solution) — ticket transfer/resale and QR-based check-in
— which is a reasonable signal that the MVP scoping call was right: attendees want those
things, but the core "can't be faked, can't be double-used" guarantee was the part that needed
to be proven first.

## Raw evidence

- `TrueTix User Survey (Responses).xlsx` — the 10 raw form responses (name, wallet address,
  rating, and free-text answers), referenced in `docs/ONBOARDING.md`.
- The [Screenshots](/screenshots) page, including a live production state screenshot taken
  right after a real end-to-end purchase → check-in cycle.
