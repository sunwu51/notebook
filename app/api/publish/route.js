import { getSession, sameOrigin, json } from '@/lib/session';
import { compilePost } from '@/lib/compile-post.mjs';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

const REPO = process.env.GH_REPO || 'sunwu51/notebook';
const BRANCH = process.env.GH_BRANCH || 'master';

async function gh(token, path, init = {}) {
  const res = await fetch(`https://api.github.com/repos/${REPO}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(`GitHub ${res.status}: ${data.message || 'error'}`);
  return data;
}

export async function POST(request) {
  if (!sameOrigin(request)) return json({ error: 'forbidden' }, 403);
  const session = await getSession();
  if (!session) return json({ error: 'unauthorized' }, 401);

  const { month, filename, content, message } = await request.json();
  if (!/^\d\d\.\d\d?$/.test(month || '')) return json({ error: '月份目录格式不对，应为 26.11' }, 400);
  // 文件名：不允许路径分隔符，必须 .md/.mdx 结尾
  if (typeof filename !== 'string' || !/^[^/\\]+\.mdx?$/.test(filename) || filename.startsWith('.')) {
    return json({ error: '文件名不合法' }, 400);
  }
  if (typeof content !== 'string' || !content.trim()) return json({ error: '内容为空' }, 400);

  // 发布前先编译一遍，语法错误就拦住，避免把 Vercel 构建搞挂
  try {
    await compilePost(content, month);
  } catch (e) {
    return json({ error: 'MDX 编译失败，未发布：\n' + String(e.message || e) }, 422);
  }

  const path = `${month}/${filename}`;
  try {
    const t = session.token;
    const ref = await gh(t, `/git/ref/heads/${BRANCH}`);
    const headSha = ref.object.sha;
    const headCommit = await gh(t, `/git/commits/${headSha}`);
    const blob = await gh(t, '/git/blobs', {
      method: 'POST',
      body: JSON.stringify({ content, encoding: 'utf-8' }),
    });
    const tree = await gh(t, '/git/trees', {
      method: 'POST',
      body: JSON.stringify({
        base_tree: headCommit.tree.sha,
        tree: [{ path, mode: '100644', type: 'blob', sha: blob.sha }],
      }),
    });
    const commit = await gh(t, '/git/commits', {
      method: 'POST',
      body: JSON.stringify({
        message: message || `✍️ ${path}`,
        tree: tree.sha,
        parents: [headSha],
      }),
    });
    // 非强制更新：期间若远端有新提交会失败，而不是覆盖
    await gh(t, `/git/refs/heads/${BRANCH}`, {
      method: 'PATCH',
      body: JSON.stringify({ sha: commit.sha, force: false }),
    });
    return json({ ok: true, path, commitUrl: `https://github.com/${REPO}/commit/${commit.sha}` });
  } catch (e) {
    return json({ error: String(e.message || e) }, 502);
  }
}
