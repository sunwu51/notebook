import { NextResponse } from 'next/server';
import { STATE_COOKIE, cookieOpts, envCheck } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET(request) {
  const bad = envCheck();
  if (bad) return bad;
  const { origin, searchParams } = new URL(request.url);
  const state = crypto.randomUUID();
  const next = searchParams.get('next') || '/write';
  const url = new URL('https://github.com/login/oauth/authorize');
  url.searchParams.set('client_id', process.env.GH_CLIENT_ID);
  url.searchParams.set('redirect_uri', `${origin}/api/auth/callback`);
  url.searchParams.set('state', state);
  // OAuth App 需要 scope（如 public_repo）；GitHub App 不需要，留空即可
  if (process.env.GH_OAUTH_SCOPE) url.searchParams.set('scope', process.env.GH_OAUTH_SCOPE);
  const res = NextResponse.redirect(url);
  // state 与登录后跳转地址一起存，callback 时校验
  res.cookies.set(STATE_COOKIE, JSON.stringify({ state, next }), cookieOpts(600));
  return res;
}
