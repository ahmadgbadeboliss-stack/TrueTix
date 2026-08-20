/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CONTRACT_ID?: string;
  readonly VITE_TUSDC_SAC_ID?: string;
  readonly VITE_TUSDC_ISSUER?: string;
  readonly VITE_ORGANIZER_ADDRESS?: string;
  readonly VITE_RPC_URL?: string;
  readonly VITE_NETWORK_PASSPHRASE?: string;
  readonly VITE_HORIZON_URL?: string;
  readonly VITE_POSTHOG_KEY?: string;
  readonly VITE_POSTHOG_HOST?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
