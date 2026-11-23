import path from 'path';
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import toc from '@jsdevtools/rehype-toc';
import remarkCodeTitles from 'remark-flexible-code-titles';
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeCopyButton from '@/rehypePlugins/rehype-code-copy-button.mjs';
import rehypeImageSrcModifier from '@/rehypePlugins/rehype-image-src-modifier.mjs';
import rehypeTocExt from '@/rehypePlugins/rehype-toc-ext.mjs';
import { bundleMDX } from 'mdx-bundler';

/**
 * 文章页和在线预览共用的编译逻辑，保证渲染结果一致。
 * @param {string} source  md/mdx 原文
 * @param {string} month   所属月份目录，如 26.11（图片路径改写依赖它）
 * @param {{write?: boolean}} opts write=true 时沿用原先写入 public/ 的行为（仅 build 时用）；预览必须是 false（serverless 文件系统只读）
 */
export async function compilePost(source, month, { write = false } = {}) {
  return bundleMDX({
    source: source + '\n\n# ' + month,
    cwd: path.join(process.cwd(), 'app', 'components'),
    mdxOptions: (options) => {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), remarkGfm, remarkCodeTitles];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
        rehypeCodeCopyButton,
        rehypeImageSrcModifier,
        toc,
        rehypeTocExt,
      ];
      return options;
    },
    esbuildOptions: write
      ? (options) => {
          options.outdir = path.join(process.cwd(), 'public');
          options.write = true;
          return options;
        }
      : undefined,
  });
}

export function parseTags(frontmatter) {
  const t = frontmatter?.tags;
  if (typeof t === 'string') return t.split(',').map((it) => it.trim()).filter((it) => it.length);
  if (Array.isArray(t)) return t;
  return [];
}
