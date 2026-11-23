import { getSession, json } from '@/lib/session';

export const dynamic = 'force-dynamic';

export async function GET() {
  const s = await getSession();
  return json(s ? { login: s.login } : { login: null });
}
