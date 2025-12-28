import Giscus from '@giscus/react';
import { useThemeStore } from '../../store/themeStore';

export default function Comments() {
  const { theme } = useThemeStore();

  return (
    <div className="mt-16">
      <Giscus
        repo="yuluo-yx/yuluo-yx.github.io"
        repoId="R_kgDONsbRtw"
        category="General"
        categoryId="DIC_kwDONsbRt84CmJ6n"
        mapping="pathname"
        strict="0"
        reactionsEnabled="1"
        emitMetadata="0"
        inputPosition="top"
        theme={theme === 'dark' ? 'dark_dimmed' : 'light'}
        lang="zh-CN"
        loading="lazy"
      />
    </div>
  );
}
