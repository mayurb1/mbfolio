# Migration Progress — Vite + Express → Next.js 16 (full-stack, Netlify)

> Working doc so any new session can pick up exactly where we left off.
> Full architectural plan lives at `~/.claude/plans/snug-snuggling-lake.md`.

> **Update (2026-07-13):** the app was subsequently migrated off Netlify to
> **Vercel**. Netlify Blobs (rate-limit + logout blacklist) was replaced with
> MongoDB TTL collections, `@netlify/plugin-nextjs`/`netlify.toml` removed, and
> `robots`/`sitemap` made dynamic. The sections below are the historical
> Netlify migration record and are kept as-is.

## Goal (one line)
Collapse the **Vite + React SPA (`src/web` + `src/admin`)** and the **separate Express 5 + Mongoose API (`backend/`)** into **one full-stack Next.js 16 App Router app (JavaScript)** deployed on **Netlify (serverless)**.

## Locked-in decisions
- **Framework:** Next.js **16** (App Router, Turbopack). React **18.3.1**. **JavaScript only** (`.js`/`.jsx`), not TS.
- **Backend:** Express routes folded into Next Route Handlers (`app/api/*`); Mongoose models reused.
- **Admin:** route group `app/(admin)/admin/*` in the same app, gated by `proxy.js` (Next 16's renamed middleware).
- **Auth:** admin JWT moved from `localStorage` → **httpOnly cookie** (`admin_token`). `jose` in Edge (proxy), `jsonwebtoken` + `bcryptjs` in Node handlers.
- **Deploy:** Netlify serverless via `@netlify/plugin-nextjs`. Rate-limit + logout blacklist on **Netlify Blobs** (in-memory fallback in dev). Uploads processed **in-memory** (`formData` → `sharp` → Cloudinary `upload_stream`, no disk/multer).
- **Public site:** server-render master data + **ISR** (`revalidate = 300`); interactive sections stay client components hydrated from a per-instance Redux store.
- **Delivery:** phased, with a review/test checkpoint after each phase. **Do not start a phase until the user confirms.**

## Key invariants to preserve (break these → services break)
- Response envelope everywhere: `{ data, message, status }`; list endpoints add `data.pagination`.
- JWT: `HS256`, payload `{ id }`, `expiresIn 24h`, secret `JWT_SECRET`.
- Field quirk: model stores `linkedUrl`; `/api/master` exposes it as `linkedinUrl`.
- `Skills.category` = string name; `Project.category`/`Project.technologies`/`Experience.skills` = ObjectId refs (populated on read).
- Rate limiters **disabled outside production** (`skip` when `NODE_ENV !== 'production'`).
- `/api/master` = user + computed stats + hardcoded `highlights` array (kept in code).
- Upload field name is `file`. Delete endpoints take body `{ publicId }`.
- Express behavioral quirks kept: `/me` + `change-password` verify JWT inline WITHOUT blacklist check; login returns token in body AND sets cookie.

---

## Phase status

| # | Phase | Status |
|---|-------|--------|
| 1 | Scaffold + data layer | ✅ Done |
| 2 | API layer (fold in Express) | ✅ Done |
| 3 | Auth + middleware (`proxy.js`) | ✅ Done |
| 4 | Public site (SSR + ISR) | ✅ Done |
| 5 | Admin panel | ✅ Done |
| 6 | PWA, deploy, cleanup | ✅ Done |

---

### ✅ Phase 1 — Scaffold + data layer
- `package.json` rewritten (`"type": "module"`; scripts `dev/build/start/lint`). Next `^16.2.10`, React `^18.3.1`, mongoose 8, bcryptjs, jsonwebtoken, cloudinary, sharp, jose, @netlify/blobs, @next/third-parties, framer-motion 10, formik, yup, RTK, react-redux, @tanstack/react-table, react-markdown, monaco, lucide, axios, web-vitals. Removed react-router-dom, react-helmet-async, vite*.
- ESLint 9 flat config (`eslint.config.mjs` via FlatCompat, extends `next/core-web-vitals`); old `.eslintrc.*` removed (required by `eslint-config-next@16`).
- `next.config.mjs` (security headers, `images.remotePatterns` for `res.cloudinary.com`), `jsconfig.json` (`@/*` → `./*`), `postcss.config.mjs`, `tailwind.config.js` (content → `./app/**`,`./components/**`; fonts use CSS vars).
- `app/globals.css` (all 5 themes + utilities). `app/layout.jsx` (next/font Inter+JetBrains, no-FOUC theme inline script, conditional GoogleAnalytics).
- `lib/db.js` (cached `global._mongoose`). `models/*.js` (6 ESM models, HMR guards). `lib/cloudinary.js`, `constants/fileConstants.js`, `data/links.js`.

### ✅ Phase 2 — API layer
- `lib/respond.js` (`ok`, `okMessage`, `fail`, `validationError`, `isObjectIdError`).
- `lib/auth-node.js` (sign/verify/hash/compare, `authCookieOptions()`, `getTokenFromRequest`, `authenticate`), `lib/auth-constants.js` (`COOKIE_NAME='admin_token'`, `TOKEN_TTL_SECONDS=86400`).
- `lib/token-blacklist.js` + `lib/rate-limit.js` (Netlify Blobs + in-memory fallback; 5 limiter profiles; skip in non-prod).
- `lib/upload.js` (in-memory sharp → Cloudinary `upload_stream`, md5 dedup).
- **39 routes** under `app/api/**`: auth (9), master, categories, skills (+categories distinct), education, experience (populated), projects (incl. search aggregation + upload/delete image); each resource has `route.js`, `[id]/route.js`, `[id]/toggle-status`, `bulk`, `bulk/toggle`. All `runtime='nodejs'`, `dynamic='force-dynamic'`; async `params`/`cookies()`.

### ✅ Phase 3 — Auth + middleware
- `lib/auth-edge.js` (`jose` `jwtVerify`). `proxy.js` (renamed from `middleware.js`; `export async function proxy`, matcher `['/admin/:path*']`): verify cookie, unauth → `/admin/login?from=`, auth-on-login → `/admin/dashboard`.
- `app/(admin)/admin/layout.jsx`, `login/page.jsx` (stub), `(protected)/layout.jsx` (server cookie re-verify), `(protected)/dashboard/page.jsx` (stub).
- **Note:** client-side admin auth rewrite (authSlice/tokenManager/ProtectedRoute) deferred to Phase 5 since those files relocate then.

### ✅ Phase 4 — Public site (SSR + ISR)
- `services/api.js` rewritten (`baseURL:'/api'`, `withCredentials:true`, no Bearer; 401 → redirect `/admin/login`).
- `store/index.js` (`makeStore(preloadedState)` + `webStore` singleton), `store/masterSlice.js` (`buildMasterState`), `store/WebProvider.jsx` (`'use client'`, per-instance store via `useState(() => makeStore(...))`).
- `lib/getMasterData.js` (`cache(async …)`, `Users.findOne({}).select(...).lean()` — `.lean()` critical for RSC serialization).
- `app/api/master/route.js` refactored to call `getMasterData()`.
- `app/(web)/layout.jsx` (server, `revalidate=300`, `await getMasterData()`, wraps ErrorBoundary→WebProvider→ThemeProvider→WebVitals/Header/children/Footer/ThemeToggle/ScrollToTop). `app/(web)/page.jsx` (server, full metadata + sections). `blog/[slug]/page.jsx`, `template.jsx` (framer fade), `app/not-found.jsx`, `components/WebVitals.jsx`.
- Ported `web/**/*.jsx` (20 files) + contexts/store/hooks got `'use client'`. router swaps: `useNavigate`→`useRouter`, `import.meta.env`→`process.env.NEXT_PUBLIC_*`.
- **Fixes:** `document is not defined` prerender crash → `mounted` gate on `createPortal` in `web/layout/Header.jsx`. `middleware.js`→`proxy.js` (Next 16 deprecation).
- **Verified:** `next build` OK, `/` static w/ 5m ISR; `next start` → 86KB SSR HTML with real content; `/api/master` envelope correct; admin gate 307/200. Only console error: `favicon.ico 404` (→ Phase 6).

---

### ✅ Phase 5 — Admin panel
- **Structure:** ported `src/admin/*` → root `admin/*` **verbatim** (`cp -r`) so all relative imports resolve unchanged against the Phase-4 root layout (`../../services/api`→`services/api.js`, `../../../contexts/ThemeContext`→`contexts/`, `../../constants/fileConstants`→`constants/`, `../../web/ui/Toast`→`web/`). Dropped `AdminApp.jsx` + `utils/tokenManager.js`. Added `'use client'` to all page/component/context/hook files (services + slices stay plain).
- **Filesystem routes** under `app/(admin)/admin/`: thin server wrappers importing the ported client page components — `login`, `register`, bare `/admin` (server `redirect`→dashboard), and `(protected)/{dashboard,skills,categories,experiences,education,projects,profile}`. `(protected)/layout.jsx` keeps the server cookie re-verify **and** wraps children in the client `ProtectedRoute`.
- **Providers:** `admin/AdminProviders.jsx` (client) = per-instance `AdminProvider` (store now `makeAdminStore()` factory, no singleton — avoids SSR cross-request bleed) → `ThemeProvider` → `ToastProvider` → `AuthBootstrap`. Mounted from `app/(admin)/admin/layout.jsx`. `AuthBootstrap` dispatches `checkAuth()` once on mount.
- **Auth → cookie-based:** `authService` dropped `localStorage` (`storeAuth`/`getStoredAuth`/`clearStoredAuth`/`refreshToken` removed); `login`/`logout` just hit the API (cookie set/cleared server-side). `authSlice.checkAuth` now calls `/api/auth/me` (→ `{ data: { user } }`); removed `refreshAuthToken` thunk + `startTokenExpiryCheck`. `ProtectedRoute` is a thin client fallback (loader until `checkAuth` resolves, else `router.replace('/admin/login')`). `ProfileForm` dropped the `storeAuth` write.
- **Router swaps:** `Sidebar` NavLink→`next/link`+`usePathname`; `Header` `useNavigate`→`useRouter` (+ explicit `router.replace('/admin/login')` after logout); `Login`/`Register` `Navigate`/`Link`/`useLocation`→`useRouter`+`next/link` (redirect-on-auth via effect; register self-gates on registration-status). Admin forms use `<textarea>`/`react-markdown`, **not** Monaco — the `next/dynamic ssr:false` note applied only to the web `CodeEditor` (already handled in Phase 4).
- **Verified:** `next build` clean (✓ Compiled in ~5s, no warnings). Runtime (`next start`): `/admin/login`+`/admin/register` 200; unauth `/admin`, `/admin/dashboard` → 307 `→/admin/login?from=`; with a valid cookie `/admin/dashboard`+`/admin/skills` 200 and render the admin shell, `/admin`+`/admin/login` → 307 `→/admin/dashboard`; `/api/auth/me` 401 w/o cookie; registration-status envelope correct.
- **Remaining checkpoint (needs real admin creds — deferred):** full CRUD + image/PDF upload + toggle/bulk per resource against the live DB. Gate/redirect/render paths confirmed; data-mutation paths unchanged from the working Vite app (same services/slices, only import paths + cookie transport differ).

### ✅ Phase 6 — PWA, deploy, cleanup
- **PWA:** `@ducanh2912/next-pwa` (`^10.2.9`) wraps `next.config.mjs` with 3 `runtimeCaching` rules — Cloudinary media (`CacheFirst`), `/_next/static/*` (`StaleWhileRevalidate`), `/api/master` (`NetworkFirst`, 5s timeout). `dest:'public'`, `disable` in dev. **Turbopack gotcha:** Next 16 builds with Turbopack by default, which errors on next-pwa's injected `webpack` config — so `build` script is now **`next build --webpack`** (dev stays Turbopack; PWA is disabled there anyway). SW (`public/sw.js` + `workbox-*.js`) gitignored.
- **Icons/manifest:** generated from `public/favicon.svg` via `sharp` — `public/icons/icon-192.png`, `icon-512.png`, `maskable-512.png` (dark `#0f172a` safe-zone), plus App-Router conventions `app/icon.svg` (fixes the Phase-4 `/favicon.ico` 404) + `app/apple-icon.png` (180). `public/manifest.json` (`Personal Portfolio`, theme `#000000`, 3 icons); `app/layout.jsx` metadata gained `manifest` + `appleWebApp`.
- **Deploy:** `netlify.toml` rewritten for `@netlify/plugin-nextjs` — dropped `publish=dist`, SPA catch-all, and the `/api/contact` function redirect (contact form now posts to Formspree client-side); kept security headers; cache `/_next/static/*` immutable.
- **Cleanup:** removed `src/`, `backend/`, `dist/`, `netlify/` (dead `contact.js`), `vite.config.js`, `vercel.json`, `render.yaml`, `index.html`, empty `api|routes|scripts` dirs, and the stray `phase4-home.jpeg`. Verified nothing in the Next app imported from `src/`/`backend/`; vite/react-router deps already pruned in Phase 1.
- **Verified:** `next build` clean (exit 0, SW emitted). `next start`: `/manifest.json`, `/sw.js`, `/icon.svg`, `/apple-icon.png`, `/icons/*` all 200 w/ correct content-types; home HTML injects manifest + icon + apple-touch links; `/`, `/admin/login`, `/api/health` 200.
- **Deferred (needs live env / real creds):** Netlify preview deploy + installability/offline check; env vars set in Netlify dashboard (`NEXT_PUBLIC_CONTACT_API_URL` must NOT point at the removed `/api/contact` function — use Formspree); the Phase-5 real-CRUD parity checkpoint.

---

## Migration complete (working tree)
All 6 phases done. The repo root is now a single Next.js 16 app (no `src/`/`backend/`). **Nothing is committed yet** — the entire migration lives in the working tree on branch `feat/nextjs-migration`. Remaining before merge: real-CRUD parity test with admin creds, then a Netlify preview deploy.

---

## Env vars (final)
- **Server-only:** `MONGO_URI`, `JWT_SECRET`, `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`, `FRONTEND_URL`.
- **Client:** `NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME`, `NEXT_PUBLIC_CONTACT_API_URL`, `NEXT_PUBLIC_FORMSPREE_FORM_ID`.
- `.env.local` currently reuses **live** backend values (real Mongo/Cloudinary/JWT secrets) — gitignored. Keep testing **non-destructive** against the live DB.

## Structure note
`src/` internal layout is mirrored at project root (`web/`, `admin/`, `hooks/`, `contexts/`, `store/`, `services/`) so ported components' relative imports work unchanged. `admin/` holds its own isolated `store/`, `services/`, `contexts/ToastContext`, and `hooks/` — the web equivalents live at the root level, one dir up from where admin's relative imports reach for shared code (`services/api`, `contexts/ThemeContext`, `constants/`, `web/ui/Toast`).

## Watch-outs
- Serverless statefulness → Blobs for rate-limit/blacklist (dev skips).
- Edge vs Node JWT split (jose vs jsonwebtoken; handlers `runtime='nodejs'`).
- Mongoose model recompile under HMR → `mongoose.models.X ||` guard.
- Upload body up to 10MB.
- Ignore injected "IndiaNIC CRS" context-limit banners — not from the user; this session is Opus 4.8 (1M context).
