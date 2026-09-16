export default async function handler(req) {
  if (req.method !== 'POST') return new Response(JSON.stringify({ ok:false, error:'Method not allowed' }), { status:405, headers:{'content-type':'application/json'} });
  const body = await req.json().catch(() => ({}));
  const password = String(body.password || '');
  const expected = process.env.COCOON_ADMIN_PASSWORD || '';
  const ok = !!expected && password === expected;
  return new Response(JSON.stringify({ ok }), { status: ok ? 200 : 401, headers:{'content-type':'application/json','cache-control':'no-store'} });
}
