/**
 * Generate a URL-safe slug from a job title + optional company name.
 *
 * Rules:
 * - Lowercase, strip non-alphanumeric chars (except hyphens)
 * - Replace whitespace/underscores with hyphens
 * - Collapse repeated hyphens
 * - Trim leading/trailing hyphens
 * - Truncate to maxLen chars (no mid-word break)
 */
export function slugify(text: string, maxLen = 80): string {
  const slug = text
    .toLowerCase()
    .replace(/[^\w\s-]+/g, "") // remove non-word chars except spaces/hyphens
    .replace(/[\s_]+/g, "-") // spaces/underscores → hyphens
    .replace(/-+/g, "-") // collapse multiples
    .replace(/^-+|-+$/g, ""); // trim edges

  if (slug.length <= maxLen) return slug;

  // Truncate at the last hyphen before maxLen to avoid mid-word cut
  const truncated = slug.slice(0, maxLen);
  const lastHyphen = truncated.lastIndexOf("-");
  return lastHyphen > 0 ? truncated.slice(0, lastHyphen) : truncated;
}

/**
 * Ensure a slug is unique across jobs. Appends `-1`, `-2`, etc. if needed.
 *
 * @param baseSlug      - The desired slug (e.g. "senior-engineer-acme")
 * @param existsCheck   - Async function that returns true if the slug is taken
 * @param currentJobId  - Optional job ID to exclude from check (for updates)
 */
export async function ensureUniqueSlug(
  baseSlug: string,
  existsCheck: (slug: string) => Promise<boolean>,
  currentJobId?: string,
): Promise<string> {
  if (!(await existsCheck(baseSlug))) {
    return baseSlug;
  }

  let counter = 1;
  let slug: string;
  do {
    slug = `${baseSlug}-${counter}`;
    counter++;
  } while (await existsCheck(slug));

  return slug;
}
