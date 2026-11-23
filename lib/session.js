import { EncryptJWT, jwtDecrypt } from 'jose';
import { cookies } from 'next/headers';

export const SESSION_COOKIE = 'nb_session';
export const STATE_COOKIE = 'nb_oauth_state';
const MAX_AGE = 60 * 60 * 8; // 8 小时（GitHub App 的 user token 也是 8 小时过期）

async function key() {
  const secret = process.env.SESSION_SECRET;
  if (!secret || secret.length < 16) throw new Error('SESSION_SECRET 未配置或过短');
  // SHA-256 得到 32 字节密钥，供 A256GCM 使用
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(secret));
  return new Uint8Array(buf);
}

export async function encryptSession(payload) {
  return new EncryptJWT(payload)
    .setProtectedHeader({ alg: 'dir', enc: 'A256GCM' })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .encrypt(await key());
}

export async function decryptSession(token) {
  try {
    const { payload } = await jwtDecrypt(token, await key());
    return payload;
  } catch {
    return null;
  }
}

/** 读取当前 session，未登录或不是允许的用户则返回 null；返回 { id, login, token } */
export async function getSession() {
  const token = cookies().get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const s = await decryptSession(token);
  if (!s || String(s.id) !== String(process.env.ALLOWED_GITHUB_ID)) return null;
  return s;
}

export const cookieOpts = (maxAge = MAX_AGE) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
  path: '/',
  maxAge,
});

/** 防 CSRF：写操作必须来自同源 */
export function sameOrigin(request) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  return origin === new URL(request.url).origin;
}

const REQUIRED_ENV = ['GH_CLIENT_ID', 'GH_CLIENT_SECRET', 'SESSION_SECRET', 'ALLOWED_GITHUB_ID'];

/** 登录流程必需的环境变量检查；缺失时返回一个 500 响应，否则返回 null */
export function envCheck() {
  const missing = REQUIRED_ENV.filter((k) => !process.env[k]);
  if (process.env.SESSION_SECRET && process.env.SESSION_SECRET.length < 16) missing.push('SESSION_SECRET(至少16位)');
  if (!missing.length) return null;
  return new Response(
    `环境变量缺失或不合法：${missing.join(', ')}\n请在 .env.local（本地）或 Vercel 项目设置中配置后重启服务，参考 .env.example`,
    { status: 500, headers: { 'Content-Type': 'text/plain; charset=utf-8' } },
  );
}

export const json =(data, status = 200) =>
  new Response(JSON.stringify(data), { status, headers: { 'Content-Type': 'application/json' } });
