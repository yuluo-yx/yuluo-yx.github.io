import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DIST_DIR = path.join(__dirname, '../dist');
const INDEX_HTML_PATH = path.join(DIST_DIR, 'index.html');
const SITEMAP_PATH = path.join(DIST_DIR, 'sitemap.xml');

// 补齐未进入 sitemap 但实际存在的前端路由，避免直达时继续落到 404 页面。
const EXTRA_ROUTES = ['/resume'];

function ensureFileExists(filePath: string, label: string) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`${label} 不存在：${filePath}`);
  }
}

function parseRoutesFromSitemap(sitemapContent: string): string[] {
  const locMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g) || [];
  const routes = new Set<string>();

  for (const loc of locMatches) {
    const urlText = loc.replace('<loc>', '').replace('</loc>', '').trim();
    const pathname = new URL(urlText).pathname;

    if (pathname === '/') {
      continue;
    }

    routes.add(pathname);
  }

  for (const route of EXTRA_ROUTES) {
    routes.add(route);
  }

  return Array.from(routes).sort((left, right) => left.localeCompare(right, 'zh-CN'));
}

function writeRouteEntry(routePath: string, template: string) {
  const normalizedRoute = routePath.replace(/^\/+/, '').replace(/\/+$/, '');
  const targetDir = path.join(DIST_DIR, normalizedRoute);

  fs.mkdirSync(targetDir, { recursive: true });
  fs.writeFileSync(path.join(targetDir, 'index.html'), template, 'utf-8');
}

function main() {
  ensureFileExists(INDEX_HTML_PATH, '站点入口文件');
  ensureFileExists(SITEMAP_PATH, '站点 sitemap');

  const indexTemplate = fs.readFileSync(INDEX_HTML_PATH, 'utf-8');
  const sitemapContent = fs.readFileSync(SITEMAP_PATH, 'utf-8');
  const routes = parseRoutesFromSitemap(sitemapContent);

  for (const route of routes) {
    writeRouteEntry(route, indexTemplate);
  }

  console.log(`✅ Route pages generated successfully!`);
  console.log(`📄 Total generated routes: ${routes.length}`);
}

main();
