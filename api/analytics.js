import { put, list, get } from '@vercel/blob';
import { readJsonBody, sendJson } from './_body.js';

const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_RW_TOKEN;

function authorized(req) {
  const expected = process.env.COCOON_ADMIN_PASSWORD;
  const auth = req.headers.authorization || '';
  return !!expected && auth === `Bearer ${expected}`;
}

export default async function handler(req, res) {
  try {
    if (req.method === 'POST') {
      const input = await readJsonBody(req);
      const event = {
        type: String(input.type || 'event').slice(0, 30),
        visitor_id: String(input.visitor_id || '').slice(0, 100),
        session_id: String(input.session_id || '').slice(0, 100),
        page: String(input.page || '').slice(0, 255),
        url: String(input.url || '').slice(0, 1000),
        referrer: String(input.referrer || '').slice(0, 1000),
        label: String(input.label || '').slice(0, 100),
        form: String(input.form || '').slice(0, 100),
        product: String(input.product || '').slice(0, 255),
        timestamp: String(input.timestamp || new Date().toISOString()).slice(0, 50),
        screen_width: Number(input.screen_width || 0),
        screen_height: Number(input.screen_height || 0),
        user_agent: String(req.headers['user-agent'] || '').slice(0, 500)
      };
      if (!BLOB_TOKEN) return sendJson(res, { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN. Connect the Vercel Blob store with a read-write token enabled.' }, 500);
      const stamp = Date.now();
      await put(`cocoon/analytics/${stamp}-${Math.random().toString(36).slice(2)}.json`, JSON.stringify(event), {
        access: 'private', token: BLOB_TOKEN, addRandomSuffix: false, contentType: 'application/json'
      });
      return sendJson(res, { ok: true });
    }

    if (req.method === 'GET') {
      if (!authorized(req)) return sendJson(res, { ok: false, error: 'Unauthorized' }, 401);
      if (!BLOB_TOKEN) return sendJson(res, { ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN. Connect the Vercel Blob store with a read-write token enabled.' }, 500);
      const url = new URL(req.url || '/', `https://${req.headers.host || 'localhost'}`);
      const days = Math.max(1, Math.min(365, Number(url.searchParams.get('days') || 30)));
      const since = Date.now() - days * 86400000;
      const events = [];
      let cursor;
      do {
        const page = await list({ prefix: 'cocoon/analytics/', cursor, token: BLOB_TOKEN });
        for (const b of page.blobs) {
          const m = b.pathname.match(/cocoon\/analytics\/(\d+)-/);
          if (!m || Number(m[1]) < since) continue;
          try {
            const result = await get(b.pathname, { access: 'private', token: BLOB_TOKEN, useCache: false });
            events.push(await new Response(result.stream).json());
          } catch {}
        }
        cursor = page.hasMore ? page.cursor : undefined;
      } while (cursor);
      events.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      return sendJson(res, { ok: true, events, days });
    }

    return sendJson(res, { ok: false, error: 'Method not allowed' }, 405);
  } catch (error) {
    console.error(error);
    return sendJson(res, { ok: false, error: error?.message || 'Server error' }, 500);
  }
}
