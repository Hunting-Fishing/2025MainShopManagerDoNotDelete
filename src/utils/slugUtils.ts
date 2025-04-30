
/**
 * Converts a string to a URL-friendly slug
 * @param text The text to convert to a slug
 * @returns The slug
 */
export const slugify = (text: string): string => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/&/g, '-and-')         // Replace & with 'and'
    .replace(/[^\w\-]+/g, '')       // Remove all non-word characters
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
};

/**
 * Normalizes a slug to ensure consistent comparison
 * @param slug The slug to normalize
 * @returns The normalized slug
 */
export const normalizeSlug = (slug: string): string => {
  if (!slug) return '';
  
  // Remove any trailing slashes
  let normalizedSlug = slug.replace(/\/+$/, '');
  
  // Ensure consistent hyphenation
  normalizedSlug = normalizedSlug
    .replace(/\s+/g, '-')
    .replace(/\-\-+/g, '-')
    .toLowerCase();
  
  return normalizedSlug;
};
