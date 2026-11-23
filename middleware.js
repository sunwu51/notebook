import { NextResponse } from 'next/server';
import { jwtDecrypt } from 'jose';

// 仅做"是否登录"的快速拦截；接口内还会再校验一次，写入权限最终由 GitHub token 自身决定
export const config = { matcher: ['/write/:path*'] };

export async function middleware(request) {
  const token = request.cookies.get('nb_session')?.value;
  if (token) {
    try {
      const secret = process.env.SESSION_SECRET || '';
      const key = new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret)));
      const { payload } = await jwtDecrypt(token, key);
      if (String(payload.id) === String(process.env.ALLOWED_GITHUB_ID)) return NextResponse.next();
    } catch {}
  }
  const url = new URL('/api/auth/login', request.url);
  url.searchParams.set('next', request.nextUrl.pathname + request.nextUrl.search);
  return NextResponse.redirect(url);
}
