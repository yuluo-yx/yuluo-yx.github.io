import { motion } from 'framer-motion';
import { FiGithub, FiTwitter, FiMail } from 'react-icons/fi';
import Timeline from '../components/common/Timeline';
import { usePlum } from '../hooks/usePlum';
import { useThemeStore } from '../store/themeStore';

const fadeIn = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const timelineData = [
  { year: '2022-10', title: 'Spring Cloud Alibaba', organization: 'Open Source', description: '接触 Spring Cloud Alibaba 开源项目，提交第一个 PR', type: 'work' as const },
  { year: '2023-06', title: '开源之夏', organization: 'Spring Cloud Alibaba', description: '参加开源之夏 Spring Cloud Alibaba 社区项目', type: 'work' as const },
  { year: '2023-10', title: 'API-Testing', organization: 'LiunxSuren', description: '在 LiunxSuren/API-Testing 提交第一个 PR', type: 'work' as const },
  { year: '2023-11', title: '开源之夏结项', organization: 'Spring Cloud Alibaba', description: 'Spring Cloud Alibaba 开源之夏题目成功结项', type: 'work' as const },
  { year: '2024-02', title: 'SCA Committer', organization: 'Spring Cloud Alibaba', description: '获得 Spring Cloud Alibaba 社区 Committer 提名', type: 'work' as const },
  { year: '2024-03', title: 'Spring AI Alibaba', organization: 'Co-Founder', description: '参与发起 Spring Cloud Alibaba AI（现 Spring AI Alibaba）项目', type: 'work' as const },
  { year: '2024-05', title: 'Apache Hertzbeat', organization: 'Apache', description: '在 Apache/Hertzbeat 社区提交第一个 PR，同时积极参与 API-Testing', type: 'work' as const },
  { year: '2024-06', title: 'Graduation 🚀', organization: 'University', description: '获得 LinuxSuren/API-Testing Committer，大学毕业', type: 'education' as const },
  { year: '2024-08', title: 'Apache Committer', organization: 'Apache/Hertzbeat', description: '获得 Apache/Hertzbeat Committer 提名，加入 Apache org', type: 'work' as const },
  { year: '2024-12', title: 'SAA Committer', organization: 'Spring AI Alibaba', description: '获得 Spring AI Alibaba Committer 提名', type: 'work' as const },
  { year: '2025-04', title: 'SAA PMC', organization: 'Spring AI Alibaba', description: '获得 Spring AI Alibaba PMC member 提名，很长一段时间都在维护 SAA', type: 'work' as const },
  { year: '2025-06', title: 'Istio', organization: 'Istio Community', description: '加入 Istio Github 社区', type: 'work' as const },
  { year: '2025-07-01', title: 'Dromara', organization: 'Dromara Community', description: '加入 Dromara Github 社区', type: 'work' as const },
  { year: '2025-07-15', title: 'Apache ShenYu', organization: 'Apache', description: '提交 Apache/ShenYu 的第一个 PR', type: 'work' as const },
  { year: '2025-08', title: 'Semantic Router', organization: 'vllm-project', description: '提交 vllm-project/semantic-router 的第一个 PR', type: 'work' as const },
  { year: '2025-11-01', title: 'ShenYu Committer', organization: 'Apache ShenYu', description: '获得 Apache ShenYu Committer 提名', type: 'work' as const },
  { year: '2025-11-15', title: 'OpenTelemetry', organization: 'CNCF', description: '在 open-telemetry/opentelemetry-go-compile-instrumentation 贡献代码以加入 open-telemetry Github 社区', type: 'work' as const },
  { year: '2025-12', title: 'VSR Collaborator', organization: 'vllm-project', description: 'vllm-project/semantic-router collaborator', type: 'work' as const },
];

export default function About() {
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
      {/* Hero Section - Compact */}
      <section className="container mx-auto px-6 py-12 md:py-16">
        <motion.div
          className="max-w-3xl mx-auto"
          initial="initial"
          animate="animate"
          variants={{
            animate: {
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4 text-light-text dark:text-dark-text"
            variants={fadeIn}
          >
            Hi👋，我是牧生
          </motion.h1>
          
          <motion.p
            className="text-lg md:text-xl text-light-text-secondary dark:text-dark-text-secondary mb-6"
            variants={fadeIn}
          >
            Everything Wins! 🚀
          </motion.p>

          {/* Social Links */}
          <motion.div
            className="flex gap-4 mb-8"
            variants={fadeIn}
          >
            {[
              { icon: FiGithub, href: 'https://github.com/yuluo-yx', label: 'GitHub', external: true },
              { icon: FiTwitter, href: 'https://twitter.com/yuluo_yx', label: 'Twitter', external: true },
              { icon: FiMail, href: 'mailto:shown@apache.org', label: 'Email', external: false },
            ].map(({ icon: Icon, href, label, external }) => (
              <motion.a
                key={label}
                href={href}
                {...(external && { target: '_blank', rel: 'noopener noreferrer' })}
                className="p-2 rounded-lg border border-gray-300 dark:border-gray-700 hover:border-primary dark:hover:border-primary transition-colors"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                aria-label={label}
              >
                <Icon className="w-5 h-5" />
              </motion.a>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* About Me Section - Compact */}
      <section className="py-12">
        <div className="container mx-auto px-6">
          <motion.div
            className="max-w-3xl mx-auto"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl md:text-3xl font-bold mb-6">
              关于我
            </h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">名字由来</h3>
              <p className="text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                "牧生" 寓意为"在广阔天地间，放牧自己的生活与理想"。希望有一种钝感，自然的生活方式，在社会自然中寻找平衡与自由，通过放牧的方式，感受生命的真谛和自然之美。🤔
              </p>
            </div>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">特别经历</h3>
              <ul className="space-y-2 text-base text-light-text-secondary dark:text-dark-text-secondary leading-relaxed">
                {/* <li>• 大二接触开源，大四未毕业获得了 Spring Cloud Alibaba Committer 身份</li>
                <li>• I 人担任过社区周会主持</li> */}
                <li>• 参与发起了 Spring Cloud Alibaba AI（现 Spring AI Alibaba）项目</li>
              </ul>
            </div>

            {/* Skills */}
            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">技术领域</h3>
              <div className="flex flex-wrap gap-2">
                {[
                  'Java', 'Go', 'MicroService', 'AI', 'Cloud Native',
                  'Vue3', 'Gateway', 'Spring Boot', 'Docker', 'Kubernetes'
                ].map(skill => (
                  <motion.span
                    key={skill}
                    className="px-3 py-1.5 bg-light-bg dark:bg-dark-bg rounded-full text-sm font-medium border border-gray-200 dark:border-gray-800"
                    whileHover={{ scale: 1.05 }}
                  >
                    {skill}
                  </motion.span>
                ))}
              </div>
            </div>

            {/* Current Status */}
            <div className="p-4 bg-primary/10 rounded-lg border border-primary/20">
              <p className="text-sm font-medium text-primary mb-1">
                🚀 正在学习
              </p>
              <p className="text-sm text-light-text-secondary dark:text-dark-text-secondary">
                AI & Cloud Native
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Timeline Section - Compact */}
      <section className="container mx-auto px-6 py-12">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">
            我的开源之旅
          </h2>
          <div className="w-full">
            <Timeline items={timelineData} />
          </div>
        </motion.div>
      </section>
      </div>
    </motion.div>
  );
}
