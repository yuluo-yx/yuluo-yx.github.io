import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

interface SitemapUrl {
  loc: string;
  lastmod: string;
  changefreq: string;
  priority: string;
}

const SITE_URL = 'https://yuluo-yx.github.io';
const OUTPUT_PATH = path.join(__dirname, '../public/sitemap.xml');

// 静态页面路由
const staticRoutes: SitemapUrl[] = [
  {
    loc: '/',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    loc: '/blogs',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'daily',
    priority: '0.9',
  },
  {
    loc: '/topics',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'weekly',
    priority: '0.8',
  },
  {
    loc: '/projects',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.7',
  },
  {
    loc: '/gallery',
    lastmod: new Date().toISOString().split('T')[0],
    changefreq: 'monthly',
    priority: '0.6',
  },
];

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

// 获取文件的最后修改时间
function getFileLastModified(filePath: string): string {
  const stats = fs.statSync(filePath);
  return stats.mtime.toISOString().split('T')[0];
}

// 扫描博客文章
function scanBlogPosts(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const blogsDir = path.join(__dirname, '../src/content/blogs');

  function scanDirectory(dir: string) {
    const items = fs.readdirSync(dir);

    for (const item of items) {
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);

      if (stat.isDirectory()) {
        scanDirectory(fullPath);
      } else if (item.endsWith('.md')) {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const frontmatter = parseFrontmatter(content);

        if (frontmatter) {
          const slug = frontmatter.slug || item.replace('.md', '').toLowerCase();
          const date = typeof frontmatter.date === 'string'
            ? new Date(frontmatter.date).toISOString().split('T')[0]
            : getFileLastModified(fullPath);

          urls.push({
            loc: `/blogs/${slug}`,
            lastmod: date,
            changefreq: 'monthly',
            priority: '0.6',
          });
        }
      }
    }
  }

  scanDirectory(blogsDir);
  return urls;
}

// 扫描专栏文章
function scanTopicArticles(): SitemapUrl[] {
  const urls: SitemapUrl[] = [];
  const topicsDir = path.join(__dirname, '../src/content/topics');

  const topicCategories = fs.readdirSync(topicsDir).filter(item => {
    const fullPath = path.join(topicsDir, item);
    return fs.statSync(fullPath).isDirectory();
  });

  for (const category of topicCategories) {
    const categoryPath = path.join(topicsDir, category);

    function scanDirectory(dir: string, relativePath = '') {
      const items = fs.readdirSync(dir);

      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
          scanDirectory(fullPath, relativePath ? `${relativePath}/${item}` : item);
        } else if (item.endsWith('.md')) {
          const content = fs.readFileSync(fullPath, 'utf-8');
          const frontmatter = parseFrontmatter(content);

          if (frontmatter) {
            const slug = frontmatter.slug || item.replace('.md', '');
            const articlePath = relativePath ? `${category}/${relativePath}/${slug}` : `${category}/${slug}`;
            const date = typeof frontmatter.date === 'string'
              ? new Date(frontmatter.date).toISOString().split('T')[0]
              : getFileLastModified(fullPath);

            urls.push({
              loc: `/topics/${articlePath}`,
              lastmod: date,
              changefreq: 'monthly',
              priority: '0.5',
            });
          }
        }
      }
    }

    scanDirectory(categoryPath);
  }

  return urls;
}

// 生成 sitemap XML
function generateSitemap() {
  const blogUrls = scanBlogPosts();
  const topicUrls = scanTopicArticles();
  const allUrls = [...staticRoutes, ...blogUrls, ...topicUrls];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allUrls.map(url => `  <url>
    <loc>${SITE_URL}${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
  console.log(`✅ Sitemap generated successfully!`);
  console.log(`📄 Total URLs: ${allUrls.length}`);
  console.log(`   - Static pages: ${staticRoutes.length}`);
  console.log(`   - Blog posts: ${blogUrls.length}`);
  console.log(`   - Topic articles: ${topicUrls.length}`);
  console.log(`📍 Output: ${OUTPUT_PATH}`);
}

// 运行生成
generateSitemap();
