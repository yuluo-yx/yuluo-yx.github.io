import { motion } from 'framer-motion';
import ProjectCard from '../components/project/ProjectCard';
import type { Project } from '../types';

const mockProjects: Project[] = [
  {
    id: '1',
    name: 'E-Commerce Platform',
    description: 'A full-featured e-commerce platform with cart, checkout, and payment integration.',
    tags: ['React', 'Node.js', 'MongoDB', 'Stripe'],
    githubUrl: 'https://github.com/yuluo-yx/ecommerce',
    liveUrl: 'https://ecommerce-demo.com',
    featured: true,
  },
  {
    id: '2',
    name: 'Task Management App',
    description: 'Collaborative task management tool with real-time updates and team features.',
    tags: ['TypeScript', 'Next.js', 'PostgreSQL', 'WebSocket'],
    githubUrl: 'https://github.com/yuluo-yx/task-manager',
    featured: true,
  },
  {
    id: '3',
    name: 'Weather Dashboard',
    description: 'Beautiful weather dashboard with forecasts and interactive maps.',
    tags: ['React', 'TailwindCSS', 'API Integration'],
    githubUrl: 'https://github.com/yuluo-yx/weather-app',
    liveUrl: 'https://weather-demo.com',
  },
  {
    id: '4',
    name: 'Blog CMS',
    description: 'Headless CMS for managing blog content with markdown support.',
    tags: ['Node.js', 'Express', 'MongoDB', 'Markdown'],
    githubUrl: 'https://github.com/yuluo-yx/blog-cms',
  },
  {
    id: '5',
    name: 'Portfolio Generator',
    description: 'CLI tool to generate beautiful portfolio websites from templates.',
    tags: ['Node.js', 'CLI', 'Templates'],
    githubUrl: 'https://github.com/yuluo-yx/portfolio-gen',
  },
  {
    id: '6',
    name: 'Code Snippet Manager',
    description: 'VS Code extension for managing and sharing code snippets.',
    tags: ['TypeScript', 'VS Code API', 'Extension'],
    githubUrl: 'https://github.com/yuluo-yx/snippet-manager',
  },
];

export default function Projects() {
  const featuredProjects = mockProjects.filter(p => p.featured);
  const otherProjects = mockProjects.filter(p => !p.featured);

  return (
    <motion.div
      className="min-h-screen"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <section className="py-16">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-4xl mx-auto text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4">Projects</h1>
            <p className="text-xl text-light-text-secondary dark:text-dark-text-secondary">
              A collection of my work, side projects, and open source contributions
            </p>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects */}
      {featuredProjects.length > 0 && (
        <section className="container mx-auto px-6 py-16">
          <h2 className="text-3xl font-bold mb-8">Featured Projects</h2>
          <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
            {featuredProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        </section>
      )}

      {/* All Projects */}
      <section className="container mx-auto px-6 pb-20">
        <h2 className="text-3xl font-bold mb-8">All Projects</h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {otherProjects.map(project => (
            <ProjectCard key={project.id} project={project} />
          ))}
        </div>
      </section>
    </motion.div>
  );
}
