import { NextResponse } from 'next/server';
import { SESSION_COOKIE, sameOrigin } from '@/lib/session';

export async function POST(request) {
  if (!sameOrigin(request)) return new Response('forbidden', { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(SESSION_COOKIE);
  return res;
}
