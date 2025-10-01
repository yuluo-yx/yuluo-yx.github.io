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
        'column/AI/LLMs-AI-llms-what-token',
      ],
    },
    {
      label: 'AI Gateway',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/ai-gateway/introduction',
      },
      items: [
        'column/ai-gateway/ai-gateway',
        'column/ai-gateway/envoy-ai-gateway-quickstart',
        'column/ai-gateway/envoy-ai-gateway-openai',
      ],
    },
    {
      label: '笛子',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/dizi/introduction',
      },
      items: [
        'column/dizi/dizi01',
        'column/dizi/dizi02',
      ],
    },
    {
      label: '设计模式',
      type: 'category',
      link: {
        type: 'doc',
        id: 'column/design-pattern/introduction',
      },
      items: [
        {
          type: 'category',
          label: '设计原则',
          link: { type: 'doc', id: 'column/design-pattern/design_principle/introduction' },
          items: [
            { type: 'doc', id: 'column/design-pattern/design_principle/1_open_close' },
            { type: 'doc', id: 'column/design-pattern/design_principle/2_liskov_substitution' },
            { type: 'doc', id: 'column/design-pattern/design_principle/3_dependence_inversion' },
            { type: 'doc', id: 'column/design-pattern/design_principle/4_interface_segration' },
            { type: 'doc', id: 'column/design-pattern/design_principle/5_demeter' },
            { type: 'doc', id: 'column/design-pattern/design_principle/6_single_responsibility' },
          ],
        },
        'column/design-pattern/01_singleton',
        'column/design-pattern/02_factory',
        'column/design-pattern/03_builder',
        'column/design-pattern/04_prototype',
        'column/design-pattern/05_proxy',
        'column/design-pattern/06_bridge',
        'column/design-pattern/07_decorator',
        'column/design-pattern/08_adapter',
        'column/design-pattern/09_facade',
        'column/design-pattern/10_composite',
        'column/design-pattern/11_flyweight',
        'column/design-pattern/12_observer',
        'column/design-pattern/13_template',
        'column/design-pattern/14_strategy',
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
        'column/cloud_native/k8s-gateway-api',
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
  journey: [
    'journey/introduction',
    {
      type: 'category',
      label: '2025 年',
      link: {
        type: 'doc',
        id: 'journey/2025/introduction' },
      items: [
        'journey/2025/12',
      ],
    },
  ],
}

module.exports = sidebars
