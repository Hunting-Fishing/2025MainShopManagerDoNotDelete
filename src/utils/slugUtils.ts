
/**
 * Converts a string to a URL-friendly slug
 */
export function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')        // Replace spaces with -
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Normalizes a slug for consistent matching
 * Handles common variations like spaces, dashes, and underscores
 */
export function normalizeSlug(slug: string): string {
  if (!slug) return '';
  
  // Remove any special characters and standardize separators
  return slug
    .toLowerCase()
    .replace(/_/g, '-')          // Convert underscores to dashes
    .replace(/\s+/g, '-')        // Convert spaces to dashes
    .replace(/[^\w\-]+/g, '')    // Remove all non-word chars
    .replace(/\-\-+/g, '-')      // Replace multiple - with single -
    .replace(/^-+/, '')          // Trim - from start of text
    .replace(/-+$/, '');         // Trim - from end of text
}

/**
 * Find partial matches between slugs
 * Returns a score indicating how closely they match (higher is better)
 */
export function getSlugSimilarity(slug1: string, slug2: string): number {
  if (!slug1 || !slug2) return 0;
  
  const parts1 = slug1.split('-');
  const parts2 = slug2.split('-');
  
  let matchCount = 0;
  
  // Count matching parts
  for (const part1 of parts1) {
    if (part1.length < 3) continue; // Skip very short parts
    
    for (const part2 of parts2) {
      if (part2.length < 3) continue;
      
      if (part1 === part2) {
        matchCount += 2; // Exact match
      } else if (part1.includes(part2) || part2.includes(part1)) {
        matchCount += 1; // Partial match
      }
    }
  }
  
  return matchCount;
}
