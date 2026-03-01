/**
 * Generates a URL-friendly slug from a string.
 */
export function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "") // Remove non-word chars
    .replace(/[\s_-]+/g, "-") // Replace spaces/underscores with single dash
    .replace(/^-+|-+$/g, ""); // Remove dashes from start/end
}
