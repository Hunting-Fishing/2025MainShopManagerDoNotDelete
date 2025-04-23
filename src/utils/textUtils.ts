
import React from 'react';

/**
 * Highlights the specified search term within a text string by wrapping it in a span element
 * @param text The text to search within
 * @param searchTerm The term to highlight
 * @returns React elements with highlighted search terms
 */
export function highlightText(text: string, searchTerm: string): React.ReactNode {
  if (!searchTerm || !text) {
    return text;
  }

  const parts = text.split(new RegExp(`(${escapeRegExp(searchTerm)})`, 'gi'));
  
  return parts.map((part, index) => {
    if (part.toLowerCase() === searchTerm.toLowerCase()) {
      return <span key={index} className="bg-yellow-200 dark:bg-yellow-900">{part}</span>;
    }
    return part;
  });
}

/**
 * Escapes special characters in a string for use in a regular expression
 * @param string String to escape
 * @returns Escaped string safe for regex
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
