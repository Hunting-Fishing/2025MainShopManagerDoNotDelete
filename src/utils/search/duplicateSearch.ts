
// If this file exists, we need to make sure it contains the necessary types
// If it doesn't exist, we'll create it

/**
 * Types of matches that can be performed during duplicate search
 */
export type MatchType = 
  | "exact" 
  | "exact_words"
  | "similar" 
  | "partial";

/**
 * Search scope options for duplicate detection
 */
export type SearchScope = 
  | "all" 
  | "categories" 
  | "subcategories" 
  | "jobs";

/**
 * Options for configuring duplicate search behavior
 */
export interface DuplicateSearchOptions {
  searchScope: SearchScope;
  matchTypes: MatchType[];
  similarityThreshold: number;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

/**
 * Represents an occurrence of a duplicate item in the service hierarchy
 */
export interface DuplicateOccurrence {
  id: string;
  name: string;
  type: "category" | "subcategory" | "job";
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
}

/**
 * Represents a group of duplicate items found during search
 */
export interface DuplicateItem {
  name: string;
  groupId: string;
  similarityScore: number;
  occurrences: DuplicateOccurrence[];
}

/**
 * Results from a duplicate search operation
 */
export interface DuplicateSearchResults {
  duplicates: DuplicateItem[];
  totalFound: number;
  searchOptions: DuplicateSearchOptions;
}

/**
 * Default search options for duplicate detection
 */
export const defaultDuplicateSearchOptions: DuplicateSearchOptions = {
  searchScope: "all",
  matchTypes: ["exact", "similar"],
  similarityThreshold: 80,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};
