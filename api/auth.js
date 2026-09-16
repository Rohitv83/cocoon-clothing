import { readJsonBody, sendJson } from './_body.js';

export default async function handler(req, res) {
  try {
    if (req.method !== 'POST') return sendJson(res, { ok: false, error: 'Method not allowed' }, 405);
    const body = await readJsonBody(req);
    const password = String(body.password || '');
    const expected = process.env.COCOON_ADMIN_PASSWORD || '';
    const ok = !!expected && password === expected;
    return sendJson(res, { ok }, ok ? 200 : 401);
  } catch (error) {
    console.error(error);
    return sendJson(res, { ok: false, error: error?.message || 'Server error' }, 500);
  }
}
