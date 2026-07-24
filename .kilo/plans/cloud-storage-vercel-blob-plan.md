# Revised Plan: Vercel Blob Storage + API Cleanup

## Scope

CORS and `NEXT_PUBLIC_API_URL` removed — unnecessary for same-domain Vercel hosting. Focus: provider-abstracted storage that supports runtime swap, correct edge-case handling, and full test coverage.

---

## Env vars

Add to `utils/env.ts` + `.env.example` + `.env.test`:

| Var                         | Required | Zod type                                               | Default                            | Purpose                                                                |
| --------------------------- | -------- | ------------------------------------------------------ | ---------------------------------- | ---------------------------------------------------------------------- |
| `UPLOAD_PROVIDER`           | No       | `z.enum(["local", "vercel-blob"]).default("local")`    | `"local"`                          | Selects the active storage provider                                    |
| `BLOB_READ_WRITE_TOKEN`     | No       | `z.string().optional()`                                | —                                  | Vercel Blob token (validated at runtime if provider = `"vercel-blob"`) |
| `NEXT_PUBLIC_BLOB_CDN_HOST` | No       | `z.string().default("public.blob.vercel-storage.com")` | `"public.blob.vercel-storage.com"` | Blob CDN hostname for `next.config.ts` remote patterns                 |

Runtime validation: `saveUpload` throws `"BLOB_READ_WRITE_TOKEN required when UPLOAD_PROVIDER=vercel-blob"` if the token is missing. The zod-level optionality keeps local dev clean.

---

## File changes (implementation order)

### 1. `lib/upload.ts` — provider abstraction

**Architecture**: `saveUpload` and `deleteUpload` become dispatchers. Each provider is an object with `save(file, access?)` and `del(urlOrKey)` methods, registered in a list. `deleteUpload` iterates the list calling `canHandle(url)` on each.

```ts
type UploadProvider = {
  name: string;
  canHandle: (url: string) => boolean; // URL → delete routing
  save: (file: File, access?: AccessMode) => Promise<UploadResult>;
  del: (url: string) => Promise<boolean>;
};
```

**Why registry over hardcoded `if/else`**: Adding S3 later (or a custom CDN) requires only registering a new provider. No URL pattern changes in the dispatcher.

**Changes**:

- Extract `localProvider`, `blobProvider` objects
- `saveUpload(file, access?)` reads `env.UPLOAD_PROVIDER`, selects registered provider by `name`, calls `provider.save(file, access)`
  - If `UPLOAD_PROVIDER === "vercel-blob"` and `!env.BLOB_READ_WRITE_TOKEN` → throw `new Error("BLOB_READ_WRITE_TOKEN required when UPLOAD_PROVIDER=vercel-blob")`
- `deleteUpload(url)` iterates providers calling `canHandle(url)`, dispatches to first match
  - `localProvider.canHandle(url)` → `url.startsWith("/uploads/")`
  - `blobProvider.canHandle(url)` → `url.includes("blob.vercel-storage.com")` (or the custom CDN host)
  - No match → `return false`
- `blobProvider.del(url)` wraps `del()` from `@vercel/blob`; catches thrown errors, returns `false` instead of throwing
- Lazy `import("@vercel/blob")` only when `blobProvider.save/del` is first called
- `access` param: local provider ignores it (all files go to `/uploads/`); blob provider passes it to `put()`

### 2. `app/api/upload/route.ts` — access param + DELETE contract

- `handlePOST`: pass `access: "public"` → `saveUpload(file, "public")`
- `handleDELETE`: accept `{ url }` in JSON body. Accept `{ filename }` too for backward compat (transition period):
  ```ts
  const body = await request.json().catch(() => ({}));
  const url = body.url ?? (body.filename ? `/uploads/${body.filename}` : null);
  if (!url) throw new ValidationError("Missing 'url' in request body");
  const deleted = await deleteUpload(url);
  ```

### 3. `app/api/user/resumes/route.ts` — private access

- `handlePOST`: pass `access: "private"` → `saveUpload(file, "private")`

### 4. `app/api/files/download/route.ts` — dual-mode with streaming

- If `rawPath` starts with `http://` or `https://`:
  - **Auth decision**: The route knows the caller's role and can inspect which file type. Resumes are always `access: "private"`, logos are `access: "public"`. Use `requireRole` context to decide: if the file belongs to a resume, send `Authorization: Bearer ${BLOB_READ_WRITE_TOKEN}`. If the file is a company logo, no auth header needed (public).
  - **No URL-heuristic sniffing** — rely on role + DB context, not `/private/` in the path.
  - Stream response via `readable.pipeTo(writable)` instead of buffering entire file in memory.
  - Still enforce auth guard + per-role access checks.
  - **Size check: skip for cloud fetches** — Vercel Blob enforces its own size limits. The current 10 MB check is for local filesystem protection. For cloud URLs, omit the size check to avoid a costly HEAD request before every GET.
- If `rawPath` starts with `/uploads/`: existing local-fs path with size check (unchanged).

### 5. `app/api/user/resumes/[id]/ai-enhance/route.ts` — CREATE

Does not exist. Model after `route.perf.test.ts` expectations and existing AI client in `lib/ai-client.ts`:

- Accept POST
- Check rate limit (5/day via `ResumeEnhancementLog`)
- Call the AI client from `@/lib/ai-client`
- Log enhancement in DB via `prisma.resumeEnhancementLog.create`
- **This route is separate from the storage provider work**. If implementing everything at once, read `lib/ai-client.ts` for the AI invocation pattern. If splitting into phases, defer this to a follow-up task.

### 6. `components/chat/use-thread-view.ts` — apiClient

- Replace `fetch("/api/upload", { method: "POST", body: fd })` with `apiClient`

### 7. `app/features/recruiter/components/company-form.tsx` — DELETE call

- `deletePreviousFile`: send `{ url }` instead of `{ filename }`
- Remove `extractFilename` helper

### 8. `next.config.ts` — remotePatterns

- Add `{ protocol: "https", hostname: NEXT_PUBLIC_BLOB_CDN_HOST }`
- Keep existing patterns

### 9. `package.json`

- `npm install @vercel/blob@latest`

---

## Deployment ordering

Changes must be deployed in this order to avoid breaking callers:

1. **Upload route** (`app/api/upload/route.ts`) — accept both `{ url }` and `{ filename }` on DELETE. Deploy first so the transitional contract is live.
2. **`company-form.tsx`** — switch to sending `{ url }`. Safe to deploy after the route is live.
3. **All other files** — lib/upload.ts, download route, next.config, etc. can deploy together in any order.
4. **`@vercel/blob` install** — must happen before `UPLOAD_PROVIDER=vercel-blob` is set.

---

## Edge cases — storage swap analysis

### Scenario: swap from local → blob mid-deployment

| Concern                       | Works? | Detail                                                                                         |
| ----------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| Old `/uploads/xxx` URLs in DB | ✓      | `deleteUpload` matches `/uploads/` prefix → `localProvider.del`. Download proxy reads from fs. |
| New blob URLs in DB           | ✓      | `deleteUpload` matches blob hostname → `blobProvider.del`. Download proxy fetches via HTTP.    |
| Both URL types coexist in DB  | ✓      | Registry dispatches each URL to its owning provider.                                           |
| Download proxy for blob URLs  | ⚠️     | Private blobs need auth header. Plan section 4 addresses this.                                 |

### Scenario: swap from blob → local

| Concern                          | Works? | Detail                                                                                                                                                                                                                                                                                                                                       |
| -------------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Old blob URLs orphaned           | ⚠️     | `deleteUpload` still matches blob hostname → `blobProvider.del` works. But if `BLOB_READ_WRITE_TOKEN` is no longer set, `blobProvider` can't authenticate the delete. The provider should store the token at init time, not read it on demand. **Fix**: `blobProvider` reads and caches `BLOB_READ_WRITE_TOKEN` in a closure at module load. |
| Download proxy for old blob URLs | ⚠️     | Same auth problem: download proxy needs token to fetch private blobs. **Fix**: download proxy stores token at request time via env, not at module level.                                                                                                                                                                                     |

### Scenario: custom Vercel Blob CDN domain (Enterprise)

- `canHandle` must check the configured `NEXT_PUBLIC_BLOB_CDN_HOST`, not a hardcoded string
- `next.config.ts` remotePatterns must use the same configurable host

### Scenario: S3 added later

- Register a new `s3Provider` with `canHandle: (url) => url.includes("s3.amazonaws.com")` or `url.includes(env.NEXT_PUBLIC_S3_HOST ?? "")`
- No changes to `saveUpload`, `deleteUpload`, or the download proxy

### Scenario: `BLOB_READ_WRITE_TOKEN` missing when provider = vercel-blob

- `saveUpload` throws eagerly with a clear message
- Prevents confusing `@vercel/blob` auth errors at upload time

---

## Critical constraints

1. **`deleteUpload` return consistency** — Both providers return `boolean`. `blobProvider.del` catches `@vercel/blob` errors and returns `false` instead of throwing.
2. **Download proxy for private blobs** — Must include `Authorization: Bearer <token>` when fetching from a private blob URL. Token read from `env.BLOB_READ_WRITE_TOKEN` at request time.
3. **`upsert-company.ts`** already calls `deleteUpload(previousLogoUrl)` with whatever URL was stored — works with both providers since dispatch is URL-based. No changes needed.
4. **`@vercel/blob` is lazy-imported** — never loaded if `UPLOAD_PROVIDER !== "vercel-blob"`. Zero cost for local dev.

---

## Tests

### New: `lib/test/unit/upload-provider.test.ts`

Full suite for the provider abstraction in `lib/upload.ts`:

| Test                                                                                                            | Aspect                       |
| --------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| `saveUpload` selects local provider when `UPLOAD_PROVIDER=local`                                                | Provider dispatch by env var |
| `saveUpload` selects blob provider when `UPLOAD_PROVIDER=vercel-blob`                                           | Provider dispatch by env var |
| `saveUpload` throws when `UPLOAD_PROVIDER=vercel-blob` and `BLOB_READ_WRITE_TOKEN` is missing                   | Eager validation             |
| `saveUpload` throws with unknown provider value                                                                 | Fallthrough guard            |
| `saveUpload` re-reads env on each call (not cached at module load)                                              | Runtime env freshness        |
| `deleteUpload(/uploads/xxx)` → `localProvider.del`                                                              | URL dispatch — local         |
| `deleteUpload(https://xxx.blob.vercel-storage.com/yyy)` → `blobProvider.del`                                    | URL dispatch — blob          |
| `deleteUpload(https://custom-cdn.com/xxx)` → `blobProvider.del` when `NEXT_PUBLIC_BLOB_CDN_HOST=custom-cdn.com` | Custom CDN routing           |
| `deleteUpload(https://s3.amazonaws.com/bucket/key)` returns `false`                                             | Unknown URL → no-op          |
| `deleteUpload("")` / `deleteUpload(null)` returns `false`                                                       | Edge case resilience         |
| `blobProvider.del` catches `@vercel/blob` errors, returns `false`                                               | Error isolation              |
| `access: "public"` forwarded to blob `put()`                                                                    | Access propagation           |
| `access: "private"` forwarded to blob `put()`                                                                   | Access propagation           |
| `access` ignored by local provider (all to `/uploads/`)                                                         | Local access is no-op        |
| `@vercel/blob` never imported when `UPLOAD_PROVIDER=local`                                                      | Lazy import isolation        |

### New tests added to existing `lib/test/integration/upload.test.ts`

Add a separate `describe("Vercel Blob storage")` block that does **not** mock `@/lib/upload`:

| Test                                                                       | What it covers          |
| -------------------------------------------------------------------------- | ----------------------- |
| DELETE without session returns 401                                         | Auth guard unchanged    |
| DELETE with session and `{ url: "/uploads/test.pdf" }` returns 200         | New DELETE contract     |
| DELETE with session and `{ filename: "test.pdf" }` still returns 200       | Backward compat         |
| DELETE with neither `url` nor `filename` returns 400                       | Validation              |
| DELETE with url pointing to non-existent file returns `{ deleted: false }` | Graceful no-op          |
| POST with file returns 201 and response body has a `data.url`              | Real dispatch, not mock |

### New tests added to existing `lib/test/integration/files/download.test.ts`

| Test                                                                  | What it covers                           |
| --------------------------------------------------------------------- | ---------------------------------------- |
| Cloud URL (public) returns 200 with streamed body                     | Dual-mode cloud path                     |
| Cloud URL response has no `content-length` header                     | Streamed, not buffered                   |
| Cloud URL for private blob includes `Authorization` in upstream fetch | Private blob auth header                 |
| Cloud URL without session returns 401                                 | Auth guard on cloud path                 |
| Cloud URL for another user's resume returns 403                       | Per-role access on cloud path            |
| Cloud URL with `..` in path returns 403                               | Traversal blocked on cloud path          |
| `/uploads/` local path still works unchanged                          | Backward compat verified alongside cloud |

### Modified: `lib/test/unit/upload-security.test.ts`

| Change                                                                           | Reason                            |
| -------------------------------------------------------------------------------- | --------------------------------- |
| Add `beforeAll`: `vi.stubEnv("UPLOAD_PROVIDER", "local")`                        | Force local provider during tests |
| Add `afterAll`: `vi.unstubEnv("UPLOAD_PROVIDER")`                                | Cleanup after tests               |
| These tests call `saveUpload(file)` directly — would break against real blob API | Isolation from cloud              |

### Modified: `lib/test/integration/upload.test.ts`

| Change                                                                               | Reason                |
| ------------------------------------------------------------------------------------ | --------------------- |
| Existing `vi.mock("@/lib/upload")` block stays — existing 4 tests unchanged          | Backward compat       |
| Add second `describe("Vercel Blob storage")` block that does NOT mock `@/lib/upload` | Real dispatch testing |

### `.env.test` change

| Var               | Value   |
| ----------------- | ------- |
| `UPLOAD_PROVIDER` | `local` |

Keeps all existing tests on local filesystem, isolated from cloud API calls.

---

## Migration — existing local files

Before switching `UPLOAD_PROVIDER` to `"vercel-blob"`:

1. Verify all `/uploads/xxx` URLs in the DB are still accessible from the local filesystem
2. Run a migration script that:
   a. Queries all DB tables with `fileUrl` / `logoUrl` fields for values starting with `/uploads/`
   b. Uploads each local file to Vercel Blob with `access: "public"` (logos) or `access: "private"` (resumes)
   c. Updates each DB record with the new blob URL
3. Deploy the provider-switch code
4. Set `UPLOAD_PROVIDER=vercel-blob`
5. Verify uploads + downloads + deletes work end-to-end

---

## Backward compatibility

- `UPLOAD_PROVIDER` defaults to `"local"` — zero behavior change
- `deleteUpload("/uploads/xxx")` → `localProvider.del` — unchanged
- `deleteUpload("https://blob...")` → `blobProvider.del` — new
- Upload route DELETE accepts both `{ url }` and `{ filename }` for transition
- `upsert-company.ts` calls `deleteUpload(url)` — unchanged, already passes whatever URL is stored
- All existing unit/integration tests pass without env changes
- **E2E tests are out of scope** — existing e2e tests that upload files assume local provider. If `UPLOAD_PROVIDER=vercel-blob` is set in the test environment, they'll need Vercel Blob credentials. Document this as a follow-up task, not part of this plan.

---

## Validation

```bash
npx vitest run lib/test/unit/upload-provider.test.ts
npx vitest run lib/test/unit/upload-security.test.ts
npx vitest run lib/test/integration/upload.test.ts
npx vitest run lib/test/integration/files/download.test.ts
npm test
npx tsc --noEmit
npm run lint
```
