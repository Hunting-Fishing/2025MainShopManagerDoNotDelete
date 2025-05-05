
// Re-export everything from individual files
export * from './types';
export * from './recentSearches';
export * from './relevanceUtils';
export * from './searchProviders';
export * from './searchService';
export * from './customerSearch';
export * from './serviceSearch';

// Generic search function that combines results from different search providers
import { SearchResult } from "./types";
import { performServiceSearch } from "./serviceSearch";

/**
 * Perform a search across all searchable entities
 * @param query The search query
 * @returns Array of search results
 */
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query.trim()) {
    return [];
  }
  
  // In a real application, this would combine results from multiple search providers
  // For now, we'll just return service search results
  try {
    // Here we would call multiple search providers and combine their results
    // const customerResults = await searchCustomers(query);
    // const workOrderResults = await searchWorkOrders(query);
    // etc.
    
    // For now, we're just returning an empty array since we don't have
    // the necessary data to perform a real search
    return [];
  } catch (error) {
    console.error("Search error:", error);
    return [];
  }
};
