import { NextResponse } from 'next/server';
import { SESSION_COOKIE, STATE_COOKIE, cookieOpts, encryptSession, envCheck } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const bad = envCheck();
  if (bad) return bad;
  const { origin, searchParams } = new URL(request.url);
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const fail = (msg, status = 400) => new Response(msg, { status });

  let saved;
  try { saved = JSON.parse(request.cookies.get(STATE_COOKIE)?.value || ''); } catch {}
  if (!code || !saved || saved.state !== state) return fail('state 校验失败，请重新登录');

  // code 换 token（必须在服务端做：需要 client_secret，且该接口不支持 CORS）
  const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
    method: 'POST',
    headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
    body: JSON.stringify({
      client_id: process.env.GH_CLIENT_ID,
      client_secret: process.env.GH_CLIENT_SECRET,
      code,
      redirect_uri: `${origin}/api/auth/callback`,
    }),
  });
  const tokenJson = await tokenRes.json();
  if (!tokenJson.access_token) {
    return fail('获取 token 失败: ' + (tokenJson.error_description || tokenJson.error), 401);
  }

  const userRes = await fetch('https://api.github.com/user', {
    headers: { Authorization: `Bearer ${tokenJson.access_token}`, Accept: 'application/vnd.github+json' },
  });
  if (!userRes.ok) return fail('获取用户信息失败', 401);
  const user = await userRes.json();

  // 比对数字 id（login 可以被改名）
  if (String(user.id) !== String(process.env.ALLOWED_GITHUB_ID)) {
    return fail(`无权限：${user.login} 不是博客作者`, 403);
  }

  const session = await encryptSession({ id: user.id, login: user.login, token: tokenJson.access_token });
  const next = saved.next && saved.next.startsWith('/') && !saved.next.startsWith('//') ? saved.next : '/write';
  const res = NextResponse.redirect(new URL(next, origin));
  res.cookies.set(SESSION_COOKIE, session, cookieOpts());
  res.cookies.delete(STATE_COOKIE);
  return res;
}
