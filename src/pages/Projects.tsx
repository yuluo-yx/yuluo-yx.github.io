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
  website?: string;
}

interface ProjectCategory {
  name: string;
  projects: ProjectItem[];
}

const projectCategories: ProjectCategory[] = [
  {
    name: 'Java',
    projects: [
      {
        id: 'hertzbeat',
        name: 'Apache HertzBeat',
        description: 'An AI-powered next-generation open source real-time observability system.',
        logo: 'https://hertzbeat.apache.org/img/hertzbeat-brand.svg',
        githubUrl: 'https://github.com/apache/hertzbeat',
        website: 'https://hertzbeat.apache.org',
      },
      {
        id: 'shenyu',
        name: 'Apache ShenYu',
        description: 'Apache ShenYu is a Java native API Gateway for service proxy, protocol conversion and API governance.',
        logo: 'https://shenyu.apache.org/img/logo.svg',
        githubUrl: 'https://github.com/apache/shenyu',
        website: 'https://shenyu.apache.org',
      },
      {
        id: 'sca',
        name: 'Spring Cloud Alibaba',
        description: 'Spring Cloud Alibaba provides a one-stop solution for application development for the distributed solutions of Alibaba middleware.',
        logo: 'https://img.alicdn.com/imgextra/i1/O1CN01hmeX5e1NWlvOeF6OE_!!6000000001578-2-tps-286-36.pnghttps://shenyu.apache.org/img/logo.svg',
        githubUrl: 'https://github.com/alibaba/spring-cloud-alibaba',
        website: 'https://sca.aliyun.com',
      },
    ],
  },
  {
    name: 'AI',
    projects: [
      {
        id: 'spring-ai-alibaba',
        name: 'Spring AI Alibaba',
        description: 'Agentic AI Framework for Java Developers',
        logo: 'https://java2ai.com/img/logo.svg',
        githubUrl: 'https://github.com/alibaba/spring-ai-alibaba',
        website: 'https://java2ai.com',
      },
      {
        id: 'semantic-router',
        name: 'Semantic Router',
        description: 'System Level Intelligent Router for Mixture-of-Models',
        logo: 'https://raw.githubusercontent.com/vllm-project/semantic-router/main/website/static/img/vllm.png',
        githubUrl: 'https://github.com/vllm-project/semantic-router',
        website: 'https://vllm-semantic-router.com/',
      },
    ],
  },
  {
    name: 'Go',
    projects: [
      {
        id: 'api-testing',
        name: 'API Testing',
        description: 'API 自动化测试工具',
        logo: 'https://raw.githubusercontent.com/LinuxSuRen/api-testing/master/docs/site/static/logos/logo.png',
        githubUrl: 'https://github.com/LinuxSuRen/api-testing',
      },
      {
        id: 'gf',
        name: 'GoFrame gf',
        description: 'A powerful framework for faster, easier, and more efficient project development.',
        logo: 'https://camo.githubusercontent.com/54a399f129283e1230862230b914c686d7a49e9231cee05a9b3ea0a77d60dd1a/68747470733a2f2f676f6672616d652e6f72672f696d672f6c6f676f5f66756c6c2e706e67',
        githubUrl: 'https://github.com/gogf/gf',
      },
    ],
  },
  {
    name: 'Tools',
    projects: [
      {
        id: 'use',
        name: 'Yuluo .dotfile config',
        description: '环境初始化工具',
        logo: 'https://raw.githubusercontent.com/yuluo-yx/yuluo-yx.github.io/main/src/assets/logo.png',
        githubUrl: 'https://github.com/yuluo-yx/use',
      },
      {
        id: 'typo',
        name: 'Typo',
        description: '和 theFuck 一样，修复命令行错误的工具，但更小更简单',
        logo: 'https://raw.githubusercontent.com/yuluo-yx/yuluo-yx.github.io/main/src/assets/logo.png',
        githubUrl: 'https://github.com/deigmata-paideias/typo',
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
        logo: 'https://raw.githubusercontent.com/yuluo-yx/yuluo-yx.github.io/main/src/assets/logo.png',
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
