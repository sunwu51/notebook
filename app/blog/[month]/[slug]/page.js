import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { bundleMDX } from 'mdx-bundler'
import remarkGfm from 'remark-gfm';
import rehypeSlug from 'rehype-slug';
import rehypePrismPlus from 'rehype-prism-plus';
import toc from "@jsdevtools/rehype-toc";
import remarkCodeTitles from "remark-flexible-code-titles";
import rehypeAutolinkHeadings from 'rehype-autolink-headings';
import rehypeCodeCopyButton from '@/rehypePlugins/rehype-code-copy-button.mjs'
import rehypeTocExt from '@/rehypePlugins/rehype-toc-ext.mjs'
import { getMDXComponent } from 'mdx-bundler/client'
import '@/app/globals.css'
import '@/app/prism-dracula.css'
import querystring from 'querystring';
import Discussion from '@/app/components/discussion';
const readingTime = require('reading-time');
import { Button, Card, Tooltip, DirectoryTree } from '@/app/components/Antd';
import { Tabs, Item } from '@/app/components/Tabs';

export default async function Post({ params }) {
  let { month, slug } = params;
  slug = querystring.unescape(slug);

  var mdxPath = path.join(process.cwd(), month, `${slug}.mdx`);
  var mdPath = path.join(process.cwd(), month, `${slug}.md`);
  const mdxSource = fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, 'utf8') : fs.readFileSync(mdPath, 'utf8');
  const { text: readingTimeText } = readingTime(mdxSource);
  const result = await bundleMDX({
    source: mdxSource,
    cwd: path.join(process.cwd(), 'app', 'components'),
    mdxOptions: (options, frontmatter) => {
      options.remarkPlugins = [...(options.remarkPlugins ?? []), ...[remarkGfm, remarkCodeTitles]]
      options.rehypePlugins = [...(options.rehypePlugins ?? []), ...[
        rehypeSlug,
        [rehypeAutolinkHeadings, { behavior: 'wrap' }],
        [rehypePrismPlus, { ignoreMissing: true, showLineNumbers: true }],
        toc,
        rehypeCodeCopyButton,
        rehypeTocExt,
      ]]
      return options;
    },
    esbuildOptions: options => {
      options.outdir = path.join(process.cwd(), 'public')
      options.write = true
      return options
    }
  })
  const { code, frontmatter } = result
  const Component = getMDXComponent(code)
  return (
    <>
      <header>
        <h1>{frontmatter.title}</h1>
        {frontmatter.description && <p>{frontmatter.description}</p>}
        <div className='flex gap-4'>
          <span>{readingTimeText}</span>
          <div>
            {frontmatter.tags && frontmatter.tags.split(',').filter(item => item.trim().length)
              .map((tag, i) => <span key={i} className=' bg-green-600 text-white px-2 py-1 rounded-md mr-1 text-sm'>{tag.trim()}</span>)}
          </div>
        </div>
      </header>
      <main>
        <Component components={{
          Button,
          Card,
          Tooltip,
          DirectoryTree,
          Tabs,
          Item
        }} />
      </main>
      <div className='container max-w-[1200px] py-12 px-0'>
        <Discussion />
      </div>
    </>
  )
}

export async function generateStaticParams() {
  const path = require('path');
  const POSTS_PATH = process.cwd();
  var filenames = fs.readdirSync(POSTS_PATH);

  const monthes = filenames.filter(item => item.match(/\d\d\.\d\d?/));

  return monthes.flatMap((month) => {
    const filenames = fs.readdirSync(path.join(POSTS_PATH, month));
    const posts = filenames.filter(item => item.match(/\.mdx?$/))
      .map(item => {
        const slug = item.replace(/\.mdx?$/, '');
        return { slug, month };
      });
    return posts;
  })
}
