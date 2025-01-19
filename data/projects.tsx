export const projects: Project[] = [
  {
    title: '牧生`s Blog site',
    description: '🦖 基于 Docusaurus 静态网站生成器实现个人博客',
    preview: '/img/project/mushengblogs.jpg',
    website: 'https://yuluo-yx.github.io',
    source: 'https://github.com/yuluo-yx/blog',
    tags: ['opensource', 'design', 'favorite'],
    type: 'web',
  },
  {
    title: 'Apache Hertzbeat',
    description: '🧨 易用友好的开源实时监控系统',
    preview: '/img/project/hertbeat.jpg',
    website: 'https://hertzbeat.apache.org/zh-cn',
    source: 'https://github.com/apache/hertzbeat',
    tags: ['opensource', 'observable', 'favorite'],
    type: 'observable',
  },
  {
    title: 'LinuxSuRen API Testing',
    description: '🚀 Open source API testing tool. 开源接口调试、测试工具。Mock Server',
    preview: '/img/project/apitesting.jpg',
    website: 'https://linuxsuren.github.io/api-testing',
    source: 'https://github.com/LinuxSuRen/api-testing',
    tags: ['opensource', 'testing', 'favorite'],
    type: 'testing',
  },
  {
    title: 'Spring Cloud Alibaba',
    description: '🛠️ 致力于提供微服务开发的一站式解决方案!',
    preview: '/img/project/sca.jpg',
    website: 'https://sca.aliyun.com',
    source: 'https://github.com/alibaba/spring-cloud-alibaba',
    tags: ['opensource', 'microservice', 'favorite'],
    type: 'microservice',
  },
  {
    title: 'Spring AI Alibaba',
    description: '💫 快速开发生成式 AI 应用!',
    preview: '/img/project/saa.jpg',
    website: 'https://java2ai.com',
    source: 'https://github.com/alibaba/spring-ai-alibaba',
    tags: ['opensource', 'AI', 'Spring', 'favorite'],
    type: 'Spring',
  },
]

export type Tag = {
  label: string
  description: string
  color: string
}

export type TagType = 'Spring' | 'AI' | 'microservice' | 'testing' | 'observable' | 'favorite' | 'opensource' | 'product' | 'design' | 'large' | 'personal'

export type ProjectType = 'Spring' | 'microservice' | 'testing' | 'observable' | 'web' | 'app' | 'commerce' | 'personal' | 'toy' | 'other'

export const projectTypeMap = {
  web: '🖥️ 网站',
  app: '💫 应用',
  commerce: '商业项目',
  personal: '👨‍💻 个人',
  toy: '🔫 玩具',
  other: '🗃️ 其他',
}

export type Project = {
  title: string
  description: string
  preview?: string
  website: string
  source?: string | null
  tags: TagType[]
  type: ProjectType
}

export const Tags: Record<TagType, Tag> = {
  favorite: {
    label: '喜爱',
    description: '我最喜欢的网站，一定要去看看!',
    color: '#e9669e',
  },
  observable: {
    label: '可观测',
    description: '可观测',
    color: '#e9669e',
  },
  Spring: {
    label: 'Spring',
    description: 'Spring',
    color: '#e9669e',
  },
  AI: {
    label: 'AI',
    description: 'AI!',
    color: '#e9669e',
  },
  microservice: {
    label: '微服务',
    description: '微服务',
    color: '#e9669e',
  },
  testing: {
    label: 'API 测试',
    description: 'API 测试!',
    color: '#e9669e',
  },
  opensource: {
    label: '开源',
    description: '开源项目可以提供灵感!',
    color: '#39ca30',
  },
  product: {
    label: '产品',
    description: '与产品相关的项目!',
    color: '#dfd545',
  },
  design: {
    label: '设计',
    description: '设计漂亮的网站!',
    color: '#a44fb7',
  },
  large: {
    label: '大型',
    description: '大型项目，原多于平均数的页面',
    color: '#8c2f00',
  },
  personal: {
    label: '个人',
    description: '个人项目',
    color: '#12affa',
  },
}

export const TagList = Object.keys(Tags) as TagType[]

export const groupByProjects = projects.reduce(
  (group, project) => {
    const { type } = project
    group[type] = group[type] ?? []
    group[type].push(project)
    return group
  },
  {} as Record<ProjectType, Project[]>,
)
