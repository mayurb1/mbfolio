# Multi-User Portfolio — Implementation Plan

> Convert the current single-user portfolio into a multi-user platform where any
> registered user gets their own public portfolio at **`yoursite.com/profile/{username}`**.

**Status:** Draft · **Public URL model:** Path-based (`/profile/{username}`)
**Owner:** _tbd_ · **Last updated:** 2026-07-15

---

## 1. Goal & Scope

**In scope**
- Multiple users can register (registration lock removed).
- Each user owns their own Categories, Skills, Projects, Experience, Education, and profile.
- Each user's public portfolio is served at `/profile/{username}`.
- Admin panel scopes every read/write to the logged-in user.
- Existing data is migrated to the first/original user with zero loss.

**Out of scope (future)**
- Subdomains / custom domains.
- Roles/teams, sharing, or collaboration.
- Public directory/search of all users.
- Billing.

---

## 2. Current Architecture (single-user) — what we're changing

| Layer | Current state | Problem for multi-user |
|---|---|---|
| **Content models** (`models/Category`, `Project`, `Skills`, `Experience`, `Education`) | No `userId` field. All records global. | No ownership → every user sees/edits everyone's data. |
| **Uniqueness** | `Category.name` global-unique; `Skills`/`Project` duplicate checks global; `Users.email` unique. | Name/title collisions across users. Email should stay global-unique. |
| **Registration** (`app/api/auth/register/route.js`) | Hard block: `countDocuments > 0 → 403`. | Only one user can ever exist. |
| **Auth** (`lib/auth-node.js`, `proxy.js`) | Per-user JWT + cookie, email login, admin gate. | ✅ Already multi-user capable — minimal change. |
| **Public data** (`lib/getMasterData.js`) | `Users.findOne({})` grabs first user; counts unscoped. | Always returns one arbitrary user. |
| **Public site** (`app/(web)/`) | Single root `/`, hardcoded metadata "Mayur Bhalgama". | No per-user page/routing/SEO. |
| **Public sections** (`web/sections/Skills|Projects|Experience`) | Client components fetch `/skills`, `/projects`, `/experience`, `/education` with no user param. | Fetch all users' records mixed together. |
| **API GET lists** | Public, return all records. | Must scope to a target user. |
| **API writes / toggles / bulk** (`lib/crud.js`) | Auth-gated but operate by `_id` only. | User A could mutate user B's record by id. |
| **Uploads** (`lib/upload.js`, Cloudinary) | Shared namespace. | File collisions across users. |

---

## 3. Target Architecture

- Every content document carries an indexed **`userId`** (ref `Users`).
- **`Users.username`** — new unique, URL-safe slug. Drives the public route.
- Public portfolio: **`app/(web)/profile/[username]/page.jsx`** (server component) resolves `username → userId`, SSRs the profile, and provides `userId`/`username` to client sections via a **`ProfileContext`**.
- Public GET APIs accept **`?userId=`** (or `?username=`); admin reads derive the target user from the auth cookie. Both handled by one central change to `withRoute` (`auth: 'optional'`) + a `resolveScopeUserId()` helper.
- Writes/toggles/bulk are scoped by `{ _id, userId }` so a user can only touch their own records.

**Scope resolution rule (single source of truth for GET lists):**
```
targetUserId = query.userId
             ?? (query.username → lookup)
             ?? session.user._id   // authenticated admin
             ?? 400 "user scope required"
```

---

## 4. Key Design Decisions

- [x] **Public URL:** path-based `/profile/{username}`.
- [ ] **Root `/` behavior** (pick one): _(default → A)_
  - **A.** Landing page with a link/redirect to a configurable "primary" user's profile (backward-compatible with today's single site).
  - **B.** Generic marketing/landing page.
  - **C.** Redirect to the logged-in user's own profile, else A.
- [ ] **Username source:** auto-slug from name on register **and** let the user edit it later (with uniqueness + reserved-word checks). _Recommended._
- [ ] **Username immutability:** allow change but warn it breaks existing links. _(Alternative: immutable after first set.)_
- [ ] **Reserved usernames:** block `admin`, `api`, `profile`, `login`, `register`, `_next`, etc.
- [ ] **Category ↔ Skill link:** `Skills.category` currently references a category **by name**. Keep by-name but scope resolution to the same `userId` (least churn), **or** migrate to ObjectId ref. _Recommended: keep by-name + userId scope now; ObjectId ref is a separate refactor._

---

## 5. Implementation Phases

Each phase is independently reviewable. Recommended order: **1 → 2 → 3 → 5 (migration) → 4 → 6 → 7 → 8 → 9**.
(Migration runs before public routing so the public pages have owned data to show.)

---

### Phase 0 — Preparation
- [ ] Create branch `feat/multi-user`.
- [ ] Back up the production/staging database (`mongodump`).
- [ ] Confirm `.env` has a way to designate the "primary" user for root `/` (e.g. `PRIMARY_USERNAME`).
- [ ] Add an integration-test harness or at least a manual QA checklist (Phase 8).

---

### Phase 1 — Data model & ownership ✅ COMPLETED

**Files:** `models/Category.js`, `models/Project.js`, `models/Skills.js`, `models/Experience.js`, `models/Education.js`, `models/_shared.js`, `models/users.js`, `lib/username.js` *(new)*

> **Done:** `userId` added to all 5 content models (via `_shared.js` for Experience/Education); `Category.name` global-unique → per-user compound unique index `{userId,name}`; all query indexes userId-prefixed; `username` field added to Users; `lib/username.js` helper created (slugify / reserved words / ensure-unique). Skill-name & project-title uniqueness remain route-level (case-insensitive), so no unique DB index was added for them.

- [ ] Add to each content model:
  ```js
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Users',
    required: true,
    index: true,
  }
  ```
  For `Experience`/`Education`, add it in `models/_shared.js` `timelineFields()` (or alongside the spread) so both inherit it.
- [ ] **Convert global-unique constraints to per-user compound indexes:**
  - `Category`: remove `unique: true` on `name`; add `categorySchema.index({ userId: 1, name: 1 }, { unique: true })`.
  - Update existing indexes to be `userId`-prefixed where they drive per-user queries, e.g.
    - `Project`: `index({ userId: 1, isActive: 1, featured: -1, order: 1 })`, `index({ userId: 1, category: 1 })`.
    - `Skills`: `index({ userId: 1, category: 1, isActive: 1 })`.
    - `Experience`/`Education`: `index({ userId: 1, isActive: 1, order: 1 })`, `index({ userId: 1, startDate: -1 })`.
- [ ] `models/users.js`: add
  ```js
  username: {
    type: String, required: true, unique: true, lowercase: true, trim: true,
    minlength: 3, maxlength: 30,
    match: [/^[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/, 'Invalid username'],
  }
  ```
- [ ] Add a `lib/username.js` helper: `slugify(name)`, `RESERVED` set, `ensureUniqueUsername(base)`.

> ⚠️ Indexes with `unique: true` will fail to build if duplicates exist. Build them **after** the migration (Phase 5) backfills `userId`, or create them non-unique first and tighten later.

---

### Phase 2 — Auth & registration ✅ COMPLETED

**Files:** `app/api/auth/register/route.js`, `app/api/auth/registration-status/route.js`, `app/api/auth/me/route.js`, `admin/pages/Register.jsx`, `admin/components/forms/RegisterForm.jsx`

> **Done:** Single-user lock removed; register now accepts an optional `username` (validated + reserved-word + uniqueness checks) or auto-derives a unique slug from the name, and returns `username`. `registration-status` repurposed to always report open + doubles as a `?username=`/`?email=` availability checker. `me` PUT allows username change (validated, reserved-word, uniqueness, 11000 handling). RegisterForm gained a live-slugged username field (`/profile/{username}` preview); Register page's obsolete registration-closed gate removed.

- [ ] **Remove the single-user lock** in `register/route.js` (delete the `existingAdminCount > 0 → 403` block).
- [ ] Accept optional `username` in the register body; if absent, derive via `ensureUniqueUsername(slugify(name))`. Validate + check reserved words + uniqueness.
- [ ] Return `username` in the register/login/me responses.
- [ ] `registration-status`: today it likely reports "already registered". Redefine it to **email availability** (or retire it) since registration is now open.
- [ ] `me` PUT: allow username change with uniqueness + reserved checks (or mark immutable per §4 decision).
- [ ] Admin register page: add a username field (prefill from name, live-validate).
- [ ] **No change** needed to `login`, `logout`, `proxy.js`, token blacklist — they're already per-user.

---

### Phase 3 — API scoping (the core change) ✅ COMPLETED

**Central files:** `lib/crud.js`, `lib/respond.js` (maybe a new `scopeRequired` error)

> **Done:** `withRoute` now supports `auth: 'optional'`; added `resolveScopeUserId(request, session)` (query `userId` → `username` → session). Factories scoped: `makeToggle`/`makeBulkToggle` operate on `{ _id, userId: session.user._id }`, `makeBulkCreate` stamps `userId` on every item. All 5 resources updated (categories done as reference; projects/skills/experience/education via parallel agents): public GET lists use `auth:'optional'` + scope filter (400 if no scope), POST stamps `userId` + scopes duplicate checks, `[id]` GET public-scoped, PUT/PATCH/DELETE owner-scoped via `findOne/findOneAndUpdate/deleteOne({_id,userId})` with `delete body.userId` on PATCH. `skills/categories` distinct scoped. `master` route + `getMasterData({username|userId})` scope the user lookup and all counts, and expose `username`. All 27 content route files pass `node --check`.

- [ ] Extend `withRoute` to support **optional auth**:
  ```js
  // auth: true | false | 'optional'
  if (auth === true)  { session = await authenticate(request); if (session.error) return session.error }
  if (auth === 'optional') { const s = await authenticate(request); if (!s.error) session = s }
  ```
- [ ] Add a scope resolver used by every GET list + single-GET:
  ```js
  // lib/crud.js
  export async function resolveScopeUserId(request, session) {
    const sp = request.nextUrl.searchParams
    const qUserId = sp.get('userId')
    if (qUserId) return qUserId
    const username = sp.get('username')
    if (username) {
      const u = await Users.findOne({ username: username.toLowerCase() }).select('_id')
      return u?._id?.toString() ?? null
    }
    return session?.user?._id?.toString() ?? null
  }
  ```
- [ ] Update the factories to scope by owner:
  - `makeToggle`: `findOne({ _id: id, userId: session.user._id })`.
  - `makeBulkCreate`: stamp `userId` on every inserted item.
  - `makeBulkToggle`: `updateMany({ _id: { $in: ids }, userId: session.user._id }, ...)`.

**Per-route changes** (apply the same pattern to each resource):

Public list `GET` (`categories`, `projects`, `skills`, `experience`, `education`, `skills/categories`):
- [ ] Set `withRoute(..., { auth: 'optional' })`.
- [ ] `const userId = await resolveScopeUserId(request, session); if (!userId) return fail('User scope required', 400)`.
- [ ] Add `filter.userId = userId`. For `projects` search aggregation, add `userId` to the first `$match`.
- [ ] `skills/categories` `distinct('category', { isActive: true, userId })`.

`POST` create (`categories`, `projects`, `skills`, `experience`, `education`):
- [ ] Stamp `userId: session.user._id` on the new doc.
- [ ] Scope duplicate checks by `userId` (e.g. `Category.findOne({ userId, name: ciExact(name) })`, same for skill name / project title).
- [ ] `skills` POST also scopes the category-existence check by `userId`.

`[id]` `GET`/`PUT`/`PATCH`/`DELETE` (all resources):
- [ ] Replace `findById(id)` with `findOne({ _id: id, userId: session.user._id })` for **writes** (return 404 if not owned).
- [ ] For public single `GET` (`categories/[id]`, `projects/[id]`, etc.), scope via `resolveScopeUserId` (auth optional).
- [ ] Scope duplicate checks (`_id: { $ne: id }` → add `userId`).
- [ ] `categories/[id]` DELETE guard: `Skills.countDocuments({ category: category.name, userId })`.

`toggle-status` / `toggle-featured` / `bulk` — covered by the factory updates above; verify each call passes through the scoped factory.

**Master:**
- [ ] `app/api/master/route.js`: read `?username=`/`?userId=`, pass to `getMasterData`.

---

### Phase 4 — Public routing `/profile/[username]` ✅ COMPLETED

**Files:** `lib/getMasterData.js`, `app/(web)/layout.jsx`, **new** `app/(web)/profile/[username]/page.jsx`, **new** `contexts/ProfileContext.jsx`, **new** `web/layout/PortfolioShell.jsx`, `app/(web)/page.jsx` (root), `app/(web)/blog/[slug]/page.jsx`, `web/sections/{Skills,Projects,Experience,About}.jsx`, `hooks/useMasterData.js`, `store/masterSlice.js`, `services/masterService.js`, `app/sitemap.js`, `app/robots.js`

> **Done & verified with `next build` (exit 0):** `getMasterData` now returns the user `id`; new `ProfileContext` carries `{userId, username}`; new `PortfolioShell` seeds the Redux store + ProfileContext + Header/Footer at page level (the `(web)` layout was slimmed to global chrome only, since a layout can't read the `[username]` param). `/profile/[username]` page: SSG via `generateStaticParams`, dynamic `generateMetadata`, `notFound()` on unknown user, `revalidate=300`. Root `/` redirects to `PRIMARY_USERNAME` (else first user, else `/admin/register`). Blog borrows the primary user's chrome. Client sections (Skills/Projects/Experience) pass `userId` to their scoped fetches; `About`/`useMasterData` pass `username` to `fetchMasterData`; the master service/slice thread `username` to `/master`. Sitemap emits per-user `/profile/{username}`; robots allows `/profile/`.
>
> **Known limitation:** the Contact form still posts to a single env-configured endpoint (Formspree/API URL) — routing contact emails per profile owner is a separate enhancement.

- [ ] `getMasterData(identifier)`: accept `{ userId }` or `{ username }`; scope the `Users.findOne`, and scope `Experience`/`Project` counts by `userId`. Return `null` if not found.
- [ ] **New** `app/(web)/profile/[username]/page.jsx` (server component):
  - Resolve `username → user`; if missing, `notFound()`.
  - `const initialData = await getMasterData({ username })`.
  - Generate **dynamic metadata** (`generateMetadata`) from the user (title/description/OG/canonical `/profile/{username}`).
  - Render sections wrapped in `WebProvider initialData={initialData}` + `ProfileProvider value={{ userId, username }}`.
- [ ] **New** `contexts/ProfileContext.jsx`: `ProfileProvider` + `useProfile()` exposing `{ userId, username }`.
- [ ] Move the section composition (`Hero/About/Skills/Experience/Projects/Contact`) out of the root `page.jsx` into the `[username]` page (or a shared `<PortfolioSections/>`).
- [ ] Update client sections to scope their fetches:
  - `web/sections/Skills.jsx`, `Projects.jsx`, `Experience.jsx`: read `useProfile()` and add `userId` to `useApiResource` params (`params: { isActive: true, userId, ... }`).
  - `About.jsx`: it dispatches `fetchMasterData()` — make the thunk/service accept a `userId`/`username` (see below) or read from preloaded state only.
- [ ] `services/masterService.js` + `store/masterSlice.js`: `fetchMasterData(username)` passes `?username=` to `/master`.
- [ ] Decide `revalidate`/ISR: `[username]` page can use `export const revalidate = 300` and `generateStaticParams` (optional) for known users.
- [ ] **Root `/`** (`app/(web)/page.jsx` + `app/(web)/layout.jsx`): implement §4 decision (default A → redirect to `PRIMARY_USERNAME`'s profile, or render a landing). Remove the hardcoded per-person metadata from the shared layout; move it into the `[username]` page.
- [ ] `web/layout/Header.jsx`, `Footer.jsx`, `Contact.jsx`: verify any links/`fetch` are user-scoped (Contact form endpoint may need `userId` if it emails the profile owner).

---

### Phase 5 — Data migration ✅ COMPLETED (executed 2026-07-15)

**File:** **new** `scripts/migrate-multi-user.mjs` (one-off, idempotent)

> **Done:** Idempotent ESM migration written, syntax-checked, and **executed against the live DB** on 2026-07-15 after a `mongodump` backup (`dump/mbfolio/`). Run with `PRIMARY_USERNAME=mayur-bhalgama node --env-file=.env scripts/migrate-multi-user.mjs`.
>
> **Result:** Primary user set to `mayur-bhalgama` (mayurbhalgama2419@gmail.com). Backfilled `userId`: Category 7/7, Project 11/11, Skills 36/36, Experience 3/3, Education 1/1. `syncIndexes()` ran clean on all 6 models (per-user unique Category index built).
>
> **Fix applied during run:** `models/Education.js` and `models/Experience.js` imported `./_shared` without a `.js` extension; native Node ESM requires it (webpack/Next doesn't). Added `.js` to both — harmless under Next.
>
> **Rollback:** restore from the Phase 0 dump — `mongorestore --drop --uri="$MONGO_URI" dump/`.

- [x] Connect via `mongoose` + `MONGO_URI`.
- [x] Ensure the original user has a `username` (slugify name; `PRIMARY_USERNAME=mayur-bhalgama`).
- [x] For each content collection, `updateMany({ userId: { $exists: false } }, { $set: { userId: <primaryUserId> } })`.
- [x] Build the unique compound indexes **after** backfill via `syncIndexes()`.
- [x] Log a summary of backfill counts.
- [x] Document rollback: restore from the Phase 0 dump.

```bash
# usage
PRIMARY_USERNAME=mayur node scripts/migrate-multi-user.mjs
```

---

### Phase 6 — Admin UI ✅ COMPLETED

**Files:** `admin/pages/Profile.jsx`, `admin/components/forms/ProfileForm.jsx`

> **Done:** Admin list reads need no client change — authenticated GETs derive the target user from the session cookie via `resolveScopeUserId`. Profile page now shows the username + a link to the public `/profile/{username}` URL and lists username under Account Details. ProfileForm gained a validated `username` field with a "changing this breaks existing links" warning and username-taken error handling; the update payload now includes `username`. Verified in `next build`.

- [ ] Admin lists rely on the auth cookie → server derives `userId`; **no client changes required** for scoping (confirm each admin `getAll` hits the scoped GET). If any admin GET currently expects unscoped data, verify it still works with `auth:'optional'` deriving the session user.
- [ ] Profile page (`admin/.../profile`): add username display/edit + validation feedback.
- [ ] Optional: show the user their public URL (`/profile/{username}`) with a copy button.

---

### Phase 7 — Upload namespacing ✅ COMPLETED

**Files:** `lib/upload.js`, `app/api/auth/upload-profile-image`, `app/api/auth/upload-resume`, `app/api/auth/delete-profile-image`, `app/api/projects/upload-image`, `app/api/projects/delete-image`

> **Done:** Uploads are namespaced per owner — Cloudinary folder is now `${kind-folder}/${userId}` (e.g. `portfolio/profiles/<userId>`); `uploadProfileImage/uploadProjectImage/uploadResume` require a `userId` and the routes pass `auth.user._id`. New `ownsAsset(publicId, userId)` guard: both delete routes now return 403 unless the target publicId is in the caller's namespace. Verified in `next build`.
>
> **Note:** legacy assets uploaded before this change live at the old un-namespaced paths, so `ownsAsset` will reject deleting them; re-upload replaces them under the new per-user path.

- [ ] Namespace Cloudinary folders/public_ids per user, e.g. `portfolio/{userId}/projects/...`.
- [ ] Scope delete-image / delete-profile-image / resume routes so a user can only delete assets under their own namespace.

---

### Phase 8 — Testing & QA

- [ ] **Isolation:** create User A + User B; confirm A cannot read/update/delete/toggle B's records (expect 404/empty), incl. bulk endpoints.
- [ ] **Public pages:** `/profile/userA` and `/profile/userB` show only their own data; unknown username → 404.
- [ ] **Uniqueness:** A and B can both have a category named "Frontend"; email stays globally unique; username collisions rejected; reserved usernames rejected.
- [ ] **Migration:** run on a copy of prod; verify all existing records got the original `userId` and the old site (`/profile/{primary}`) is unchanged.
- [ ] **SEO/metadata:** per-user title/description/OG/canonical correct; sitemap/robots updated for `/profile/*`.
- [ ] **Root `/`** behaves per §4 decision.
- [ ] **Uploads:** A's and B's images don't collide; cross-user delete denied.
- [ ] **Rate limiting** still applies per route.

---

### Phase 9 — Rollout

- [ ] Merge behind the migration: deploy code with registration still effectively usable only after migration completes.
- [ ] Run migration on production during a low-traffic window.
- [ ] Build unique indexes.
- [ ] Smoke-test primary user's `/profile/{username}` and root `/`.
- [ ] Announce registration is open.
- [ ] Update `README.md` / `API_BEST_PRACTICES.md` / `MIGRATION.md` with multi-user notes.

---

## 6. Impact Matrix (file-by-file)

| File / area | Change |
|---|---|
| `models/Category.js` | + `userId`; name unique → compound `{userId,name}` |
| `models/Project.js` | + `userId`; userId-prefixed indexes |
| `models/Skills.js` | + `userId`; userId-prefixed index |
| `models/Experience.js`, `models/Education.js`, `models/_shared.js` | + `userId` in shared fields; userId-prefixed indexes |
| `models/users.js` | + `username` (unique, validated) |
| `lib/username.js` *(new)* | slugify / reserved / ensure-unique |
| `app/api/auth/register/route.js` | remove single-user lock; handle username |
| `app/api/auth/registration-status/route.js` | redefine or retire |
| `app/api/auth/me/route.js` | username edit + validation |
| `lib/crud.js` | `auth:'optional'`, `resolveScopeUserId`, scope factories |
| `app/api/{categories,projects,skills,experience,education}/route.js` | GET scope + POST stamp/scope |
| `app/api/{...}/[id]/route.js` | own-scoped find/update/delete + scoped dup checks |
| `app/api/{...}/toggle-*`, `bulk`, `bulk/toggle` | via scoped factories |
| `app/api/skills/categories/route.js` | scope `distinct` by userId |
| `lib/getMasterData.js` | accept identifier; scope user + counts |
| `app/api/master/route.js` | pass `?username`/`?userId` |
| `app/(web)/profile/[username]/page.jsx` *(new)* | per-user SSR + dynamic metadata |
| `contexts/ProfileContext.jsx` *(new)* | provide `{userId, username}` to sections |
| `app/(web)/layout.jsx`, `app/(web)/page.jsx` | de-hardcode metadata; root behavior |
| `web/sections/Skills.jsx`, `Projects.jsx`, `Experience.jsx`, `About.jsx` | pass `userId` to fetches |
| `store/masterSlice.js`, `services/masterService.js` | `fetchMasterData(username)` |
| `app/sitemap.js`, `app/robots.js` | include `/profile/*` |
| `lib/upload.js`, `lib/cloudinary.js`, upload/delete routes | per-user namespacing + scoped delete |
| `admin/.../profile`, `admin/services/*` | username UI; confirm scoped reads |
| `scripts/migrate-multi-user.mjs` *(new)* | backfill `userId`, set primary username |

---

## 7. Risks & Mitigations

- **Unique-index build fails on existing dupes** → build unique indexes only after migration backfills `userId`; verify no intra-user name/title dupes first.
- **A public GET without a user scope leaks/errors** → central `resolveScopeUserId` returns 400 when scope is missing; add a test.
- **Client sections silently fetch unscoped data** → guard: sections must not fetch until `userId` from `useProfile()` is available.
- **Broken links if username changes** → warn on change (or make immutable).
- **Cross-user asset deletion** → enforce namespace prefix check in delete routes.
- **Root `/` regression** for the current single site → decision A (redirect to `PRIMARY_USERNAME`) preserves today's UX.

---

## 8. Open Decisions (please confirm)

1. Root `/` behavior — **A / B / C** (§4). Default: **A**.
2. Username editable after creation, or immutable? Default: **editable with warning**.
3. Keep `Skills.category` by-name (scoped) now, or refactor to ObjectId ref? Default: **keep by-name now**.
4. `PRIMARY_USERNAME` value for the existing data owner.
