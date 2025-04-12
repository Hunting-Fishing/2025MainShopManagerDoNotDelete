
/**
 * Capitalize the first letter of a string
 * @param str String to capitalize
 * @returns Capitalized string
 */
export function capitalize(str: string): string {
  if (!str || typeof str !== 'string') return '';
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Format a camelCase string to Title Case with spaces
 * @param str camelCase string to format
 * @returns Title Case string with spaces
 */
export function camelCaseToTitleCase(str: string): string {
  if (!str || typeof str !== 'string') return '';
  
  // Add space before capital letters and uppercase the first letter
  const result = str.replace(/([A-Z])/g, ' $1');
  return capitalize(result);
}
