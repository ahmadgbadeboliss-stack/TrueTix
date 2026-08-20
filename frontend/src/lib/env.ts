// Deployed testnet addresses for the TrueTix pilot event. These are public
// identifiers (not secrets) baked in as defaults so the app works out of the
// box; override via .env for a redeploy against a different contract.
export const CONTRACT_ID =
  import.meta.env.VITE_CONTRACT_ID ??
  "CDKFKC4N6M6SRABEX4SH34SP56FZE665HRR3K4ZS5TQBFDYMHPB4J7B6";

export const TUSDC_SAC_ID =
  import.meta.env.VITE_TUSDC_SAC_ID ??
  "CB63M3HDCPISDPFIS6PF7ORYGQSBD437ICSQUO4434YA3ANIDU2HCNEM";

export const TUSDC_ISSUER =
  import.meta.env.VITE_TUSDC_ISSUER ??
  "GDPYVBTKFUYFYXRXPK6I6J3ZA6TZRII4DD2UDPSQHCFPVFADQ4UOOKN3";

export const TUSDC_ASSET_CODE = "TUSDC";

export const ORGANIZER_ADDRESS =
  import.meta.env.VITE_ORGANIZER_ADDRESS ??
  "GAREKY23A3ILCAUM3KEP3AWFGD6V7UVQS34ESSOIXFJ5LXLZ6YSSNPKC";

export const RPC_URL = import.meta.env.VITE_RPC_URL ?? "https://soroban-testnet.stellar.org";

export const NETWORK_PASSPHRASE =
  import.meta.env.VITE_NETWORK_PASSPHRASE ?? "Test SDF Network ; September 2015";

export const HORIZON_URL = import.meta.env.VITE_HORIZON_URL ?? "https://horizon-testnet.stellar.org";

export const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;
export const POSTHOG_HOST = import.meta.env.VITE_POSTHOG_HOST ?? "https://us.i.posthog.com";

// Ticket price / faucet grant, expressed in the token's smallest unit
// (TUSDC has 7 decimals, matching Stellar classic assets).
export const TICKET_PRICE_DISPLAY = "5 TUSDC";
export const FAUCET_GRANT_AMOUNT = "100"; // TUSDC, decimal units
