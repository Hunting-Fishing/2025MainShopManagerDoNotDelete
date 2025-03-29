
// Define the search result types
export type SearchResultType = 'work-order' | 'invoice' | 'customer' | 'equipment' | 'inventory';

export interface SearchResult {
  id: string;
  title: string;
  subtitle: string;
  type: SearchResultType;
  url: string;
  relevance?: number; // For sorting by relevance
}
