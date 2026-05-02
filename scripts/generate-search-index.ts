import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';
import * as pagefind from 'pagefind';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const ROOT_DIR = path.join(__dirname, '..');
const DIST_DIR = path.join(ROOT_DIR, 'dist');
const BLOGS_DIR = path.join(ROOT_DIR, 'src/content/blogs');
const TOPICS_DIR = path.join(ROOT_DIR, 'src/content/topics');
const OUTPUT_DIR = path.join(DIST_DIR, 'pagefind');

interface SearchRecord {
  url: string;
  title: string;
  description: string;
  content: string;
  type: 'blog' | 'topic';
  category: string;
  tags: string[];
  date: string;
}

function ensureDirectoryExists(dir: string, label: string) {
  if (!fs.existsSync(dir)) {
    throw new Error(`${label} 不存在：${dir}`);
  }
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

function formatDate(value: unknown, fallbackFile: string): string {
  if (value instanceof Date && !Number.isNaN(value.getTime())) {
    return value.toISOString().split('T')[0];
  }

  if (typeof value === 'string' && value.trim()) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? value.trim() : date.toISOString().split('T')[0];
  }

  return fs.statSync(fallbackFile).mtime.toISOString().split('T')[0];
}

function stripMarkdownNoise(content: string): string {
  return content
    .replace(/<!--\s*truncate\s*-->/g, ' ')
    .replace(/```[\w-]*\n/g, '\n')
    .replace(/```/g, '\n')
    .replace(/`([^`]+)`/g, '$1')
    .replace(/!\[[^\]]*]\([^)]*\)/g, ' ')
    .replace(/\[([^\]]+)]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, ' ')
    .replace(/[#>*_~|]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function getCategoryFromBlogPath(filePath: string): string {
  const relativePath = path.relative(BLOGS_DIR, filePath);
  const [category] = relativePath.split(path.sep);
  return category || 'Other';
}

function parseMarkdownFile(filePath: string) {
  const raw = fs.readFileSync(filePath, 'utf-8');
  return matter(raw);
}

function buildBlogRecords(): SearchRecord[] {
  return listMarkdownFiles(BLOGS_DIR).map(filePath => {
    const parsed = parseMarkdownFile(filePath);
    const fileName = path.basename(filePath, '.md');
    const slug = String(parsed.data.slug || fileName.toLowerCase());
    const title = String(parsed.data.title || fileName);
    const description = String(parsed.data.description || title);
    const tags = [
      ...toStringArray(parsed.data.tags),
      ...toStringArray(parsed.data.keywords),
    ];
    const category = getCategoryFromBlogPath(filePath);

    return {
      url: `/blogs/${slug}/`,
      title,
      description,
      content: stripMarkdownNoise(parsed.content),
      type: 'blog',
      category,
      tags: Array.from(new Set(tags)),
      date: formatDate(parsed.data.date, filePath),
    };
  });
}

function buildTopicRecords(): SearchRecord[] {
  return listMarkdownFiles(TOPICS_DIR).map(filePath => {
    const parsed = parseMarkdownFile(filePath);
    const relativeSlug = path.relative(TOPICS_DIR, filePath).replace(/\.md$/, '').split(path.sep).join('/');
    const fileName = path.basename(filePath, '.md');
    const [category = 'topic'] = relativeSlug.split('/');
    const title = String(parsed.data.title || fileName);
    const description = String(parsed.data.description || title);
    const tags = toStringArray(parsed.data.tags);

    return {
      url: `/topics/${relativeSlug}/`,
      title,
      description,
      content: stripMarkdownNoise(parsed.content),
      type: 'topic',
      category,
      tags,
      date: formatDate(parsed.data.date, filePath),
    };
  });
}

function toPagefindContent(record: SearchRecord): string {
  return [
    record.title,
    record.description,
    record.category,
    record.tags.join(' '),
    record.content,
  ].filter(Boolean).join('\n\n');
}

async function main() {
  ensureDirectoryExists(DIST_DIR, '构建产物目录');
  ensureDirectoryExists(BLOGS_DIR, '博客内容目录');
  ensureDirectoryExists(TOPICS_DIR, '专栏内容目录');

  const records = [...buildBlogRecords(), ...buildTopicRecords()];

  if (records.length === 0) {
    throw new Error('没有找到可索引的博客或专栏 Markdown 文件');
  }

  const { index, errors } = await pagefind.createIndex({
    forceLanguage: 'zh',
    includeCharacters: '_-./#',
  });

  if (!index || errors.length > 0) {
    throw new Error(`Pagefind 索引初始化失败：${errors.join('; ') || '未知错误'}`);
  }

  try {
    for (const record of records) {
      const result = await index.addCustomRecord({
        url: record.url,
        content: toPagefindContent(record),
        language: 'zh',
        meta: {
          title: record.title,
        },
        filters: {
          type: [record.type],
          category: [record.category],
          tags: record.tags,
        },
        sort: {
          date: record.date,
        },
      });

      if (result.errors.length > 0) {
        throw new Error(`索引 ${record.url} 失败：${result.errors.join('; ')}`);
      }
    }

    const writeResult = await index.writeFiles({ outputPath: OUTPUT_DIR });

    if (writeResult.errors.length > 0) {
      throw new Error(`写入 Pagefind 文件失败：${writeResult.errors.join('; ')}`);
    }

    console.log('Pagefind search index generated successfully.');
    console.log(`Indexed records: ${records.length}`);
    console.log(`Output: ${writeResult.outputPath}`);
  } finally {
    await pagefind.close();
  }
}

main().catch(error => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
