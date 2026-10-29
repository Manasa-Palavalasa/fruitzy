# Fruitzy: Next.js storefront and test backend

A self-contained Next.js 14 / React 18 e-commerce application with Next.js API routes for authentication, products, carts, addresses, orders, reviews, administration, and campaign content management. No separate backend or database is needed.

## Run

Use Node.js 20 or newer:

```sh
npm ci
npm run dev
```

Open http://localhost:3000. Sign in at `/auth/Login`.

Development seeds these demo accounts automatically; all use **FruitzyDemo123!**:

| Email | Role | Purpose |
| --- | --- | --- |
| admin@fruitzy.test | Administrator | Manage products, users, orders, and campaigns |
| reviewer@fruitzy.test | Administrator | Independently review another author's campaigns |
| shopper@fruitzy.test | Shopper | Test cart, saved address, checkout, and reviews |

The shopper starts with one sample address. The catalog starts with 12 fruit products and local product images. New signups always create ordinary shopper accounts, regardless of any role supplied in the request. An administrator can promote users from Manage Users.

Optional settings are described in `.env.example`. Set `DEMO_SEED_ACCOUNTS=false` to disable demo accounts. For a production-mode **test run**, explicitly enable demo accounts in `.env.local` before running:

```sh
npm run build
npm start
```

Demo accounts are disabled by default outside development. There is no payment processing: checkout records an order and leaves its payment status pending, including when Card or UPI is selected.

## In-memory storage

All backend data lives in a JavaScript object on `globalThis` in the Next.js Node process: users, hashed passwords, sessions, products, carts, addresses, orders, reviews, and campaigns. No database or data files are used. The previous file-based campaign store is no longer read.

- Data is shared across browsers using the same server process.
- Development hot reloads usually retain the object. A full server restart resets everything to the seed data, including accounts and campaigns.
- Restarting invalidates every login token. Refresh and sign in again.
- Multiple Node processes, serverless instances, or application replicas do not share memory. Run one Node process for this testing setup.
- Passwords use salted scrypt hashes. Opaque session tokens expire after 12 hours, are stored as hashes on the server, and are revoked on logout.
- Account roles are checked on the server. Campaign authentication uses the same local sessions, with no loopback HTTP request or external authentication service.

A durable database and shared session store can replace this object later. This storage is intentionally for testing; orders and content do not survive a restart.

## Try the storefront

1. Sign in as `shopper@fruitzy.test` or create an account.
2. Browse, search, filter by category, or sort products.
3. Add products to the cart. The backend enforces five distinct products, positive integer quantities, and available stock.
4. Manage addresses from Profile. Checkout only accepts an address belonging to the signed-in user.
5. Place a test order. The backend calculates totals from current product prices, validates all stock before changing anything, snapshots product/address details, reduces stock, and clears the cart. Client-supplied prices and totals are ignored.
6. Submit a product review with a rating from 1 to 5. Each account can review a product once.
7. Sign in as an administrator to manage product descriptions, images, prices, stock, categories, users, and orders. Dashboard counts and cart badges come from the API.

Product and campaign images accept local raster-image paths or HTTPS images from `images.unsplash.com`, matching the Next.js image allowlist. Arbitrary media uploads are not implemented.

## Campaign studio

Open **Admin > Content Studio** or `/admin/content`.

1. Enter a title, unique slug, promotional text, banner image, alt text, button label, internal destination, and optional featured products.
2. Preview at desktop and mobile widths. Preview includes unsaved form changes.
3. Choose **Publish immediately** to publish as an administrator, or **Ask for review** to save and submit in one request. **Save draft** is also available.
4. For review, sign in as a different administrator, approve the campaign, then choose **Publish approved version**. Self-approval is rejected on this path.
5. Live campaigns appear on the homepage and at `/campaigns/<slug>`, with metadata and featured products.
6. Saving a draft or requesting review preserves any previous live snapshot. Direct publishing replaces it immediately.
7. Unpublish removes the live snapshot. Restore copies an earlier version into a new draft.

Optional `CMS_EDITOR_IDS` is a comma-separated list of local account IDs permitted to author campaigns without administrator rights. For example, use `demo-shopper` to test an editor-only account, then open `/admin/content` directly. Editors can save and submit but cannot approve, publish, or unpublish.

Creating and publishing/submitting is atomic: failed permissions, content checks, or slug validation do not leave a partial campaign behind. Revision checks reject stale updates with HTTP 409. Reload after conflicts. Choosing another campaign or reloading discards unsaved form changes.

## API

All commerce routes are under `/api/commerce`; the frontend uses this same-origin URL automatically.

| Method | Route | Access / behavior |
| --- | --- | --- |
| POST | `/auth/signup`, `/auth/login` | Return `{ user, token }` |
| POST | `/auth/logout` | Revoke the supplied bearer token |
| GET | `/products` | Public; search, category, sort, page, limit |
| GET | `/products/<id>` | Public product details |
| POST / PUT / DELETE | `/products`, `/products/<id>` | Administrator product creation/update/deletion; JSON bodies |
| POST | `/products/<id>/review` | Signed-in rating and review |
| GET | `/reviews/<productId>` | Public paginated reviews |
| GET | `/user/profile` | Current account and addresses |
| POST / DELETE | `/user/address`, `/user/address/<id>` | Add/remove own addresses |
| GET / POST | `/cart` | Read/add to own cart |
| PUT / DELETE | `/cart/<productId>` | Change quantity/remove item |
| DELETE | `/cart/clear` | Empty own cart |
| GET / POST | `/orders` | Read own orders / place a test order |
| GET | `/admin/users`, `/admin/orders`, `/admin/stats` | Administrator lists and counts |
| PATCH | `/admin/users/<id>` | Administrator promotion with `{ "role": "admin" }` |

Private requests require `Authorization: Bearer <token>`. JSON request bodies are limited to 64 KB. Responses use 400 for invalid input, 401 for missing/expired sessions, 403 for forbidden actions, 404 for missing resources, 405 for unsupported methods, and 409 for conflicts or insufficient stock.

Campaign routes:

- `GET /api/content/published`: public live snapshots only; no drafts, history, or account IDs.
- `GET /api/content`: editor/admin campaigns and reviewer capability.
- `POST /api/content`: `{ content, action }`, where action is `save` (default), `submit`, or `publish_direct`.
- `PATCH /api/content/<id>`: `{ revision, action }`; actions are `save`, `submit`, `approve`, `reject`, `publish`, `publish_direct`, `unpublish`, `restore`. Save includes `content`; submit/direct publish can include current `content` atomically. Restore includes `restoreRevision`.

Campaign content checks, permissions, draft/live separation, unique draft/live slugs, and version history are enforced on the server.

## Validation

```sh
npm test -- --runInBand
npm run test:content
npm run build
```

Tests cover account/session permissions, password handling, cart ownership, product validation, checkout totals/stock rollback, order snapshots, reviews, campaign workflows, and in-memory reset behavior. GitHub Actions runs the full test suite and production build. Babel is scoped to Jest; production uses the Next.js SWC compiler.

With a local server running and demo accounts enabled, `node scripts/smoke-backend.mjs` verifies the real HTTP API and campaign pages. Set `SMOKE_BASE_URL` to use a different localhost port. It creates test users, products, orders, reviews, and an unpublished campaign in memory.

For manual testing, publish a campaign and open its public page in another browser; request review with the second administrator; try stale edits in two tabs; complete shopper checkout and view the order as an administrator. Restart the server to verify that data and sessions reset.

## Portfolio wording

After verifying your demo, describe this as a personal project: a React/Next.js e-commerce storefront with a custom content-management API, immediate or reviewed publishing, version restore, role checks, and test checkout. State that storage is in memory. It does not demonstrate WordPress experience or additional professional tenure. Record actual performance measurements before claiming speed improvements.
