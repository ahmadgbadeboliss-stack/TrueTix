# Deployment

## Live deployment

| | |
|---|---|
| **App** | [truetix.vercel.app](https://truetix.vercel.app) — Vercel, deployed from `frontend/` |
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |
| **RPC** | `https://soroban-testnet.stellar.org` |
| **Horizon** | `https://horizon-testnet.stellar.org` |

## Deployed addresses

| Role | Address |
|---|---|
| Ticketing contract | `CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6` |
| TUSDC asset contract (SAC) | `CB63M3HDCPISDPFIS6PF7ORYGQSBD437ICSQUO4434YA3ANIDU2HCNEM` |
| TUSDC issuer | `GDPYVBTKFUYFYXRXPK6I6J3ZA6TZRII4DD2UDPSQHCFPVFADQ4UOOKN3` |
| Organizer | `GAREKY23A3ILCAUM3KEP3AWFGD6V7UVQS34ESSOIXFJ5LXLZ6YSSNPKC` |

## Why a purpose-issued test asset instead of a shared testnet USDC

Rather than depending on an external testnet USDC issuer outside the team's control, the pilot
issues its own **TUSDC** classic asset, wraps it as a Soroban Asset Contract, and uses that as
`buy_ticket`'s `payment_token`. This meant the team could freely mint funds to test wallets via
the [faucet](/guides/wallet-setup) — no hunting for a public testnet faucet with unpredictable
uptime.

## How it's deployed

At a high level: generate issuer + organizer identities → issue the TUSDC asset and deploy its
Soroban Asset Contract → build and deploy the ticketing contract wasm → open TUSDC trustlines
for the organizer (needed since `buy_ticket` pays the organizer directly) → call `mint_tickets`
once to initialize the event → generate typed TypeScript bindings from the deployed contract
for the frontend to consume.

The **exact commands**, in order, including the CLI dry run used to verify the whole flow
end-to-end before the frontend existed, are recorded verbatim in
[`docs/DEPLOYMENT.md`](https://github.com/ahmadgbadeboliss-stack/TrueTix/blob/master/docs/DEPLOYMENT.md)
in the repository — that file is the authoritative deployment runbook; this page is a summary
of it.

## Frontend deployment (Vercel)

The frontend is a standard Vite build (`npm run build`), deployed to Vercel with the project
root set to `frontend/` (this is a monorepo — the contract lives outside that directory). A
`vercel.json` rewrite (`/(.*) → /index.html`) makes client-side routing
(`/organizer`, `/scanner`) work correctly on Vercel's static host.

## Environment variables

Set directly on the Vercel project, never committed to the repo:

| Variable | Purpose |
|---|---|
| `TUSDC_ISSUER_SECRET` | Signs faucet payouts — server-side only |
| `TUSDC_ISSUER`, `TUSDC_ASSET_CODE`, `HORIZON_URL`, `NETWORK_PASSPHRASE`, `FAUCET_AMOUNT` | Faucet configuration |
| `VITE_POSTHOG_KEY`, `VITE_POSTHOG_HOST` | Analytics — optional; the app degrades to a clean no-op if unset |

The frontend also ships with working testnet defaults for the *non-secret* values baked
directly into `frontend/src/lib/env.ts`, so a fresh clone runs against the live pilot
deployment with zero configuration.

## This documentation site

Deployed separately from the main app, as its own Vercel project with root directory
`website/` — a distinct, publicly accessible URL from the ticketing app itself.
