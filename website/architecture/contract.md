# Soroban Smart Contract Architecture

`contracts/ticketing` — Rust, `soroban-sdk` 26, `#![no_std]`. One contract instance per event
(the MVP is single-event; multi-event is a mainnet-vision item, not built).

## Data model

```rust
pub struct Event {
    pub organizer: Address,
    pub name: String,
    pub ticket_price: i128,
    pub total_supply: u32,
    pub tickets_sold: u32,
    pub tickets_checked_in: u32,
    pub payment_token: Address,
}

pub struct Ticket {
    pub owner: Address,
    pub used: bool,
}

pub enum DataKey {
    Event,
    Ticket(u32),
    OwnerTickets(Address),
}
```

`Event` lives in instance storage (one per contract). Each `Ticket` and each address's owned-ticket-ID
list live in persistent storage, keyed by `DataKey::Ticket(id)` / `DataKey::OwnerTickets(address)`.

## Entry points

| Function | Auth required | Purpose |
|---|---|---|
| `mint_tickets(organizer, name, ticket_price, total_supply, payment_token)` | organizer | Initializes the event. Callable exactly once — fails with `AlreadyInitialized` on a second call. Also rejects zero supply or non-positive price. |
| `buy_ticket(buyer)` | buyer | Fails with `SoldOut` once `tickets_sold == total_supply`; otherwise transfers `ticket_price` of `payment_token` from buyer to organizer and issues the next sequential ticket, all in one transaction. |
| `check_in(caller, ticket_id)` | caller (must equal organizer) | Marks a ticket used. Rejects `Unauthorized` if the caller isn't the organizer, `TicketNotFound` if the ID doesn't exist, `AlreadyUsed` on a second attempt. |
| `get_event()` | — (read) | Returns the current `Event`, or `NotInitialized` before `mint_tickets` has run. |
| `get_ticket(ticket_id)` | — (read) | Returns a single `Ticket`, or `TicketNotFound`. |
| `get_my_tickets(owner)` | — (read) | Returns the list of ticket IDs owned by an address. |
| `is_valid_ticket(ticket_id)` | — (read) | `true` if the ticket exists and isn't used. |

## Error codes

```rust
pub enum Error {
    AlreadyInitialized = 1,
    NotInitialized = 2,
    SoldOut = 3,
    TicketNotFound = 4,
    AlreadyUsed = 5,
    Unauthorized = 6,
    InvalidSupply = 7,
    InvalidPrice = 8,
}
```

## Design decisions worth calling out

- **Payment happens inside `buy_ticket` itself**, via a cross-contract call to the configured
  `payment_token`'s `transfer` — not as a separate operation the frontend has to orchestrate.
  Since Soroban transactions are atomic, there's no state where payment succeeds but ticket
  issuance doesn't, or vice versa.
- **Supply enforcement is a single integer comparison** (`tickets_sold >= total_supply`)
  checked before any state is written — cheap, and impossible to bypass from the client side
  since it's evaluated inside the contract itself.
- **Check-in's read-then-write of `used` happens within one atomic invocation**, which is what
  makes double check-in structurally impossible rather than just unlikely — see
  [Check-in / Verification Flow](/guides/check-in-flow) for how this was verified against the
  live deployed contract.
- **`payment_token` is a contract parameter, not hardcoded** — this is what let the pilot use a
  purpose-issued test asset (see [Deployment](/deployment)) instead of depending on an external
  testnet USDC issuer outside the team's control.

## Tests

`contracts/ticketing/src/test.rs` — 6 unit tests using `soroban-sdk`'s `testutils`, covering
the happy path (mint → buy → check-in) plus every rejection path: sold-out, double check-in,
unauthorized check-in, double-init, and a nonexistent ticket. All pass in CI on every push and
pull request (`cargo fmt --check`, `cargo build`, `cargo test`) — see
`.github/workflows/ci.yml`.
