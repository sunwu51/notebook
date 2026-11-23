// 注意：这里故意不加 'use client'，让服务端文章页和客户端预览页共用同一份渲染代码
import { getMDXComponent } from 'mdx-bundler/client';
import moment from 'moment-timezone';
import { Button, Card, Tooltip, DirectoryTree } from '@/app/components/Antd';
import { Tabs, Item } from '@/app/components/Tabs';
import AsciinemaPlayer from '@/app/components/AsciinemaPlayer';
import Slider from '@/app/components/Slider';
import Reveal from '@/app/components/Reveal';
import WrapperComponent from '@/app/components/WrapperComponent';

const components = {
  Button, Card, Tooltip, DirectoryTree, Tabs, Item,
  AsciinemaPlayer, Slider, Reveal, WrapperComponent,
};

export default function PostView({ code, frontmatter = {}, readingTimeText, tags = [], fallbackTitle = '' }) {
  const Component = getMDXComponent(code);
  return (
    <>
      <header>
        <h1>{frontmatter.title || fallbackTitle}</h1>
        {frontmatter.description && <p>{frontmatter.description}</p>}
        <div className='flex gap-4'>
          <span>{readingTimeText + (frontmatter.date ? (',created at ' + moment(frontmatter.date).format('YYYY-MM-DD')) : '')}</span>
          <div>
            {tags.length > 0 && tags.map((tag, i) =>
              <span key={i} className=' bg-[var(--w-green-dark)] text-white px-2 py-1 rounded-md mr-1 text-sm'>
                {String(tag).trim()}
              </span>)}
          </div>
        </div>
        <hr></hr>
      </header>
      <main>
        <Component components={components} />
      </main>
    </>
  );
}
