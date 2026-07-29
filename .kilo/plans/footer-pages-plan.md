# Plan: Footer Pages, Social Links & For Employers Fix

## Bug Fix — For Employers Link

**Root cause**: Middleware (`proxy.ts:20`) redirects signed-in users from `/` to their role dashboard. Hash `#for-employers` is lost because `NextURL` doesn't expose URL fragments.

**Fix**: Create a dedicated `/employers` route; update the footer link.

### Files

| Action | File                                           | Detail                                                                                                                   |
| ------ | ---------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| Create | `app/(public)/employers/page.tsx`              | Static server component. Copy employer-focused CTA content from landing section. `max-w-3xl` centered, `py-16 sm:py-20`. |
| Update | `app/features/landing/components/footer.tsx:9` | Change `href: "/#for-employers"` → `href: "/employers"`                                                                  |

---

## New Static Pages (5)

All follow `privacy/page.tsx` pattern: server component, `metadata` export, `max-w-3xl mx-auto px-4 md:px-6 lg:px-8 py-16 sm:py-20`, placeholder content sections.

| Route      | File                            | Title   |
| ---------- | ------------------------------- | ------- |
| `/pricing` | `app/(public)/pricing/page.tsx` | Pricing |
| `/about`   | `app/(public)/about/page.tsx`   | About   |
| `/careers` | `app/(public)/careers/page.tsx` | Careers |
| `/contact` | `app/(public)/contact/page.tsx` | Contact |
| `/press`   | `app/(public)/press/page.tsx`   | Press   |

Each: heading, subtitle, 3–5 placeholder sections, footer disclaimer.

---

## Env Vars — Social Links & Contact Email

Add these to `utils/env.ts` schema (all `z.string().optional()`):

| Var                         | Purpose                                                      |
| --------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_LINKEDIN_URL`  | LinkedIn profile URL                                         |
| `NEXT_PUBLIC_TWITTER_URL`   | Twitter/X profile URL                                        |
| `NEXT_PUBLIC_GITHUB_URL`    | GitHub profile URL                                           |
| `NEXT_PUBLIC_CONTACT_EMAIL` | Fallback contact for mailto links when a social URL is unset |

Update `.env.example` with all 4 vars as commented-out placeholders.

---

## Footer Changes — Social Icons

In `app/features/landing/components/footer.tsx`:

1. Import `env` from `@/utils/env`.
2. Replace hardcoded `href: "#"` socials with conditional logic:

```ts
const linkedinUrl = env.data?.NEXT_PUBLIC_LINKEDIN_URL;
const contactEmail = env.data?.NEXT_PUBLIC_CONTACT_EMAIL;

const socials = [
  {
    icon: GlobeIcon,
    label: "LinkedIn",
    href: linkedinUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: MessageCircleIcon,
    label: "Twitter",
    href: twitterUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
  {
    icon: TerminalIcon,
    label: "GitHub",
    href: githubUrl || (contactEmail ? `mailto:${contactEmail}` : null),
  },
];
```

3. If `href` is `null`, skip rendering that icon entirely (no dead `<a>` tags).

---

## Route Config

| File               | Change                                                                                                         |
| ------------------ | -------------------------------------------------------------------------------------------------------------- |
| `lib/routes.ts:11` | Add `"/employers"`, `"/pricing"`, `"/about"`, `"/careers"`, `"/contact"`, `"/press"` to `PUBLIC_CONTENT_PATHS` |

This ensures public navbar shows and middleware passes through on these routes.

---

## Tests

| File                           | Change                                                                                                                           |
| ------------------------------ | -------------------------------------------------------------------------------------------------------------------------------- |
| `lib/test/unit/routes.test.ts` | Add `expect(isHiddenRoute("/employers")).toBe(false)` and assertions for each new route in the "shows public content paths" test |

---

## Execution Order

1. Create `/employers` page → update footer link
2. Create 5 static pages (pricing, about, careers, contact, press)
3. Add env vars to `env.ts` + `.env.example`
4. Update footer social icons with env var lookup + mailto fallback
5. Update `routes.ts` — `PUBLIC_CONTENT_PATHS`
6. Update `routes.test.ts`

## Validation

```bash
npx vitest run lib/test/unit/routes.test.ts    # all pass
npx tsc --noEmit                                # no new type errors
npx next lint                                    # no lint errors
```

## Constraints

- All new pages follow the `privacy/page.tsx` server-component pattern.
- Social + contact env vars are all optional; footer handles missing gracefully (hides icon).
- `lib/routes.ts` is the single source of truth — route test mirrors it.
- No new CSS files, no new npm packages.
