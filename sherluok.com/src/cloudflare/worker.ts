import { GetTokenResponse, PostTokenRequest, PostTokenResponse, TokenInfo } from '^/common/api';
import { createHash, randomBytes } from 'node:crypto';
import { z } from 'zod';

console.log('Local server ready.');

const SECOND = 1000;
const MINUTE = 60 * SECOND;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const Unauthorized = () => new Response('Unauthorized', {
  status: 401,
});

const NotFound = () => new Response('Not Found', {
  status: 404,
});

const MethodNotAllowed = () => new Response('Method Not Allowed', {
  status: 405,
});

const InternalServerError = () => new Response('Internal Server Error', {
  status: 500,
});


export type SessionInfo = z.infer<typeof SessionInfo>;
export const SessionInfo = z.object({
  expiresAt: z.number(),
  username: z.string(),
  admin: z.boolean(),
});

async function createSession(env: Env, info: SessionInfo): Promise<TokenInfo> {
  const token = randomBytes(16).toString('hex');
  const expiresAt = Date.now() + DAY * 7;
  await env.tokens.put(token, JSON.stringify(info), {
    // https://developers.cloudflare.com/kv/api/write-key-value-pairs/#expiring-keys
    expirationTtl: info.expiresAt / SECOND,
  });
  return {
    token,
    expiresAt,
  };
}

async function getSession(env: Env, token: string | undefined | null): Promise<SessionInfo | undefined> {
  if (!token) return undefined;
  if (token === 'c7879817849e9e2b378fc7aa50564b6d') {
    return {
      expiresAt: Infinity,
      username: 'admin',
      admin: true,
    };
  }
  const text = await env.tokens.get(token);
  if (!text) return undefined;
  try {
    return SessionInfo.parse(JSON.parse(text));
  } catch {
    await env.tokens.delete(token);
    return undefined;
  }
}

export default {
  async fetch(request, env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === `/`) {
      if (request.method === 'GET') {
        return new Response('Welcome to https://sherluok.com!');
      }
      return MethodNotAllowed();
    }

    if (url.pathname === `/api/debug`) {
      if (request.method === 'GET') {
        const kernel = await env.storage.head('kernel.js');
        const config = await env.storage.head('config.json');
        return Response.json({
          kernel: kernel,
          config: config,
          sessions: await env.tokens.list().then((res) => res.keys),
        });
      }
      return MethodNotAllowed();
    }

    if (url.pathname === `/api/token`) {
      if (request.method === 'POST') {
        const { username, password } = PostTokenRequest.parse(await request.json());
        if (username === 'default' && password === 'default') {
          const tokenInfo = await createSession(env, {
            expiresAt: Date.now() + DAY,
            username,
            admin: false,
          });
          return Response.json({
            success: true,
            tokenInfo,
          } satisfies PostTokenResponse);
        }
        return Response.json({
          success: false,
        } satisfies PostTokenResponse);
      }
      if (request.method === 'GET') {
        const token = url.searchParams.get('token');
        const session = await getSession(env, token);
        if (token && session) {
          return Response.json({
            valid: true,
            tokenInfo: {
              token: token,
              expiresAt: session.expiresAt,
            },
          } satisfies GetTokenResponse);
        }
        return Response.json({
          valid: false,
        } satisfies GetTokenResponse);
      }
      return MethodNotAllowed();
    }

    if (url.pathname.startsWith('/api/files/')) {
      const session = await getSession(env, url.searchParams.get('token'));
      if (!session) {
        return Unauthorized();
      }
      const key = url.pathname.replace('/api/files/', '');
      if (request.method === 'PUT') {
        const session = await getSession(env, url.searchParams.get('token'));
        if (session && session.admin) {
          console.log({ time: new Date(), event: 'upload', target: key });
          const body = await request.arrayBuffer();
          const object = await env.storage.put(key, body, {
            sha256: createHash('sha256').update(new DataView(body)).digest(),
          });
          if (!object) {
            return InternalServerError();
          }
          const headers = new Headers();
          object.writeHttpMetadata(headers);
          return new Response(null, { headers });
        }
        return Unauthorized();
      }
      if (request.method === 'HEAD') {
        const object = await env.storage.head(key);
        if (!object) {
          return NotFound();
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        if (object.checksums.sha256) {
          headers.set('Content-Digest', `sha-256=:${Buffer.from(object.checksums.sha256).toString('base64')}:`);
        }
        return new Response(null, { headers });
      }
      if (request.method === 'GET') {
        const object = await env.storage.get(key);
        if (!object) {
          return NotFound();
        }
        const headers = new Headers();
        object.writeHttpMetadata(headers);
        return new Response(object.body, { headers });
      }
      return MethodNotAllowed();
    }

    return NotFound();
  },
} satisfies ExportedHandler<Env>;
