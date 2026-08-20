# Deployment record — Stellar Testnet

This is the exact sequence used to deploy the TrueTix pilot, plus the resulting addresses.
Re-run it verbatim (with new keys) to stand up a fresh deployment.

## Addresses

| Role | Address |
|---|---|
| Ticketing contract | `CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6` |
| TUSDC asset contract (SAC) | `CB63M3HDCPISDPFIS6PF7ORYGQSBD437ICSQUO4434YA3ANIDU2HCNEM` |
| TUSDC issuer | `GDPYVBTKFUYFYXRXPK6I6J3ZA6TZRII4DD2UDPSQHCFPVFADQ4UOOKN3` |
| Organizer | `GAREKY23A3ILCAUM3KEP3AWFGD6V7UVQS34ESSOIXFJ5LXLZ6YSSNPKC` |
| Wasm hash | `8c5d8c7ade8e1417a5f1cecaa6ff588417b8f67c9e1246a5ac7c4b3afc56921d` |

Network: `Test SDF Network ; September 2015` (Stellar testnet).
RPC: `https://soroban-testnet.stellar.org`. Horizon: `https://horizon-testnet.stellar.org`.

The **issuer secret key** and **organizer secret key** are held locally in the Stellar CLI's
identity store (`~/.config/stellar/identity/`) and, for the faucet, as a Vercel environment
variable (`TUSDC_ISSUER_SECRET`) — never committed to this repo.

## 1. Generate + fund identities

```bash
stellar keys generate issuer --network testnet --fund
stellar keys generate organizer --network testnet --fund
```

## 2. Issue the test USDC asset and deploy its Soroban Asset Contract

```bash
stellar contract asset deploy \
  --asset TUSDC:$(stellar keys address issuer) \
  --source issuer --network testnet
# -> CB63M3HDCPISDPFIS6PF7ORYGQSBD437ICSQUO4434YA3ANIDU2HCNEM
```

## 3. Build and deploy the ticketing contract

```bash
cd contracts/ticketing
stellar contract build
# -> target/wasm32v1-none/release/ticketing.wasm

stellar contract deploy \
  --wasm target/wasm32v1-none/release/ticketing.wasm \
  --source organizer --network testnet --alias ticketing
# -> CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6
```

## 4. Both organizer and issuer need a TUSDC trustline

The Soroban Asset Contract for a classic-asset-backed token still routes through classic
trustlines under the hood — `buy_ticket`'s `transfer(buyer, organizer, price)` fails with a
missing-trustline error if the **organizer** (the payment destination) hasn't opened one.

```bash
stellar tx new change-trust --source organizer --network testnet \
  --line TUSDC:$(stellar keys address issuer)
```

## 5. Initialize the pilot event

```bash
stellar contract invoke \
  --id CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6 \
  --source organizer --network testnet -- \
  mint_tickets \
  --organizer $(stellar keys address organizer) \
  --name "TrueTix Pilot Launch" \
  --ticket_price 50000000 \
  --total_supply 20 \
  --payment_token CB63M3HDCPISDPFIS6PF7ORYGQSBD437ICSQUO4434YA3ANIDU2HCNEM
```

`ticket_price` is in the token's smallest unit (7 decimals, matching classic Stellar
assets), so `50000000` = 5.0000000 TUSDC. 20 tickets covers the 10-tester pilot with room to
spare for repeat demo runs.

## 6. Generate the TypeScript client bindings

```bash
stellar contract bindings typescript \
  --wasm target/wasm32v1-none/release/ticketing.wasm \
  --output-dir ../../frontend/src/contracts/ticketing-client \
  --network testnet
```

The generated file needed two hand-fixes to satisfy the frontend's strict `tsconfig`
(`verbatimModuleSyntax`, `erasableSyntaxOnly`): type-only imports for interface-only types,
and replacing a TS parameter-property constructor with an explicit field assignment. No
behavioral change — see the commit that introduced
`frontend/src/contracts/ticketing-client/src/index.ts`.

## Verifying the deployment end-to-end (CLI dry run)

Before wiring the frontend, the full flow was exercised directly against testnet:

```bash
stellar keys generate testbuyer --network testnet --fund

stellar tx new change-trust --source testbuyer --network testnet \
  --line TUSDC:$(stellar keys address issuer)

stellar tx new payment --source issuer --network testnet \
  --destination $(stellar keys address testbuyer) \
  --asset TUSDC:$(stellar keys address issuer) --amount 1000000000

stellar contract invoke --id <ticketing-contract-id> --source testbuyer --network testnet -- \
  buy_ticket --buyer $(stellar keys address testbuyer)

stellar contract invoke --id <ticketing-contract-id> --source organizer --network testnet -- \
  check_in --caller $(stellar keys address organizer) --ticket_id 0

stellar contract invoke --id <ticketing-contract-id> --source organizer --network testnet -- \
  get_event
# -> tickets_sold: 1, tickets_checked_in: 1
```

That run is why the pilot event already shows 1 sold / 1 checked-in from a fresh
deployment — it's a real on-chain transaction from the verification pass, not seed data.

## Vercel environment variables (faucet)

Set on the Vercel project, not committed:

| Variable | Value |
|---|---|
| `TUSDC_ISSUER_SECRET` | the issuer account's secret key |
| `TUSDC_ISSUER` | `GDPYVBTKFUYFYXRXPK6I6J3ZA6TZRII4DD2UDPSQHCFPVFADQ4UOOKN3` |
| `TUSDC_ASSET_CODE` | `TUSDC` |
| `HORIZON_URL` | `https://horizon-testnet.stellar.org` |
| `NETWORK_PASSPHRASE` | `Test SDF Network ; September 2015` |
| `FAUCET_AMOUNT` | `100` |

And for the client build, optionally:

| Variable | Value |
|---|---|
| `VITE_POSTHOG_KEY` | your PostHog project API key |
| `VITE_POSTHOG_HOST` | `https://us.i.posthog.com` (or your region) |
