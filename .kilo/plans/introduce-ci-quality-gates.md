# CI Quality Gates

**Scope:** Modify `.github/workflows/test.yml` and supporting config files to enforce a comprehensive quality gate before merge.

## Current Gaps

| Gate                                        | Status                     | Action                                                     |
| ------------------------------------------- | -------------------------- | ---------------------------------------------------------- |
| Lint (ESLint)                               | ✅ Run on every PR         | Keep                                                       |
| Unit + Integration tests                    | ✅ Run on every PR, mixed  | Keep                                                       |
| Coverage thresholds                         | ✅ Vitest (22/22/54/67 %)  | Keep; document ratchet policy                              |
| E2E (Playwright)                            | ✅ Run on every PR         | Keep                                                       |
| Performance (PF1–PF5)                       | ✅ Run on master push only | **Enhance** with baseline-comparison regression check      |
| **Type-check (`tsc --noEmit`)**             | ❌                         | **Add** to every PR (fastest gate, runs first)             |
| **Formatting (Prettier)**                   | ❌                         | **Add** to every PR alongside lint                         |
| **Repository contract tests**               | ❌                         | **Add** new vitest `contract` project, run on every PR     |
| **Benchmark regression (baseline compare)** | ❌                         | **Add** baseline JSON + comparison step to performance job |
| **Mutation testing (Stryker)**              | ❌                         | **Add** on master push only (expensive: 5–30× test time)   |

---

## Proposed CI Pipeline

```
PR opened
  │
  ├─ (parallel) ─────────────────────────────────────────────
  │  Gate 1a: Type-check (tsc --noEmit)       ← NEW
  │  Gate 1b: Lint (ESLint)                   ← existing
  │  Gate 1c: Format check (prettier --check)  ← NEW
  │
  ├─ Gate 2: Unit + Integration + Contract + Coverage  ← enhanced
  │   vitest run --project default --project dom --project contract --coverage
  │
  ├─ Gate 3: E2E (Playwright)                  ← existing (needs: gate 2)
  │
  └─ (optional — only if reviewer requests):
      └─ Performance (workflow_dispatch on PR branch)

Merge to master
  │
  ├─ Performance + Benchmark regression         ← enhanced (baseline comparison)
  └─ Mutation testing (Stryker)                 ← NEW (fire-and-forget, no block)
```

---

## Step 1: Install New Dependencies

```bash
npm install --save-dev prettier @stryker-mutator/core @stryker-mutator/vitest-runner
```

`@stryker-mutator/core` + `@stryker-mutator/vitest-runner` — mutation tooling. Prettier — formatter.

---

## Step 2: Prettier — Configure + One-Time Migration

**Create `.prettierrc`:**

```json
{
  "semi": true,
  "singleQuote": false,
  "trailingComma": "all",
  "printWidth": 100,
  "tabWidth": 2
}
```

**Create `.prettierignore`:** Excludes generated output and CI artifacts:

```
.next/
out/
build/
coverage/
node_modules/
app/generated/
reports/
playwright-report/
benchmark/results/
```

**Add to `package.json` scripts:**

```json
"format:check": "prettier --check .",
"format:fix": "prettier --write ."
```

**ONE-TIME MIGRATION (run before CI is enabled):**

```bash
npm run format:fix
git add -A
git commit -m "chore: apply Prettier formatting"
```

Without this, `prettier --check .` will fail on every existing file. Run this as a standalone PR before the CI change.

---

## Step 3: Type-Check Script

**Add to `package.json` scripts:**

```json
"typecheck": "tsc --noEmit"
```

This runs TypeScript's strict type checker without emitting output files. Catches type errors that ESLint doesn't.

---

## Step 4: Vitest `contract` Project

**Add to `vitest.config.ts` within `test.projects`:**

```ts
{
  plugins: sharedPlugins,
  resolve: sharedResolve,
  test: {
    name: "contract",
    environment: "node",
    setupFiles: ["./lib/test/vitest.setup.ts"],
    include: ["**/*.contract.test.ts"],
    exclude: ["**/node_modules/**"],
  },
},
```

**Convention:** A `*.contract.test.ts` file verifies that a concrete repository implementation satisfies its interface contract against a real DB. Example structure:

```ts
// lib/rate-limiting/__contract__/prisma-rate-limit-repository.contract.test.ts
import { describe, it, expect } from "vitest";
import { PrismaRateLimitRepository } from "../repository";
import { resetDb } from "@/lib/test";

export function runRepositoryContractTests(label: string, factory: () => RateLimitRepository) {
  describe(`${label} — contract`, () => {
    it("increment creates a new row and returns count 1", async () => {
      /* ... */
    });
    it("increment increments existing key", async () => {
      /* ... */
    });
    it("increment resets count when window expired", async () => {
      /* ... */
    });
    it("deleteById removes only the specified key", async () => {
      /* ... */
    });
    it("deleteAllAppKeys removes app: rows but preserves others", async () => {
      /* ... */
    });
  });
}

runRepositoryContractTests("PrismaRateLimitRepository", () => new PrismaRateLimitRepository());
```

This pattern ensures any future implementation (Redis, Memory) passes the same contract.

---

## Step 5: Stryker — Mutation Testing

**Create `stryker.config.json`:**

```json
{
  "$schema": "./node_modules/@stryker-mutator/core/schema/stryker-schema.json",
  "packageManager": "npm",
  "testRunner": "vitest",
  "coverageAnalysis": "perTest",
  "mutate": [
    "lib/rate-limiting/**/*.ts",
    "!lib/rate-limiting/**/*.test.ts",
    "!lib/rate-limiting/**/*.contract.test.ts",
    "!lib/rate-limiting/types.ts",
    "!lib/rate-limiting/config.ts",
    "!lib/rate-limiting/metrics.ts"
  ],
  "vitest": {
    "configFile": "vitest.config.ts",
    "args": ["--project", "default", "--project", "contract"]
  },
  "thresholds": {
    "high": 80,
    "low": 60,
    "break": null
  },
  "timeoutMS": 60000,
  "reporters": ["progress", "html"],
  "htmlReporter": {
    "baseDir": "reports/mutation"
  }
}
```

**Key config details:**

- `vitest.args: ["--project", "default", "--project", "contract"]` — limits Stryker to only these vitest projects. DOM tests (jsdom) and perf tests (expensive) are excluded. This cuts mutation time significantly.
- `mutate` array — only mutates `lib/rate-limiting/` source files (not types/config/metrics, not tests). Expand to other directories as confidence grows.
- `thresholds.break: null` — informational only, does not block the build. HTML report is uploaded as an artifact for manual review.
- Design intent: mutation score is a **trending metric**, not a hard gate. Track it over time.

**Add to `package.json` scripts:**

```json
"mutation": "stryker run"
```

**CI safety check:** The CI job wraps the command in a directory-existence guard (step 7) so it skips if `lib/rate-limiting/` doesn't exist yet.

---

## Step 6: Benchmark Baseline — Regression Check

**Create `benchmark/baseline.json`:** Stores the expected mean latency for each performance suite. New suites start with `meanMs: null` (no baseline yet — runs pass, only record).

```json
{
  "updatedAt": "2026-07-29T00:00:00.000Z",
  "suites": {
    "PF1-analytics-50k": { "meanMs": null, "budgetMs": 5000 },
    "PF2-applicant-list-10k": { "meanMs": null, "budgetMs": 1000 },
    "PF3-csv-export-50k": { "meanMs": null, "budgetMs": 30000 },
    "PF4-fulltext-search-100k": { "meanMs": null, "budgetMs": 30000 },
    "PF5-ai-enhance-concurrent": { "meanMs": null, "budgetMs": 5000 }
  }
}
```

**Extend `lib/test/perf.ts` helpers:** Add a publish mechanism so each perf test file records its result.

```ts
export interface BenchmarkResult {
  suite: string;
  meanMs: number;
  p50Ms: number;
  p95Ms: number;
  sampleCount: number;
}

const publishedResults: BenchmarkResult[] = [];

export function publishBenchmark(result: BenchmarkResult): void {
  publishedResults.push(result);
}

/** Called after all tests in a file — writes results to a SHA-keyed JSON file. */
export async function writeBenchmarkResults(sha: string): Promise<void> {
  // writes to benchmark/results/${sha}.json
}
```

**Update all 5 existing perf test files** to call `publishBenchmark()` after their measurement:

| File                                                              | Suite name                  | Current threshold            |
| ----------------------------------------------------------------- | --------------------------- | ---------------------------- |
| `app/features/recruiter/queries/analytics-queries.perf.test.ts`   | `PF1-analytics-50k`         | `5000ms`                     |
| `app/features/recruiter/queries/application-queries.perf.test.ts` | `PF2-applicant-list-10k`    | `1000ms`                     |
| `app/features/recruiter/queries/export-queries.perf.test.ts`      | `PF3-csv-export-50k`        | `30000ms`                    |
| `app/features/jobs/queries/public-job-queries.perf.test.ts`       | `PF4-fulltext-search-100k`  | `30000ms`                    |
| `app/api/user/resumes/[id]/ai-enhance/route.perf.test.ts`         | `PF5-ai-enhance-concurrent` | N/A (concurrent correctness) |

Each test adds after its `expect` assertions:

```ts
publishBenchmark({
  suite: "PF1-analytics-50k",
  meanMs: ms,
  p50Ms: ms,
  p95Ms: ms,
  sampleCount: 1,
});
```

**CI comparison logic (in performance job):**

1. After running perf suite, `npx tsx scripts/compare-benchmark.ts` reads `benchmark/results/<sha>.json` + `benchmark/baseline.json`
2. For each suite:
   - `meanMs > baseline.budgetMs` → **fail** (hard limit — code got catastrophically slower)
   - `baseline.meanMs !== null && meanMs > baseline.meanMs * 1.2` → **fail** (>20% regression from baseline)
   - Otherwise → pass
3. If all suites pass and branch is `master`, `npx tsx scripts/update-baseline.ts` writes new `meanMs` values into `benchmark/baseline.json`

**Race condition handling:** When multiple master pushes complete near-simultaneously, the second `git push` could conflict. The CI step handles this gracefully:

```yaml
- name: Update baseline (master only)
  if: github.ref == 'refs/heads/master'
  run: |
    npx tsx scripts/update-baseline.ts
    git config user.name "CI Bot"
    git config user.email "ci@hire-flow.ai"
    git add benchmark/baseline.json
    git commit -m "chore: update benchmark baseline [skip ci]" || exit 0
    git pull --rebase || true
    git push || echo "Baseline update skipped (conflict)" && exit 0
```

If the push fails (merge conflict), the next master push will retry. The baseline is eventually consistent.

---

## Step 7: Update CI Workflow

**Replace `.github/workflows/test.yml` with the new pipeline.** The full file is attached but only changed job definitions are annotated below.

### Workflow-level changes

- Add `permissions:` block at the top — needed for the baseline auto-commit on master.
- Add existing `concurrency:` group (keeps cancel-in-progress behavior).
- Replace `on.pull_request` / `on.push` triggers — keeps current behavior.
- Keep existing `env:` block — all DB/auth env vars unchanged.

```yaml
name: Test
on: [pull_request, workflow_dispatch]
# push: master (kept in specific jobs below)

permissions:
  contents: write # needed by performance job for baseline auto-commit
  pull-requests: read
  checks: write

concurrency:
  group: test-${{ github.ref }}
  cancel-in-progress: true
```

### Job 1: `gate-typecheck` (NEW — fastest, runs first)

```yaml
typecheck:
  name: Type-check (tsc --noEmit)
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx prisma generate
    - run: npx tsc --noEmit
```

`prisma generate` is required because the generated client types are referenced throughout the codebase. Without it, `tsc` fails.

### Job 2: `gate-lint` (NEW — parallel to typecheck)

Adds `--cache` to ESLint (speeds re-runs) and adds `prettier --check`.

```yaml
lint:
  name: Lint + Format
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx eslint app lib components features --ignore-pattern "lib/test" --cache --quiet
    - run: npx prettier --check .
```

### Job 3: `unit-integration-contract` (modified — adds contract project)

Adds `--project contract` to the vitest run. Renamed from `unit-integration` to reflect new scope.

```yaml
unit-integration-contract:
  name: Unit + Integration + Contract + Coverage
  runs-on: ubuntu-latest
  if: github.event_name == 'pull_request'
  needs: [typecheck, lint]
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: hireflow_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 5s
        --health-timeout 5s
        --health-retries 10
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx prisma migrate deploy
    - run: npx vitest run --project default --project dom --project contract --coverage
    - name: Upload coverage report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: coverage
        path: coverage/
        retention-days: 7
```

### Job 4: `e2e` (keeps current)

Same as existing `e2e` job. Only change: `needs: unit-integration` → `needs: unit-integration-contract`.

### Job 5: `performance` (enhanced — adds baseline comparison + auto-update)

Adds baseline comparison step and auto-commit on master with race-condition handling.

```yaml
performance:
  name: Performance + Benchmark Regression
  runs-on: ubuntu-latest
  if: github.event_name == 'workflow_dispatch' || (github.event_name == 'push' && github.ref == 'refs/heads/master')
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: hireflow_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 5s
        --health-timeout 5s
        --health-retries 10
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx prisma migrate deploy
    - run: npx vitest run --project perf
    - name: Compare against baseline
      run: npx tsx scripts/compare-benchmark.ts
    - name: Update baseline (master only)
      if: github.ref == 'refs/heads/master'
      run: |
        node scripts/update-baseline.js
        git config user.name "CI Bot"
        git config user.email "ci@hire-flow.ai"
        git add benchmark/baseline.json
        git commit -m "chore: update benchmark baseline [skip ci]" || exit 0
        git pull --rebase || true
        git push || echo "Baseline update skipped (conflict)" && exit 0
```

### Job 6: `mutation` (NEW — master push only, informational, fire-and-forget)

Includes guard that skips if the mutate-target directory doesn't exist yet.

```yaml
mutation:
  name: Mutation testing (Stryker)
  runs-on: ubuntu-latest
  if: github.event_name == 'push' && github.ref == 'refs/heads/master'
  needs: [performance] # mutation is the most expensive; run last
  services:
    postgres:
      image: postgres:16
      env:
        POSTGRES_USER: postgres
        POSTGRES_PASSWORD: postgres
        POSTGRES_DB: hireflow_test
      ports:
        - 5432:5432
      options: >-
        --health-cmd pg_isready
        --health-interval 5s
        --health-timeout 5s
        --health-retries 10
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 20
        cache: npm
    - run: npm ci
    - run: npx prisma migrate deploy
    - name: Run mutation testing
      run: |
        if [ -d lib/rate-limiting ]; then
          npx stryker run
        else
          echo "lib/rate-limiting/ not found — skipping mutation testing"
        fi
    - name: Upload mutation report
      if: always()
      uses: actions/upload-artifact@v4
      with:
        name: mutation-report
        path: reports/mutation/
        retention-days: 30
```

---

## Step 8: Helper Scripts (TypeScript — use tsx)

The project uses `tsx` for TypeScript scripts. Create both scripts as `.ts` files. They share a `readBaseline()` / `readResults()` utility that can be extracted to `lib/benchmark.ts` if needed later.

### `scripts/compare-benchmark.ts`

Reads `benchmark/results/<sha>.json` (determined by `process.env.GITHUB_SHA`) + `benchmark/baseline.json`. For each suite:

- `meanMs > baseline.budgetMs` → error (hard limit — code became catastrophically slower)
- `baseline.meanMs !== null && meanMs > baseline.meanMs * 1.2` → error (>20% regression)
- Logs pass/fail for each suite
- Exit code 1 on any failure; exit 0 otherwise

### `scripts/update-baseline.ts`

Reads `benchmark/results/<sha>.json`, updates `benchmark/baseline.json`'s `suites[key].meanMs` with the new `meanMs` value, updates `updatedAt`, writes back. Called only on successful master runs.

### `scripts/update-baseline.ts` — race-condition awareness

If the write fails (file changed between read and write), exit 0 with a warning. The next master push retries.

**CI invokes these with `tsx`:**

```yaml
- run: npx tsx scripts/compare-benchmark.ts
- run: npx tsx scripts/update-baseline.ts
```

---

## Step 9: Update ESLint Ignores

`app/generated/` contains auto-generated Prisma client code that should not be linted. `benchmark/results/` contains generated JSON files. Add both to the existing `ignores` array in `eslint.config.mjs`:

```js
ignores: [
  ".next/**",
  "out/**",
  "build/**",
  "next-env.d.ts",
  "app/generated/**",
  "benchmark/results/**",
],
```

## Step 10: Document Coverage Ratchet Policy

**Add a comment above the coverage thresholds in `vitest.config.ts`:**

```ts
// RATCHET POLICY (do not violate):
//   Coverage thresholds can ONLY be raised, never lowered or removed.
//   When coverage measurably increases, update the floor to match.
//   Measured 2026-07-29: lines ~24.5%, functions ~56.8%, branches ~70%.
```

This prevents silent coverage erosion.

---

## Step 11: Update Package.json

```json
{
  "scripts": {
    // existing scripts unchanged...
    "typecheck": "tsc --noEmit",
    "format:check": "prettier --check .",
    "format:fix": "prettier --write .",
    "mutation": "stryker run"
  }
}
```

---

## Files Touched

| File                              | Action                                                                                                                                                                                   |
| --------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `.github/workflows/test.yml`      | **Rewrite** — 6 jobs. Add `permissions: contents: write`. Add typecheck + lint jobs. Enhance test job → add `contract` project. Add mutation job. Enhance performance job with baseline. |
| `vitest.config.ts`                | Add `contract` project under `test.projects`; add ratchet comment                                                                                                                        |
| `package.json`                    | Add `typecheck`, `format:check`, `format:fix`, `mutation` scripts                                                                                                                        |
| `eslint.config.mjs`               | Add `app/generated/**`, `benchmark/results/**` to `ignores`                                                                                                                              |
| `.prettierrc`                     | Create                                                                                                                                                                                   |
| `.prettierignore`                 | Create (exclude `.next/`, `out/`, `build/`, `coverage/`, `node_modules/`, `app/generated/`, `reports/`, `playwright-report/`, `benchmark/results/`)                                      |
| `stryker.config.json`             | Create (scope: `lib/rate-limiting/`, projects: `default`+`contract`, HTML output: `reports/mutation/`)                                                                                   |
| `benchmark/baseline.json`         | Create (5 suites, `meanMs: null` initially)                                                                                                                                              |
| `scripts/compare-benchmark.ts`    | Create (baseline comparison: hard limit + regression %)                                                                                                                                  |
| `scripts/update-baseline.ts`      | Create (baseline auto-update on master, race-safe)                                                                                                                                       |
| `lib/test/perf.ts`                | Add `publishBenchmark()`, `BenchmarkResult`, `writeBenchmarkResults()`                                                                                                                   |
| 5 existing `*.perf.test.ts` files | Each adds `publishBenchmark({ suite: "...", ... })` call                                                                                                                                 |
| Future `*.contract.test.ts` files | Convention: run repository contract tests against real DB                                                                                                                                |

---

## Validation

| Check                                    | Command                                                                        | Expected                                                    |
| ---------------------------------------- | ------------------------------------------------------------------------------ | ----------------------------------------------------------- |
| Formatting                               | `npm run format:check`                                                         | Zero violations (run `format:fix` once first)               |
| Type errors                              | `npm run typecheck`                                                            | Zero strict errors                                          |
| Lint                                     | `npm run lint`                                                                 | Zero errors (generated code excluded)                       |
| Unit + integration + contract + coverage | `npx vitest run --project default --project dom --project contract --coverage` | All pass, thresholds met                                    |
| Mutation score                           | `npx stryker run`                                                              | Report generated (informational, no break threshold)        |
| Performance + baseline                   | `npx vitest run --project perf`                                                | All suites pass, `benchmark/results/` written               |
| Baseline comparison                      | `npx tsx scripts/compare-benchmark.ts`                                         | No hard-limit or regression failures                        |
| Manual — PR CI                           | Create a PR                                                                    | Typecheck + lint run in parallel → tests → E2E              |
| Manual — master CI                       | Push to master                                                                 | Perf + baseline → mutation (if `lib/rate-limiting/` exists) |
