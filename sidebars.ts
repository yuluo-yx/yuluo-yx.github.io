import type { SidebarsConfig } from '@docusaurus/plugin-content-docs'

const sidebars: SidebarsConfig = {
  column: [
    'column/introduction',
    {
      label: 'AI 大模型专栏',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/AI/introduction',
      },
      items: [
        'column/AI/LLMs-AI-what-is-llms',
        'column/AI/LLMs-AI-llms-apply-where',
        'column/AI/LLMs-AI-llms-dev-ecosystem',
        'column/AI/LLMs-AI-llms-dev-framework',
        'column/AI/LLMs-AI-Spring-AI-Alibaba-chat-source',
        'column/AI/LLMs-AI-Spring-AI-Alibaba-chat-memory-source',
        'column/AI/LLMs-AI-RAG',
      ],
    },
    {
      label: '微服务',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/microservice/introduction',
      },
      items: [
        'column/microservice/ribbons-source',
      ],
    },
    {
      label: '云原生',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/cloud_native/introduction',
      },
      items: [
        'column/cloud_native/what-is-cloud-native',
      ],
    },
    {
      label: '隐私计算',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/privacy_computing/introduction',
      },
      items: [
        'column/privacy_computing/what-is-privacy-computing',
      ],
    },
  ],
}

module.exports = sidebars
