/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string;
  readonly VITE_SUPABASE_ANON_KEY: string;
  readonly VITE_OPENPIX_APP_ID?: string;
  readonly VITE_ASAAS_API_KEY?: string;
  readonly VITE_EVO_AGENT_URL?: string;
  readonly VITE_APP_URL?: string;
  readonly DEV: boolean;
  readonly PROD: boolean;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}