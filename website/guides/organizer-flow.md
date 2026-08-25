# Organizer Flow

The organizer side of TrueTix lives at [`/organizer`](https://truetix.vercel.app/organizer),
gated behind the specific organizer wallet address recorded on the event.

## Creating an event

The first time the organizer wallet connects and no event exists yet, the dashboard shows a
**Create Event** form: name, ticket price (in TUSDC), and total supply. Submitting it calls
the contract's `mint_tickets` — a one-time call per contract instance that initializes the
event and its fixed supply. There is intentionally no "edit event" or "mint more tickets"
path: supply is meant to be fixed once an event goes live, which is the whole point of the
on-chain scarcity guarantee.

## Live dashboard

Once an event exists, any visitor to `/organizer` can see its stats (sold / remaining /
checked-in / total supply, plus the organizer address and price) — but only the connected
wallet matching the event's `organizer` address gets to see itself flagged as the organizer;
everyone else sees a clear "Viewing as a non-organizer wallet — read-only" notice. The numbers
themselves come from the same live contract read (`get_event`) used by the public event page,
refetched automatically every few seconds.

## Checking tickets in

Checking a ticket in happens from the separate [Scanner](/guides/check-in-flow) view, not the
dashboard itself — see that page for the door-side flow. The dashboard's checked-in counter
updates live as check-ins happen, giving the organizer a real-time view of the door without
needing to stand at it.

## Who can act as organizer

Only the wallet address stored as `organizer` on the on-chain `Event` can create the event or
check tickets in — enforced by the contract itself (`caller != event.organizer` rejects with
`Unauthorized`), not just hidden in the UI. Anyone can *view* the dashboard; only the
organizer's wallet can *act* on it.
