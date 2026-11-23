import readingTime from 'reading-time';
import { getSession, sameOrigin, json } from '@/lib/session';
import { compilePost, parseTags } from '@/lib/compile-post.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  if (!(await getSession())) return json({ error: 'unauthorized' }, 401);

  const { source, month } = await request.json();
  if (typeof source !== 'string' || !/^\d\d\.\d\d?$/.test(month || '')) return json({ error: 'bad request' }, 400);

  try {
    const { code, frontmatter } = await compilePost(source, month);
    return json({
      code,
      frontmatter: JSON.parse(JSON.stringify(frontmatter)), // Date -> ISO string
      tags: parseTags(frontmatter),
      readingTimeText: readingTime(source).text,
    });
  } catch (e) {
    // 语法错误（含行号）原样返回给编辑器，状态码仍用 200，前端按 error 字段展示
    return json({ error: String(e.message || e) });
  }
}
