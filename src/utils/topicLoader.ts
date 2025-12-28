/**
 * 专栏加载工具
 * 从 src/content/topics 目录加载专栏数据
 */

export interface TopicCategory {
  id: string;
  name: string;
  description: string;
  path: string;
  articlesCount: number;
}

export interface TopicArticle {
  slug: string;
  title: string;
  category: string;
  date?: string;
  tags?: string[];
  content?: string;
  readingTime?: number;
  subDirectory?: string;
  description?: string;
  fileName?: string;
}

// 专栏配置信息
const TOPIC_CONFIGS: Record<string, { name: string; description: string }> = {
  AI: {
    name: 'AI',
    description: '这里将会放一些和 AI 相关的文档...',
  },
  'ai-gateway': {
    name: 'AI Gateway',
    description: '这里将会放一些和 AI Gateway 相关的文档...',
  },
  cloud_native: {
    name: '云原生',
    description: '这里将会放一些和云原生相关的文档...',
  },
  'design-pattern': {
    name: '设计模式',
    description: '设计模式是对软件系统中常用写法的总结与抽象',
  },
  dizi: {
    name: '笛子学习记录',
    description: '记录笛子学习的点点滴滴...',
  },
  microservice: {
    name: '微服务',
    description: '这里将会放一些和微服务相关的文档...',
  },
  privacy_computing: {
    name: '隐私计算',
    description: '这里将会放一些和隐私计算相关的文档...',
  },
};

// 解析 frontmatter
function parseFrontmatter(content: string): Record<string, unknown> | null {
  const frontmatterRegex = /^---\n([\s\S]*?)\n---/;
  const match = content.match(frontmatterRegex);
  
  if (!match) return null;
  
  const frontmatter: Record<string, string | string[]> = {};
  const lines = match[1].split('\n');
  
  for (const line of lines) {
    const colonIndex = line.indexOf(':');
    if (colonIndex === -1) continue;
    
    const key = line.substring(0, colonIndex).trim();
    let value: string | string[] = line.substring(colonIndex + 1).trim();
    
    // 处理数组
    if (value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map((v: string) => v.trim().replace(/['"]/g, ''));
    } else {
      // 移除引号
      value = value.replace(/^["']|["']$/g, '');
    }
    
    frontmatter[key] = value;
  }
  
  return frontmatter;
}

/**
 * 加载所有专栏分类
 */
export async function loadTopicCategories(): Promise<TopicCategory[]> {
  const categories: TopicCategory[] = [];

  // 遍历配置中的所有专栏
  for (const [path, config] of Object.entries(TOPIC_CONFIGS)) {
    // 统计该分类下的文章数量
    const articlesCount = await countTopicArticles(path);

    categories.push({
      id: path,
      name: config.name,
      description: config.description,
      path,
      articlesCount,
    });
  }

  // 按名称排序
  return categories.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));
}

/**
 * 统计专栏文章数量
 */
async function countTopicArticles(categoryPath: string): Promise<number> {
  const articlesContext = import.meta.glob(
    '/src/content/topics/**/*.md',
    { query: '?raw', import: 'default' }
  );

  let count = 0;
  for (const [path] of Object.entries(articlesContext)) {
    if (path.includes(`/topics/${categoryPath}/`)) {
      count++;
    }
  }

  return count;
}

/**
 * 加载指定专栏的所有文章（支持子目录分组）
 */
export async function loadTopicArticles(categoryPath: string) {
  const articlesContext = import.meta.glob<string>(
    '/src/content/topics/**/*.md',
    { query: '?raw', import: 'default' }
  );

  const articles: TopicArticle[] = [];

  for (const [path, loader] of Object.entries(articlesContext)) {
    if (path.includes(`/topics/${categoryPath}/`)) {
      const content = await loader();
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter) continue;

      // 移除 frontmatter 后的内容
      const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

      // 从路径生成 slug
      const slug = path
        .replace('/src/content/topics/', '')
        .replace(/\.md$/, '');

      // 从路径中提取文件名
      const fileName = path.split('/').pop()?.replace(/\.md$/, '') || '';
      
      // 提取子目录路径
      const relativePath = path.replace(`/src/content/topics/${categoryPath}/`, '');
      const pathParts = relativePath.split('/');
      const subDirectory = pathParts.length > 1 ? pathParts[0] : null;

      articles.push({
        slug,
        fileName,
        subDirectory: subDirectory || undefined,
        title: String(frontmatter.title || ''),
        description: String(frontmatter.description || ''),
        date: String(frontmatter.date || ''),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category: categoryPath,
        content: markdownContent,
        readingTime: estimateReadingTime(content),
      });
    }
  }

  // 排序逻辑
  const hasOrderPrefix = articles.some(a => a.fileName && /^\d{2}[-_]/.test(a.fileName));
  
  if (hasOrderPrefix) {
    return articles.sort((a, b) => {
      if (a.subDirectory !== b.subDirectory) {
        if (!a.subDirectory) return -1;
        if (!b.subDirectory) return 1;
        return a.subDirectory.localeCompare(b.subDirectory);
      }
      return (a.fileName || '').localeCompare(b.fileName || '', undefined, { numeric: true });
    });
  } else {
    return articles.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0;
      const dateB = b.date ? new Date(b.date).getTime() : 0;
      return dateB - dateA;
    });
  }
}

/**
 * 将文章按子目录分组
 */
export function groupArticlesBySubDirectory(articles: TopicArticle[]): Record<string, TopicArticle[]> {
  const groups: Record<string, TopicArticle[]> = {};
  
  articles.forEach(article => {
    const key = article.subDirectory || 'main';
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(article);
  });
  
  return groups;
}

/**
 * 获取子目录的显示名称
 */
export function getSubDirectoryDisplayName(subDir: string): string {
  const nameMap: { [key: string]: string } = {
    'design_principle': '设计原则',
    'main': '设计模式',
  };
  
  return nameMap[subDir] || subDir.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * 估算阅读时间
 */
function estimateReadingTime(content: string): number {
  const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  const chineseChars = (contentWithoutFrontmatter.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (contentWithoutFrontmatter.match(/[a-zA-Z]+/g) || []).length;
  const minutes = Math.ceil((chineseChars / 300) + (englishWords / 200));
  return Math.max(1, minutes);
}

/**
 * 加载指定专栏文章的详情
 */
export async function loadTopicArticleDetail(slug: string): Promise<TopicArticle | null> {
  const articlesContext = import.meta.glob<string>(
    '/src/content/topics/**/*.md',
    { query: '?raw', import: 'default' }
  );

  for (const [path, loader] of Object.entries(articlesContext)) {
    const articleSlug = path
      .replace('/src/content/topics/', '')
      .replace(/\.md$/, '');

    if (articleSlug === slug) {
      const content = await loader();
      const frontmatter = parseFrontmatter(content);
      
      if (!frontmatter) return null;

      // 移除 frontmatter 后的内容
      const markdownContent = content.replace(/^---\n[\s\S]*?\n---\n/, '');

      // 从路径提取分类
      const categoryMatch = path.match(/\/topics\/([^/]+)\//);
      const category = categoryMatch ? categoryMatch[1] : '';

      return {
        slug,
        title: String(frontmatter.title || ''),
        description: String(frontmatter.description || ''),
        date: String(frontmatter.date || ''),
        tags: Array.isArray(frontmatter.tags) ? frontmatter.tags : [],
        category,
        content: markdownContent,
        readingTime: estimateReadingTime(content),
      };
    }
  }

  return null;
}
