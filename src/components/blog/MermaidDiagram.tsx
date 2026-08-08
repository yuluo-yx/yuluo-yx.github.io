import { useEffect, useState } from 'react';
import { FiGitBranch } from 'react-icons/fi';
import { useThemeStore } from '../../store/themeStore';

interface MermaidDiagramProps {
  chart: string;
}

type RenderState = { status: 'loading' } | { status: 'ready'; svg: string } | { status: 'error' };

let diagramSequence = 0;
let renderQueue: Promise<void> = Promise.resolve();

// Mermaid 的配置是全局状态。串行渲染可避免多个图表使用不同主题时互相覆盖配置。
const renderDiagram = (chart: string, darkMode: boolean) => {
  const task = renderQueue.then(async () => {
    const { default: mermaid } = await import('mermaid');

    mermaid.initialize({
      startOnLoad: false,
      securityLevel: 'strict',
      suppressErrorRendering: true,
      theme: 'base',
      themeVariables: darkMode
        ? {
            background: '#0f172a',
            primaryColor: '#172554',
            primaryTextColor: '#e2e8f0',
            primaryBorderColor: '#3b82f6',
            secondaryColor: '#1e293b',
            tertiaryColor: '#0f172a',
            lineColor: '#64748b',
            edgeLabelBackground: '#0f172a',
          }
        : {
            background: '#ffffff',
            primaryColor: '#eff6ff',
            primaryTextColor: '#1e293b',
            primaryBorderColor: '#3b82f6',
            secondaryColor: '#f8fafc',
            tertiaryColor: '#ffffff',
            lineColor: '#64748b',
            edgeLabelBackground: '#ffffff',
          },
      flowchart: {
        useMaxWidth: true,
      },
    });

    diagramSequence += 1;
    return mermaid.render(`mermaid-diagram-${diagramSequence}`, chart);
  });

  renderQueue = task.then(
    () => undefined,
    () => undefined
  );

  return task;
};

export default function MermaidDiagram({ chart }: MermaidDiagramProps) {
  const theme = useThemeStore((state) => state.theme);
  const [renderState, setRenderState] = useState<RenderState>({
    status: 'loading',
  });

  useEffect(() => {
    let cancelled = false;

    setRenderState({ status: 'loading' });

    renderDiagram(chart, theme === 'dark')
      .then(({ svg }) => {
        if (!cancelled) {
          setRenderState({ status: 'ready', svg });
        }
      })
      .catch((error) => {
        console.error('Mermaid 流程图渲染失败：', error);
        if (!cancelled) {
          setRenderState({ status: 'error' });
        }
      });

    return () => {
      cancelled = true;
    };
  }, [chart, theme]);

  return (
    <figure className="not-prose my-8 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-950/60">
      <figcaption className="flex items-center gap-2 border-b border-slate-200 bg-slate-50 px-4 py-2.5 text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-400">
        <FiGitBranch aria-hidden="true" className="h-4 w-4 text-blue-500" />
        Mermaid 流程图
      </figcaption>

      <div aria-busy={renderState.status === 'loading'} className="min-h-40 overflow-x-auto p-4 sm:p-6 [&_svg]:mx-auto [&_svg]:h-auto [&_svg]:max-w-none sm:[&_svg]:max-w-full">
        {renderState.status === 'loading' && (
          <div className="flex min-h-32 items-center justify-center" role="status">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-slate-300 border-t-blue-500 dark:border-slate-700 dark:border-t-blue-400" />
            <span className="sr-only">正在渲染流程图</span>
          </div>
        )}

        {renderState.status === 'ready' && <div aria-label="Mermaid 流程图" role="img" dangerouslySetInnerHTML={{ __html: renderState.svg }} />}

        {renderState.status === 'error' && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700 dark:border-red-900/70 dark:bg-red-950/30 dark:text-red-200">
            <p className="m-0 font-medium">流程图渲染失败，请检查 Mermaid 语法。</p>
            <pre className="mt-3 overflow-x-auto whitespace-pre-wrap rounded-md bg-slate-950 p-3 text-xs leading-6 text-slate-200">
              <code>{chart}</code>
            </pre>
          </div>
        )}
      </div>
    </figure>
  );
}
