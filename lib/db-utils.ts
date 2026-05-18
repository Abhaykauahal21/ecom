/**
 * Professional database and string utilities for Kavya Boss Nutrition.
 */

/**
 * Generates a URL-safe slug from a string.
 */
export function generateSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w-]+/g, '')  // Remove all non-word chars
    .replace(/--+/g, '-')     // Replace multiple - with single -
    .replace(/^-+/, '')       // Trim - from start
    .replace(/-+$/, '');      // Trim - from end
}

/**
 * Normalizes a category name for database operations.
 */
export function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ');
}
