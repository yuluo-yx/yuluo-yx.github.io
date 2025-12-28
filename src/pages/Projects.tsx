import { motion } from 'framer-motion';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';

interface ProjectItem {
  id: string;
  name: string;
  description: string;
  logo?: string;
  githubUrl?: string;
  liveUrl?: string;
}

interface ProjectCategory {
  name: string;
  projects: ProjectItem[];
}

const projectCategories: ProjectCategory[] = [
  {
    name: 'AI',
    projects: [
      {
        id: 'spring-ai-alibaba',
        name: 'Spring AI Alibaba',
        description: 'Spring AI 阿里云实现，支持通义千问、百炼等模型',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/alibaba/spring-ai-alibaba',
      },
      {
        id: 'semantic-router',
        name: 'Semantic Router',
        description: '语义路由框架，用于 LLM 应用的智能路由',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/vllm-project/semantic-router',
      },
    ],
  },
  {
    name: 'Tools',
    projects: [
      {
        id: 'api-testing',
        name: 'API Testing',
        description: 'API 自动化测试工具',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/LinuxSuRen/api-testing',
      },
      {
        id: 'hertzbeat',
        name: 'Apache HertzBeat',
        description: '开源实时监控系统',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/apache/hertzbeat',
      },
    ],
  },
  {
    name: 'Golang',
    projects: [
      {
        id: 'shenyu',
        name: 'Apache ShenYu',
        description: 'Java 原生 API 网关',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/apache/shenyu',
      },
    ],
  },
  {
    name: 'Frontend',
    projects: [
      {
        id: 'blog',
        name: 'Personal Blog',
        description: '个人博客网站，基于 React + TypeScript',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/yuluo-yx/yuluo-yx.github.io',
        liveUrl: 'https://yuluo-yx.github.io',
      },
    ],
  },
];

const focusProjects = [
  { name: 'Spring AI Alibaba', url: 'https://github.com/alibaba/spring-ai-alibaba' },
  { name: 'Apache ShenYu', url: 'https://github.com/apache/shenyu' },
  { name: 'Semantic Router', url: 'https://github.com/vllm-project/semantic-router' },
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
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      <canvas
        ref={plumCanvasRef}
        className="fixed inset-0 pointer-events-none opacity-50 dark:opacity-30"
        style={{ zIndex: 0 }}
      />
      <div className="relative" style={{ zIndex: 1 }}>
        {/* Header */}
        <section className="py-12 mb-8">
          <div className="container mx-auto px-6">
            <motion.div
              className="max-w-4xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <h1 className="text-4xl md:text-5xl font-bold mb-6">Project</h1>
              
              {/* 项目介绍 */}
              <div className="prose prose-lg dark:prose-invert max-w-none">
                <p className="text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                  开源项目和个人作品集，记录技术实践与创造的足迹
                </p>
              </div>
            </motion.div>
          </div>
        </section>

        {/* Focus On Section */}
        <section className="container mx-auto px-6 pb-8">
          <div className="max-w-5xl mx-auto">
            <div className="bg-light-bg-secondary dark:bg-dark-bg-secondary rounded-xl p-5 border border-primary/20">
              <h2 className="text-lg font-bold mb-3 text-primary flex items-center gap-2">
                <span>🎯</span>
                <span>Focus On</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {focusProjects.map((project) => (
                  <a
                    key={project.name}
                    href={project.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-light-bg dark:bg-dark-bg hover:bg-primary/10 dark:hover:bg-primary/10 border border-gray-200 dark:border-gray-700 hover:border-primary transition-all text-sm font-medium group"
                  >
                    <span className="group-hover:text-primary transition-colors">{project.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Project Categories */}
        <section className="container mx-auto px-6 pb-12">
          <div className="max-w-5xl mx-auto space-y-12">
            {projectCategories.map((category, categoryIndex) => (
              <motion.div
                key={category.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: categoryIndex * 0.1 }}
              >
                {/* Category Title */}
                <h2 className="text-2xl font-bold mb-6 text-primary">
                  {category.name}
                </h2>

                {/* Projects List */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {category.projects.map((project, projectIndex) => (
                    <motion.a
                      key={project.id}
                      href={project.githubUrl || project.liveUrl || '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block"
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: categoryIndex * 0.1 + projectIndex * 0.05 }}
                    >
                      <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="flex-shrink-0">
                          <img 
                            src={project.logo} 
                            alt={`${project.name} logo`}
                            className="w-12 h-12 object-contain rounded"
                          />
                        </div>

                        {/* Project Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-lg font-semibold mb-1">
                            {project.name}
                          </h3>
                          <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                            {project.description}
                          </p>
                        </div>
                      </div>
                    </motion.a>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </motion.div>
  );
}
