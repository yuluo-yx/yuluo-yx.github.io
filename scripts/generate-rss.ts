import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const SITE_URL = 'https://yuluo-yx.github.io';
const SITE_TITLE = "Yuluo's Blog";
const SITE_DESCRIPTION = 'Everything Wins';
const BLOGS_DIR = path.join(__dirname, '../src/content/blogs');
const OUTPUT_PATH = path.join(__dirname, '../public/rss.xml');
const MAX_ITEMS = 30;

interface RssItem {
  title: string;
  link: string;
  description: string;
  pubDate: string;
  guid: string;
  author: string;
  categories: string[];
}

function listMarkdownFiles(dir: string): string[] {
  const results: string[] = [];

  for (const item of fs.readdirSync(dir)) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      results.push(...listMarkdownFiles(fullPath));
    } else if (item.endsWith('.md')) {
      results.push(fullPath);
    }
  }

  return results;
}

function toStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.map(item => String(item).trim()).filter(Boolean);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      return trimmed
        .slice(1, -1)
        .split(',')
        .map(item => item.trim().replace(/^["']|["']$/g, ''))
        .filter(Boolean);
    }

    return trimmed ? [trimmed] : [];
  }

  return [];
}

function formatRfc822Date(value: unknown, fallbackFile: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toUTCString();
  }

  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    if (!Number.isNaN(date.getTime())) {
      return date.toUTCString();
    }
  }

  return fs.statSync(fallbackFile).mtime.toUTCString();
}

function getSortTime(pubDate: string): number {
  const time = new Date(pubDate).getTime();
  return Number.isNaN(time) ? 0 : time;
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function getCategoryFromBlogPath(filePath: string): string {
  const relativePath = path.relative(BLOGS_DIR, filePath);
  const [category] = relativePath.split(path.sep);
  return category || 'Other';
}

function getAuthor(data: Record<string, unknown>): string {
  const authors = toStringArray(data.authors);

  if (authors.length > 0) {
    return authors[0];
  }

  return typeof data.author === 'string' && data.author.trim() ? data.author.trim() : 'Yuluo';
}

function buildRssItems(): RssItem[] {
  return listMarkdownFiles(BLOGS_DIR)
    .map(filePath => {
      const raw = fs.readFileSync(filePath, 'utf-8');
      const parsed = matter(raw);
      const fileName = path.basename(filePath, '.md');
      const slug = String(parsed.data.slug || fileName.toLowerCase());
      const link = `${SITE_URL}/blogs/${encodeURIComponent(slug)}/`;
      const title = String(parsed.data.title || fileName);
      const description = String(parsed.data.description || title);
      const author = getAuthor(parsed.data);
      const categories = Array.from(new Set([
        getCategoryFromBlogPath(filePath),
        ...toStringArray(parsed.data.tags),
        ...toStringArray(parsed.data.keywords),
      ]));

      return {
        title,
        link,
        description,
        pubDate: formatRfc822Date(parsed.data.date, filePath),
        guid: link,
        author,
        categories,
      };
    })
    .sort((a, b) => getSortTime(b.pubDate) - getSortTime(a.pubDate))
    .slice(0, MAX_ITEMS);
}

function itemToXml(item: RssItem): string {
  return `    <item>
      <title>${escapeXml(item.title)}</title>
      <link>${escapeXml(item.link)}</link>
      <description>${escapeXml(item.description)}</description>
      <pubDate>${escapeXml(item.pubDate)}</pubDate>
      <guid isPermaLink="true">${escapeXml(item.guid)}</guid>
      <dc:creator>${escapeXml(item.author)}</dc:creator>
${item.categories.map(category => `      <category>${escapeXml(category)}</category>`).join('\n')}
    </item>`;
}

function generateRss() {
  const items = buildRssItems();
  const lastBuildDate = items[0]?.pubDate || new Date(0).toUTCString();

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${escapeXml(SITE_TITLE)}</title>
    <link>${SITE_URL}/</link>
    <description>${escapeXml(SITE_DESCRIPTION)}</description>
    <language>zh-CN</language>
    <lastBuildDate>${escapeXml(lastBuildDate)}</lastBuildDate>
    <atom:link href="${SITE_URL}/rss.xml" rel="self" type="application/rss+xml" />
${items.map(itemToXml).join('\n')}
  </channel>
</rss>`;

  fs.writeFileSync(OUTPUT_PATH, xml, 'utf-8');
  console.log('RSS feed generated successfully.');
  console.log(`Items: ${items.length}`);
  console.log(`Output: ${OUTPUT_PATH}`);
}

generateRss();
