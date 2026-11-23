import fs from 'fs';
import path from 'path';
import { notFound } from 'next/dist/client/components/not-found';
import readingTime from 'reading-time';
import querystring from 'querystring';
import Discussion from '@/app/components/Discussion';
import PostView from '@/app/components/PostView';
import { compilePost, parseTags } from '@/lib/compile-post.mjs';

export default async function Post({ params }) {
  let { month, slug } = params;
  slug = querystring.unescape(slug);
  var mdxPath = path.join(process.cwd(), month, `${slug}.mdx`);
  var mdPath = path.join(process.cwd(), month, `${slug}.md`);
  let mdxSource;
  try {
    mdxSource = fs.existsSync(mdxPath) ? fs.readFileSync(mdxPath, 'utf8') : fs.readFileSync(mdPath, 'utf8');
  } catch (e) {
    notFound();
  }
  const { text: readingTimeText } = readingTime(mdxSource);
  const { code, frontmatter } = await compilePost(mdxSource, month, { write: true });
  return (
    <>
      <PostView
        code={code}
        frontmatter={frontmatter}
        readingTimeText={readingTimeText}
        tags={parseTags(frontmatter)}
        fallbackTitle={slug}
      />
      <div className='container mx-auto max-w-[1200px] py-12 px-0'>
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

export async function generateMetadata({params}) {
  let { month, slug } = params;
  slug = querystring.unescape(slug);
  return {
    title: `${month} | ${slug}`
  }
}
