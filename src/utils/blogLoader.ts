import type { BlogPost } from '../types';

// 导入所有博客文件（移除 eager 以支持热更新）
const blogModules = import.meta.glob('/src/content/blogs/**/*.md', { 
  query: '?raw',
  import: 'default'
});

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

// 估算阅读时间（基于字数）
function estimateReadingTime(content: string): number {
  // 移除 frontmatter
  const contentWithoutFrontmatter = content.replace(/^---\n[\s\S]*?\n---\n/, '');
  // 中文字符数 + 英文单词数
  const chineseChars = (contentWithoutFrontmatter.match(/[\u4e00-\u9fa5]/g) || []).length;
  const englishWords = (contentWithoutFrontmatter.match(/[a-zA-Z]+/g) || []).length;
  
  // 假设每分钟阅读 300 个中文字符或 200 个英文单词
  const minutes = Math.ceil((chineseChars / 300) + (englishWords / 200));
  return Math.max(1, minutes);
}

// 从路径中提取分类
function getCategoryFromPath(path: string): string {
  const parts = path.split('/');
  const blogsIndex = parts.findIndex(p => p === 'blogs');
  if (blogsIndex !== -1 && blogsIndex < parts.length - 1) {
    const category = parts[blogsIndex + 1];
    // 转换分类名称
    const categoryMap: Record<string, string> = {
      'AI-large-models': 'AI大模型',
      'Bug-summary': 'Bug总结',
      'cloud-native': '云原生',
      'essay': '随笔',
      'everythings': '杂谈',
      'frontend': '前端',
      'java-and-go': 'Java&Go',
      'open-source': '开源',
      'otel': 'OpenTelemetry',
      'privacy-computing': '隐私计算',
      'shenyu': 'ShenYu',
      'wehchat-app': '微信小程序',
      'year-end-summary': '年终总结',
    };
    return categoryMap[category] || category;
  }
  return 'Other';
}

// 加载所有博客文章
export async function loadAllBlogs(): Promise<BlogPost[]> {
  const posts: BlogPost[] = [];
  
  // 动态导入所有模块
  const moduleEntries = Object.entries(blogModules);
  const loadedModules = await Promise.all(
    moduleEntries.map(async ([path, loader]) => ({
      path,
      content: await loader() as string
    }))
  );
  
  for (const { path, content } of loadedModules) {
    if (typeof content !== 'string') continue;
    
    const frontmatter = parseFrontmatter(content);
    if (!frontmatter) continue;
    
    const category = getCategoryFromPath(path);
    
    // 移除 frontmatter，获取纯内容
    let cleanContent = content.replace(/^---\n[\s\S]*?\n---\n*/, '');
    
    // 移除 <!-- truncate --> 标记
    cleanContent = cleanContent.replace(/<!--\s*truncate\s*-->\n*/g, '');
    
    const readingTime = estimateReadingTime(cleanContent);
    
    // 从路径生成 slug（如果 frontmatter 中没有）
    const slugValue = frontmatter.slug || path
      .split('/')
      .pop()
      ?.replace('.md', '')
      .toLowerCase() || '';
    
    // 处理封面图路径
    const imageValue = frontmatter.image;
    let coverImage: string | undefined;
    if (typeof imageValue === 'string') {
      coverImage = imageValue;
    }
    
    const titleValue = String(frontmatter.title || 'Untitled');
    const dateValue = typeof frontmatter.date === 'string' 
      ? new Date(frontmatter.date).toISOString().split('T')[0] 
      : new Date().toISOString().split('T')[0];
    const authorValue = Array.isArray(frontmatter.authors) 
      ? String(frontmatter.authors[0]) 
      : String(frontmatter.authors || frontmatter.author || 'Yuluo');
    const tagsValue = Array.isArray(frontmatter.tags) 
      ? frontmatter.tags.map(String)
      : (Array.isArray(frontmatter.keywords) ? frontmatter.keywords.map(String) : []);
    
    posts.push({
      slug: String(slugValue),
      title: titleValue,
      description: String(frontmatter.description || titleValue),
      date: dateValue,
      author: authorValue,
      tags: tagsValue,
      category,
      content: cleanContent,
      readingTime,
      coverImage,
    });
  }
  
  // 按日期降序排序
  return posts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}
