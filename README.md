# Shown blogs

Vibe Coding 而来的 Blog V3。

## 搜索索引

站内搜索使用 Pagefind，在构建阶段从 `src/content/blogs` 和 `src/content/topics` 中的 Markdown 文件生成静态索引。

```bash
npm run build
```

构建完成后，搜索索引会写入 `dist/pagefind`，并随 GitHub Pages 静态产物一起发布。

![Alt text](public/img/project/blogv3-1.png)
