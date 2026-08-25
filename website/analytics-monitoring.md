# Analytics & Monitoring

TrueTix uses [PostHog](https://posthog.com) for product analytics, error monitoring, and
in-app feedback collection — one tool covering all three, rather than three separate
integrations.

## What's tracked

| Event | Fires when | Properties |
|---|---|---|
| `wallet_connected` | A wallet finishes connecting | `address` |
| `ticket_purchased` | `buy_ticket` is signed and confirmed | `ticket_id`, `address` |
| `ticket_checked_in` | The organizer checks a ticket in | `ticket_id`, `attendee` |
| `feedback_submitted` | The in-app feedback box is sent | `message`, `address` |
| `event_created` | An organizer mints a new event | `name`, `price`, `supply` |
| `$exception` | The frontend throws an uncaught error | autocaptured, via `ErrorBoundary` |

Autocapture is also enabled, so button clicks and page views are recorded automatically
without extra instrumentation.

## Evidence this is live in production

![PostHog activity showing real captured events](/screenshots/analytics-posthog.png)

A real PostHog Activity view from the production app, showing `ticket_purchased`,
`wallet_connected`, and autocaptured interaction events flowing in from
`truetix.vercel.app`.

## Error monitoring

`ErrorBoundary` wraps the entire app at the root (see `frontend/src/main.tsx`). If any
component throws, it's caught, reported to PostHog as a `$exception` event with the error
message and component stack, and the user sees a recoverable "Something went wrong" screen
instead of a blank page.

## Graceful degradation

If `VITE_POSTHOG_KEY` isn't set (e.g. running locally without a `.env`), `lib/posthog.ts`
swaps in a no-op implementation — every `posthog.capture(...)` call in the codebase works
identically whether or not analytics is actually configured, so there's no conditional
instrumentation logic scattered through the app.

## Using this data for pilot verification

Because every purchase and check-in is tagged with the acting wallet's public address,
PostHog's event list doubles as an audit trail: filtering `ticket_purchased` and counting
distinct `address` values gives an independent, timestamped record of real wallet
interactions — see [Pilot Results & Feedback](/pilot-results) for how this was cross-checked
against the contract itself.
