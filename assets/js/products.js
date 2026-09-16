(function () {
  const FALLBACK = [];
  let cache = null;
  window.CocoonProducts = {
    async getAll() {
      try {
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('Could not load products');
        const data = await res.json();
        if (Array.isArray(data.products)) { cache = data.products; return cache; }
      } catch (e) { console.warn('Shared catalogue unavailable:', e); }
      if (Array.isArray(cache)) return cache;
      try {
        const res = await fetch('/products.json?v=' + Date.now(), { cache: 'no-store' });
        const data = await res.json();
        return Array.isArray(data) ? data : FALLBACK;
      } catch (e) { return FALLBACK; }
    },
    slug(value) { return String(value || '').toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''); },
    escape(value) { return String(value ?? '').replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c])); }
  };
})();
