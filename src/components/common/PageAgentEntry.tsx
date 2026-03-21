import { useCallback, useMemo, useState } from 'react';
import type { PageAgent } from 'page-agent';

declare global {
  interface Window {
    __blogPageAgentInstance?: PageAgent;
  }
}

const pageAgentLanguage: 'zh-CN' | 'en-US' =
  import.meta.env.VITE_PAGE_AGENT_LANGUAGE === 'en-US' ? 'en-US' : 'zh-CN';

const pageAgentEnabled = !['false', '0', 'off', 'no'].includes(
  (import.meta.env.VITE_PAGE_AGENT_ENABLED ?? 'true').trim().toLowerCase(),
);

const pageAgentEnv = {
  baseURL: import.meta.env.VITE_PAGE_AGENT_BASE_URL?.trim(),
  model: import.meta.env.VITE_PAGE_AGENT_MODEL?.trim(),
  apiKey: import.meta.env.VITE_PAGE_AGENT_API_KEY?.trim(),
  language: pageAgentLanguage,
};

const requiredConfig = [
  ['VITE_PAGE_AGENT_BASE_URL', pageAgentEnv.baseURL],
  ['VITE_PAGE_AGENT_MODEL', pageAgentEnv.model],
] as const;

function PageAgentEntry() {
  const [initError, setInitError] = useState<string | null>(null);

  const missingConfigKeys = useMemo(
    () => requiredConfig.filter(([, value]) => !value).map(([key]) => key),
    [],
  );

  const isConfigured = missingConfigKeys.length === 0;

  const onOpenPanel = useCallback(async () => {
    if (!isConfigured) {
      return;
    }

    try {
      const currentAgent = window.__blogPageAgentInstance;
      if (currentAgent && !currentAgent.disposed) {
        currentAgent.panel.show();
        return;
      }

      const { PageAgent } = await import('page-agent');
      const agent = new PageAgent({
        baseURL: pageAgentEnv.baseURL!,
        model: pageAgentEnv.model!,
        apiKey: pageAgentEnv.apiKey || undefined,
        language: pageAgentEnv.language,
      });

      window.__blogPageAgentInstance = agent;
      agent.panel.show();
      setInitError(null);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'unknown error';
      setInitError(message);
      console.error('[PageAgent] failed to initialize:', error);
    }
  }, [isConfigured]);

  if (!pageAgentEnabled) {
    return null;
  }

  const title = isConfigured
    ? 'Open Page Agent'
    : `请先配置: ${missingConfigKeys.join(', ')}`;

  return (
    <div className="fixed bottom-6 right-6 z-50">
      <button
        type="button"
        title={title}
        disabled={!isConfigured}
        onClick={onOpenPanel}
        className="rounded-full border border-light-accent/30 bg-light-accent px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:-translate-y-0.5 hover:bg-light-accent/90 disabled:cursor-not-allowed disabled:opacity-45 dark:border-dark-accent/30 dark:bg-dark-accent dark:hover:bg-dark-accent/90"
      >
        {isConfigured ? 'Page Agent' : 'Page Agent 未配置'}
      </button>
      {initError && (
        <p className="mt-2 max-w-[280px] rounded bg-red-600/90 px-3 py-2 text-xs leading-5 text-white">
          Page Agent 初始化失败: {initError}
        </p>
      )}
    </div>
  );
}

export default PageAgentEntry;
