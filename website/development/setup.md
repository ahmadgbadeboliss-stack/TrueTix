# Development Setup

## Prerequisites

- Rust + the `wasm32v1-none` target, and the [Stellar CLI](https://developers.stellar.org/docs/tools/cli/install-cli) (for building/deploying the contract)
- Node.js 20+ and npm (for the frontend and this docs site)

## Contract

```bash
cd contracts/ticketing
cargo test          # run the unit test suite
cargo fmt --check   # matches CI
stellar contract build   # optimized wasm, for deployment
```

## Frontend

```bash
cd frontend
npm install
npm run dev          # local dev server, http://localhost:5173
npm run build         # production build (tsc -b && vite build)
npm run lint           # oxlint
```

The frontend ships with working **testnet defaults already baked in**
(`frontend/src/lib/env.ts`), pointing at the live pilot deployment — so `npm run dev` works
immediately with zero configuration. Copy `frontend/.env.example` to `.env` only if you want
to point at a different contract deployment or set a local PostHog key.

## Documentation site (this site)

```bash
cd website
npm install
npm run dev      # local dev server
npm run build     # static output to website/.vitepress/dist
```

## Repository layout

```
contracts/ticketing/     Soroban contract (src/lib.rs) + unit tests (src/test.rs)
frontend/                Vite/React app (see Frontend Architecture)
  api/faucet.ts            Vercel serverless function: grants test TUSDC
docs/
  DEPLOYMENT.md            deployed addresses + exact deploy commands
  ONBOARDING.md            pilot script + real pilot results
  screenshots/             UI screenshots
website/                  this documentation site (VitePress)
.github/workflows/ci.yml  fmt/build/test (contract) + lint/build (frontend), on every push/PR
```

## Continuous integration

Every push and pull request runs, via GitHub Actions (`.github/workflows/ci.yml`):

1. `cargo fmt --check`, `cargo build`, `cargo test` for the contract
2. `npm install`, `npm run lint`, `npm run build` for the frontend

This documentation site is deployed independently (see [Deployment](/deployment)) and isn't
part of that workflow.
