# COCOON — Shared Product Manager + Analytics

This version uses Vercel Functions + Vercel Blob for shared product data, product images and analytics. Product data/analytics are kept server-side; public product images are served from Vercel Blob.

## What changed
- Products are stored centrally, not in browser localStorage.
- Uploaded product images are stored in Vercel Blob and work on every device.
- Men/Women/product pages load the shared live catalogue.
- Product Manager remove/add changes are shared across devices.
- Analytics events are stored centrally and the dashboard reads shared traffic from all visitors.
- Analytics is password-protected.
- Quote form has one visible action: Submit, which opens WhatsApp with the enquiry pre-filled.
- WhatsApp number: +91 93549 27609.

## Deployment
1. Upload the contents of this folder as the Vercel project root, or push this folder to GitHub and import it into Vercel.
2. Create/attach a Vercel Blob store to the project.
3. Add the Vercel environment variable `COCOON_ADMIN_PASSWORD` with your private admin password.
4. Redeploy after adding the environment variable.
5. Open `/admin.html` and log in with that password.
6. Open `/analytics.html` and log in with the same password.

Vercel's current Blob setup can provide the Blob authentication to Functions automatically when the store is attached to the project. If your store uses a token-based setup, Vercel exposes `BLOB_READ_WRITE_TOKEN` to the project as documented by Vercel.

Do not put the admin password into a public JSON file. The old `admin-password.json` file has been removed.


IMPORTANT VERCEL BLOB SETUP
1. Create a Vercel Blob Store with Public access for product images.
2. Connect the Blob Store to the cocoon-clothing project.
3. In the Connect Project dialog, enable 'Add a read-write token env var'.
4. Keep Production enabled (Preview optional). This creates BLOB_READ_WRITE_TOKEN, which the API uses for shared products and analytics.
5. Add COCOON_ADMIN_PASSWORD in Vercel Environment Variables.
6. Redeploy after changing environment variables.
