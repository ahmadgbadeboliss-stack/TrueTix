# Running the 10-tester pilot

This is the script for turning the deployed MVP into the "10 real users, proof of wallet
interactions, basic feedback" requirement for Level 4 submission.

## Before you send the link to anyone

1. Deploy the frontend to Vercel (see below) with the faucet env vars set — without
   `TUSDC_ISSUER_SECRET` configured, the "Get test funds" button will fail for every tester.
2. Set `VITE_POSTHOG_KEY` in the Vercel project so wallet connects, purchases, check-ins,
   and feedback submissions actually land somewhere you can review.
3. Do one full dry run yourself, in an incognito window: connect a wallet you don't
   normally use, add the trustline, hit the faucet, buy a ticket, check that "My Ticket"
   shows up. If any step is confusing to you, it'll be worse for someone who's never touched
   a Stellar wallet.

## What a tester needs

- A Stellar wallet browser extension. Freighter is the easiest recommendation
  (freighter.app) — testers who already use xBull, Rabet, Albedo, or Lobstr can use those
  instead, since the app supports all of them.
- The wallet set to **Testnet**, not Mainnet (Freighter: Settings → Preferences → switch
  network).
- No real money needed anywhere in this flow — TUSDC is a test asset with no market value.

## The script to send testers

Send this as a message (WhatsApp, DM, whatever reaches your 10 people):

> Trying out something I built — an event ticketing app on Stellar that makes tickets
> impossible to fake or scalp. Takes 2 minutes, no real money involved:
> 1. Install the Freighter wallet extension (freighter.app) if you don't have a Stellar
>    wallet already, and switch it to Testnet in settings.
> 2. Open [your Vercel URL]
> 3. Connect your wallet, add the TUSDC trustline when prompted, then tap "Get test funds"
> 4. Buy a ticket
> 5. There's a quick feedback box at the bottom — tell me what was confusing or slow.
>
> That's it — you'll have a real ticket sitting in your wallet, verifiable on-chain.

## Tracking proof of wallet interactions

Every connect, purchase, and check-in fires a PostHog event (`wallet_connected`,
`ticket_purchased`, `ticket_checked_in`) tagged with the wallet address. To pull your "10+
wallet interactions" proof for submission:

1. In PostHog, go to **Activity** (or **Events**) and filter for `ticket_purchased`.
2. Each row has a distinct wallet address in the `address` property — that's your proof
   list. Cross-reference against [Stellar Expert testnet
   explorer](https://stellar.expert/explorer/testnet/contract/CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6)
   for the actual on-chain transactions if you want a second, fully independent source.
3. Screenshot both for the submission checklist.

## Collecting the feedback summary

The in-app feedback box (bottom of the event page) fires a `feedback_submitted` PostHog
event with the free-text message and the submitter's address. In PostHog: **Activity** →
filter `feedback_submitted` → read the `message` property on each row. Summarize the
recurring themes (e.g. "trustline step was confusing," "wanted a QR code instead of pasting
an address") into a short paragraph for the "basic user feedback summary" submission item —
that write-up is yours to do since it requires judgment about what's actually recurring vs.
a one-off.

## Deploying to Vercel

```bash
npm install -g vercel   # if not already installed
cd frontend
vercel link             # first time: connects this directory to a Vercel project
                         # (when prompted, confirm "frontend" as the project root —
                         # this repo is a monorepo with the contract living outside it)
vercel env add TUSDC_ISSUER_SECRET production
vercel env add TUSDC_ISSUER production
vercel env add TUSDC_ASSET_CODE production
vercel env add HORIZON_URL production
vercel env add NETWORK_PASSPHRASE production
vercel env add FAUCET_AMOUNT production
vercel env add VITE_POSTHOG_KEY production
vercel --prod
```

This step needs your Vercel account, so it isn't something that can be done without you —
run it locally in this repo when you're ready to go live.
