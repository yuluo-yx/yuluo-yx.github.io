/**
 * 提取 Markdown 标题的可见文本。
 *
 * 目录只需要展示链接标签，链接地址仍由正文中的 Markdown 标题负责渲染。
 */
export const getMarkdownHeadingText = (markdown: string): string => {
  let text = '';
  let index = 0;

  while (index < markdown.length) {
    const linkStart = markdown[index] === '['
      ? index
      : markdown[index] === '!' && markdown[index + 1] === '['
        ? index + 1
        : -1;

    if (linkStart === -1) {
      text += markdown[index];
      index += 1;
      continue;
    }

    const labelEnd = findUnescapedCharacter(markdown, ']', linkStart + 1);
    if (labelEnd === -1 || markdown[labelEnd + 1] !== '(') {
      text += markdown[index];
      index += 1;
      continue;
    }

    const destinationEnd = findClosingParenthesis(markdown, labelEnd + 1);
    if (destinationEnd === -1) {
      text += markdown[index];
      index += 1;
      continue;
    }

    text += getMarkdownHeadingText(markdown.slice(linkStart + 1, labelEnd));
    index = destinationEnd + 1;
  }

  return text.trim();
};

/** 生成目录与正文共用的标题锚点。 */
export const generateHeadingSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\u4e00-\u9fa5\s-]/g, '')
    .trim()
    .replace(/\s+/g, '_')
    .replace(/-+/g, '_');
};

const findUnescapedCharacter = (text: string, character: string, start: number): number => {
  for (let index = start; index < text.length; index += 1) {
    if (text[index] === character && text[index - 1] !== '\\') {
      return index;
    }
  }

  return -1;
};

const findClosingParenthesis = (text: string, openingIndex: number): number => {
  let depth = 0;

  for (let index = openingIndex; index < text.length; index += 1) {
    if (text[index - 1] === '\\') {
      continue;
    }

    if (text[index] === '(') {
      depth += 1;
    } else if (text[index] === ')') {
      depth -= 1;
      if (depth === 0) {
        return index;
      }
    }
  }

  return -1;
};
