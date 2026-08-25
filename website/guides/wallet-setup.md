# Wallet & TUSDC Setup

TrueTix runs on **Stellar Testnet**. No real money is ever involved — TUSDC is a test asset
issued specifically for this pilot, with no market value.

## 1. Install a Stellar wallet

TrueTix supports several wallets via [Stellar Wallets Kit](https://github.com/Creit-Tech/Stellar-Wallets-Kit):
**Freighter**, **xBull**, **Rabet**, **Albedo**, and **Lobstr**. Freighter (freighter.app) is
the easiest starting point — it's a browser extension, similar to MetaMask.

## 2. Switch the wallet to Testnet

In Freighter: click the extension icon → **Settings → Preferences → Network → Testnet**.

This is the single most common place people get stuck — a wallet left on Mainnet will show no
balance and no way to interact with the testnet contract.

## 3. Connect on TrueTix

Open [truetix.vercel.app](https://truetix.vercel.app) and click **Connect Wallet** (top
right). A modal lets you pick which installed wallet to use.

## 4. Add the TUSDC trustline

Stellar requires an account to explicitly "trust" an asset before it can hold it — this is a
one-time `change_trust` operation, not specific to TrueTix. The app detects if your connected
wallet doesn't have one yet and shows an **"Add TUSDC trustline"** button, which triggers one
signature request in your wallet.

## 5. Get test funds

Once the trustline exists, tap **"Get test funds."** This calls a serverless faucet
(`/api/faucet`) that sends 100 TUSDC to your wallet automatically — no separate faucet
website, no manual step. The faucet only pays out to wallets that already have the trustline,
as a basic anti-abuse check.

## Reference: TUSDC asset details

| Field | Value |
|---|---|
| Asset code | `TUSDC` |
| Issuer | `GDPYVBTKFUYFYXRXPK6I6J3ZA6TZRII4DD2UDPSQHCFPVFADQ4UOOKN3` |
| Decimals | 7 (matches classic Stellar assets) |
| Ticket price | 5 TUSDC |
| Faucet grant | 100 TUSDC per request |

Once you have a trustline and a balance, you're ready to [buy a ticket](/guides/ticket-purchase).
