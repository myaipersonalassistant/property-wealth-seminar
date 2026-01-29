/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLISHABLE_KEY: string;
  readonly VITE_API_BASE: string;
  readonly VITE_SUCCESS_URL: string;
  readonly VITE_CANCEL_URL: string;
  readonly VITE_GOOGLE_SHEETS_SHEET_ID: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
