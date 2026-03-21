/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_PAGE_AGENT_ENABLED?: string;
  readonly VITE_PAGE_AGENT_BASE_URL?: string;
  readonly VITE_PAGE_AGENT_MODEL?: string;
  readonly VITE_PAGE_AGENT_API_KEY?: string;
  readonly VITE_PAGE_AGENT_LANGUAGE?: 'zh-CN' | 'en-US';
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
