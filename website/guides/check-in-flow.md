# Check-in / Verification Flow

The door-side of TrueTix, at [`/scanner`](https://truetix.vercel.app/scanner) — also gated to
the organizer wallet.

## Why a wallet address instead of a QR code

For this MVP, a ticket's identity check is a **wallet-address lookup**, not a QR scan. An
attendee's ticket card has a **Copy Address** button specifically so they can hand that string
to door staff. QR scanning was explicitly deferred out of MVP scope — this was also the single
most-requested feature in the [pilot feedback](/pilot-results).

## The flow

1. The organizer opens `/scanner` with their wallet connected.
2. They paste the attendee's wallet address into the lookup field.
3. The app queries `get_my_tickets(address)` against the contract and displays every ticket
   that address holds, each labeled **Valid — not yet used** or **Already checked in**.
4. For a valid ticket, a **Check In** button calls the contract's `check_in(caller, ticket_id)`.

## What makes this safe against double-use

`check_in` reads the ticket's `used` flag and writes `used = true` inside the same atomic
contract invocation:

```
if ticket.used { return Err(Error::AlreadyUsed); }
ticket.used = true;
```

Because there's no gap between the read and the write, two simultaneous scan attempts on the
same ticket can't both succeed — one will always hit `AlreadyUsed`. This was verified directly
against the live production contract: checking a ticket in twice in a row correctly returns
`Error #5 (AlreadyUsed)` on the second attempt.

Only the organizer's wallet can call `check_in` at all — anyone else attempting it is rejected
with `Unauthorized` before the ticket state is even touched.
