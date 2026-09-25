import { motion } from 'framer-motion';
import { FiGithub, FiExternalLink, FiCompass } from 'react-icons/fi';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  role?: string;
  stars?: string;
  logo?: string;
  githubUrl?: string;
  website?: string;
}

interface ProjectCategory {
  name: string;
  description: string;
  projects: ProjectItem[];
}

// 当前核心关注项目：聚焦 Kueue 与 Spring AI Alibaba
const focusProjects = [
  {
    name: 'Kubernetes Kueue',
    desc: 'Kubernetes-native Job & Batch Queueing, GPU Scheduling Infra',
    url: 'https://github.com/kubernetes-sigs/kueue',
    website: 'https://kueue.sigs.k8s.io/',
  },
  {
    name: 'Spring AI Alibaba',
    desc: 'Agentic AI Application Framework for Java Developers',
    url: 'https://github.com/alibaba/spring-ai-alibaba',
    website: 'https://java2ai.com',
  },
];

const projectCategories: ProjectCategory[] = [
  {
    name: 'AI & 大模型',
    description: '深入大模型框架、Agent 智能体与路由调度的技术探索与社区建设',
    projects: [
      {
        id: 'spring-ai-alibaba',
        name: 'Spring AI Alibaba',
        role: 'Cofounder',
        description: 'Agentic AI Application Framework for Java Developers.',
        logo: 'https://java2ai.com/img/logo.svg',
        githubUrl: 'https://github.com/alibaba/spring-ai-alibaba',
        website: 'https://java2ai.com',
      },
      {
        id: 'semantic-router',
        name: 'Semantic Router',
        role: 'Committer',
        description: 'System Level Intelligent Router for Mixture-of-Models.',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/vllm-project/semantic-router',
        website: 'https://vllm-semantic-router.com/',
      },
      {
        id: 'atai',
        name: 'atAI',
        role: 'Author',
        description: '@ai，基于 AI 的终端命令行智能审查与辅助工具。',
        githubUrl: 'https://github.com/yuluo-yx/atAI',
      },
      {
        id: 'agentic-spring-ai',
        name: 'agentic-spring-ai',
        role: 'Creator',
        description: 'Agentic application framework, graph runtime and starters for Spring AI.',
        githubUrl: 'https://github.com/yuluo-yx/agentic-spring-ai',
      },
    ],
  },
  {
    name: '云原生 & 微服务',
    description: '涵盖 Kubernetes 调度、微服务治理、API 网关及可观测性基础设施',
    projects: [
      {
        id: 'kueue',
        name: 'Kubernetes Kueue',
        role: 'Contributor',
        description: 'Kubernetes-native Job and batch queueing, AI/GPU cluster resource management.',
        logo: 'https://kueue.sigs.k8s.io/icons/kueue.svg',
        githubUrl: 'https://github.com/kubernetes-sigs/kueue',
        website: 'https://kueue.sigs.k8s.io/',
      },
      {
        id: 'hertzbeat',
        name: 'Apache HertzBeat',
        role: 'PMC Member',
        description: 'An AI-powered next-generation open source real-time observability system.',
        logo: '/img/project/hertzbeat.svg',
        githubUrl: 'https://github.com/apache/hertzbeat',
        website: 'https://hertzbeat.apache.org',
      },
      {
        id: 'shenyu',
        name: 'Apache ShenYu',
        role: 'Committer',
        description: 'Java native API Gateway for service proxy, protocol conversion and API governance.',
        logo: 'https://shenyu.apache.org/img/logo.svg',
        githubUrl: 'https://github.com/apache/shenyu',
        website: 'https://shenyu.apache.org',
      },
      {
        id: 'sca',
        name: 'Spring Cloud Alibaba',
        role: 'PMC Member',
        description: 'One-stop solution for application development with Alibaba middleware.',
        logo: '/img/project/sca.png',
        githubUrl: 'https://github.com/alibaba/spring-cloud-alibaba',
        website: 'https://sca.aliyun.com',
      },
      {
        id: 'istio',
        name: 'Istio',
        role: 'Contributor',
        description: 'Open source service mesh that connects, secures, and observes cloud-native services.',
        logo: 'https://istio.io/latest/img/branding/istio-bluenavy.svg',
        githubUrl: 'https://github.com/istio/istio',
        website: 'https://istio.io',
      },
    ],
  },
  {
    name: 'Go 生态 & 工具',
    description: '高效轻量的命令行小工具、自动化测试与核心框架实现',
    projects: [
      {
        id: 'typo',
        name: 'Typo',
        role: 'Author',
        description: 'Auto-correct mistyped shell commands 🛠️，基于 Go 实现的快速纠错工具。',
        githubUrl: 'https://github.com/yuluo-yx/typo',
      },
      {
        id: 'design-pattern',
        name: 'design-pattern',
        role: 'Author',
        description: '经典 23 种设计模式的完整 Java & Go 实现与最佳实践。',
        githubUrl: 'https://github.com/yuluo-yx/design-pattern',
      },
      {
        id: 'api-testing',
        name: 'API Testing',
        role: 'Committer',
        description: '云原生 API 自动化测试工具与执行平台。',
        logo: 'https://raw.githubusercontent.com/LinuxSuRen/api-testing/master/docs/site/static/logos/logo.png',
        githubUrl: 'https://github.com/LinuxSuRen/api-testing',
      },
      {
        id: 'gf',
        name: 'GoFrame gf',
        role: 'Contributor',
        description: 'A powerful modular framework for faster, easier project development in Go.',
        logo: 'https://camo.githubusercontent.com/54a399f129283e1230862230b914c686d7a49e9231cee05a9b3ea0a77d60dd1a/68747470733a2f2f676f6672616d652e6f72672f696d672f6c6f676f5f66756c6c2e706e67',
        githubUrl: 'https://github.com/gogf/gf',
      },
      {
        id: 'ot-go',
        name: 'opentelemetry-go-instrumentation',
        role: 'Contributor',
        description: 'OpenTelemetry Go compile-time and runtime instrumentation.',
        logo: 'https://github.com/open-telemetry/opentelemetry-go-compile-instrumentation/raw/main/docs/assets/otel-logo.png',
        githubUrl: 'https://github.com/open-telemetry/opentelemetry-go-instrumentation',
      },
    ],
  },
  {
    name: '个人作品 & 效率',
    description: 'Markdown 编辑器、环境配置、Skills 沉淀与日常生产力项目',
    projects: [
      {
        id: 'mory',
        name: 'Mory',
        role: 'Author',
        description: '面向 macOS 和 Windows 的跨平台所见即所得 Markdown 编辑器，本地优先并支持双向链接与知识图谱。',
        githubUrl: 'https://github.com/yuluo-yx/mory',
      },
      {
        id: 'skills',
        name: 'skills',
        role: 'Author',
        description: '实用 Agent Skills 集合，收录中文技术文档写作与审校等规范，支持 Codex 与 Claude Code 开箱即用。',
        githubUrl: 'https://github.com/yuluo-yx/skills',
      },
      {
        id: 'use',
        name: 'use (.dotfile config)',
        role: 'Author',
        description: 'Mac、Windows、Vim、IDEA 个人环境初始化与高效配置文件库。',
        githubUrl: 'https://github.com/yuluo-yx/use',
      },
      {
        id: 'blog',
        name: 'Personal Blog',
        role: 'Author',
        description: '基于 React 19 + TypeScript + Tailwind CSS 构建的高性能静态博客。',
        githubUrl: 'https://github.com/yuluo-yx/yuluo-yx.github.io',
        website: 'https://yuluo-yx.github.io',
      },
    ],
  },
];

export default function Projects() {
  const { theme } = useThemeStore();
  const plumCanvasRef = usePlum({
    speed: 6,
    density: 0.5,
    color: theme === 'dark' ? 'rgba(255, 255, 255, 0.15)' : 'rgba(55, 65, 81, 0.15)',
  });

  return (
    <motion.div
      className="min-h-screen relative"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -15 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <section className="py-12 mb-4">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Project</h1>

              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed mb-3">
                  开源项目与个人作品集，记录技术实践与开源社区贡献的足迹。
                </p>
                <p className="text-xs text-light-text-secondary dark:text-dark-text-secondary">
                  Focus on Java AI Agent Framework & k8s GPU scheduling infra.
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Focus On Section - 重点呈现 Kueue 与 Spring AI Alibaba */}
        <section className="container mx-auto px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-5 border border-gray-200 dark:border-gray-800">
              <div className="flex items-center gap-2 text-sm font-semibold text-primary mb-3">
                <FiCompass className="w-4 h-4" />
                <span>Focus On / 当前重点关注</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {focusProjects.map((p) => (
                  <a
                    key={p.name}
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors flex flex-col justify-between group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-base font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors">
                        {p.name}
                      </span>
                      <FiExternalLink className="w-4 h-4 text-light-text-secondary dark:text-dark-text-secondary group-hover:text-primary transition-colors" />
                    </div>
                    <span className="text-xs text-light-text-secondary dark:text-dark-text-secondary mt-1.5 leading-relaxed">
                      {p.desc}
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project Categories */}
        <section className="container mx-auto px-6 pb-16">
          <div className="max-w-5xl mx-auto space-y-12">
            {projectCategories.map((category) => (
              <div key={category.name}>
                {/* Category Header */}
                <div className="mb-6">
                  <h2 className="text-2xl font-bold text-light-text dark:text-dark-text mb-1">
                    {category.name}
                  </h2>
                  <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary">
                    {category.description}
                  </p>
                </div>

                {/* Projects Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {category.projects.map((project) => (
                    <div
                      key={project.id}
                      className="group flex flex-col justify-between p-5 rounded-xl bg-light-bg-secondary dark:bg-dark-bg-secondary border border-gray-200 dark:border-gray-800 hover:border-primary dark:hover:border-primary transition-colors"
                    >
                      <div>
                        {/* Header: Logo / Placeholder + Role */}
                        <div className="flex items-center justify-between gap-3 mb-3">
                          <div className="w-10 h-10 rounded-lg bg-light-bg dark:bg-dark-bg border border-gray-200 dark:border-gray-800 flex items-center justify-center overflow-hidden flex-shrink-0">
                            {project.logo ? (
                              <img
                                src={project.logo}
                                alt={project.name}
                                className="w-7 h-7 object-contain"
                                onError={(e) => {
                                  const target = e.target as HTMLElement;
                                  target.style.display = 'none';
                                  if (target.parentElement) {
                                    target.parentElement.innerHTML = `<span class="text-xs font-bold text-primary">${project.name.slice(0, 2).toUpperCase()}</span>`;
                                  }
                                }}
                              />
                            ) : (
                              <span className="text-xs font-bold text-primary">
                                {project.name.slice(0, 2).toUpperCase()}
                              </span>
                            )}
                          </div>

                          {project.role && (
                            <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-primary/10 text-primary border border-primary/20">
                              {project.role}
                            </span>
                          )}
                        </div>

                        {/* Title */}
                        <h3 className="text-base font-bold text-light-text dark:text-dark-text group-hover:text-primary transition-colors mb-2 leading-snug">
                          {project.name}
                        </h3>

                        {/* Description */}
                        <p className="text-xs sm:text-sm text-light-text-secondary dark:text-dark-text-secondary line-clamp-3 leading-relaxed">
                          {project.description}
                        </p>
                      </div>

                      {/* Footer Actions */}
                      <div className="mt-4 pt-3 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-end gap-3 text-xs text-light-text-secondary dark:text-dark-text-secondary">
                        {project.website && (
                          <a
                            href={project.website}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                            title="访问官网"
                          >
                            <FiExternalLink className="w-3.5 h-3.5" />
                            <span>官网</span>
                          </a>
                        )}
                        {project.githubUrl && (
                          <a
                            href={project.githubUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 hover:text-primary transition-colors"
                            title="GitHub 仓库"
                          >
                            <FiGithub className="w-3.5 h-3.5" />
                            <span>GitHub</span>
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
