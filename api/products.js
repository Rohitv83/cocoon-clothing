import { put, get } from '@vercel/blob';

// Vercel Blob requires a read/write token for server-side private catalog access.
// The token is created automatically when the Blob store is connected with
// 'Add a read-write token env var' enabled.
const BLOB_TOKEN = process.env.BLOB_READ_WRITE_TOKEN || process.env.BLOB_RW_TOKEN;


const CATALOG_PATH = 'cocoon/catalog.json';

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } });
}
function authorized(req) {
  const expected = process.env.COCOON_ADMIN_PASSWORD;
  const auth = req.headers.get('authorization') || '';
  return !!expected && auth === `Bearer ${expected}`;
}
async function readCatalog() {
  if (!BLOB_TOKEN) throw new Error('Missing BLOB_READ_WRITE_TOKEN. Connect the Vercel Blob store with a read-write token enabled.');
  try {
    const result = await get(CATALOG_PATH, { access: 'public', token: BLOB_TOKEN, useCache: false });
    const data = await new Response(result.stream).json();
    return Array.isArray(data) ? data : [];
  } catch {
    try {
      const res = await fetch(new URL('../products.json', import.meta.url), { cache: 'no-store' });
      const data = await res.json();
      return Array.isArray(data) ? data : [];
    } catch { return []; }
  }
}
async function writeCatalog(products) {
  if (!BLOB_TOKEN) throw new Error('Missing BLOB_READ_WRITE_TOKEN. Connect the Vercel Blob store with a read-write token enabled.');
  await put(CATALOG_PATH, JSON.stringify(products, null, 2), {
    access: 'public', token: BLOB_TOKEN, addRandomSuffix: false, allowOverwrite: true, contentType: 'application/json', cacheControlMaxAge: 0
  });
}

export default async function handler(req) {
  try {
    if (req.method === 'GET') return json({ ok: true, products: await readCatalog() });
    if (!authorized(req)) return json({ ok: false, error: 'Unauthorized' }, 401);
    const body = await req.json().catch(() => ({}));

    if (body.action === 'upload-image') {
      const dataUrl = String(body.dataUrl || '');
      const match = dataUrl.match(/^data:(image\/(?:jpeg|png|webp|gif));base64,(.+)$/);
      if (!match) return json({ ok: false, error: 'Invalid image data.' }, 400);
      const id = String(body.id || `img-${Date.now()}`).replace(/[^a-zA-Z0-9_-]/g, '-');
      const ext = match[1] === 'image/png' ? 'png' : match[1] === 'image/webp' ? 'webp' : match[1] === 'image/gif' ? 'gif' : 'jpg';
      if (!BLOB_TOKEN) return json({ ok: false, error: 'Missing BLOB_READ_WRITE_TOKEN. Connect the Vercel Blob store with a read-write token enabled.' }, 500);
      const blob = await put(`cocoon/images/${id}.${ext}`, Buffer.from(match[2], 'base64'), {
        access: 'public', token: BLOB_TOKEN, addRandomSuffix: false, contentType: match[1]
      });
      return json({ ok: true, url: blob.url });
    }

    if (body.action === 'save') {
      const product = body.product;
      if (!product || !product.id || !product.name || !product.gender || !Array.isArray(product.images) || !product.images.length) {
        return json({ ok: false, error: 'Incomplete product data.' }, 400);
      }
      const products = await readCatalog();
      const index = products.findIndex(p => p.id === product.id);
      if (index >= 0) products[index] = product; else products.push(product);
      await writeCatalog(products);
      return json({ ok: true, product, products });
    }

    if (body.action === 'delete') {
      const products = await readCatalog();
      const index = products.findIndex(p => p.id === body.id);
      if (index < 0) return json({ ok: false, error: 'Product not found.' }, 404);
      const removed = products.splice(index, 1)[0];
      await writeCatalog(products);
      return json({ ok: true, products, removed });
    }

    if (body.action === 'reset') {
      const res = await fetch(new URL('../products.json', import.meta.url), { cache: 'no-store' });
      const base = await res.json();
      const products = Array.isArray(base) ? base : [];
      await writeCatalog(products);
      return json({ ok: true, products });
    }

    return json({ ok: false, error: 'Unknown action.' }, 400);
  } catch (error) {
    console.error(error);
    return json({ ok: false, error: error?.message || 'Server error.' }, 500);
  }
}
