
import { workOrders } from "@/data/workOrdersData";
import { invoices } from "@/data/invoiceData";
import { customers } from "@/data/customersData";
import { equipment } from "@/data/equipmentData";
import { inventoryItems } from "@/data/mockInventoryData";

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

// Search history storage
const MAX_RECENT_SEARCHES = 10;
const STORAGE_KEY = 'esm-recent-searches';

// Save recent search to localStorage
export const saveRecentSearch = (query: string): void => {
  try {
    const recentSearches = getRecentSearches();
    // Remove if already exists (to move to top)
    const updatedSearches = recentSearches.filter(s => s !== query);
    // Add to beginning
    updatedSearches.unshift(query);
    // Limit to max size
    const trimmedSearches = updatedSearches.slice(0, MAX_RECENT_SEARCHES);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmedSearches));
  } catch (error) {
    console.error('Error saving recent search:', error);
  }
};

// Get recent searches from localStorage
export const getRecentSearches = (): string[] => {
  try {
    const searches = localStorage.getItem(STORAGE_KEY);
    return searches ? JSON.parse(searches) : [];
  } catch (error) {
    console.error('Error getting recent searches:', error);
    return [];
  }
};

// Clear all recent searches
export const clearRecentSearches = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing recent searches:', error);
  }
};

// Find exact and partial matches with relevance scoring
const findMatches = (text: string, query: string): number => {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Exact match gets highest score
  if (normalizedText === normalizedQuery) return 100;
  
  // Contains exact match (whole word)
  if (normalizedText.includes(` ${normalizedQuery} `) || 
      normalizedText.startsWith(`${normalizedQuery} `) || 
      normalizedText.endsWith(` ${normalizedQuery}`)) {
    return 80;
  }
  
  // Contains the query as part of text
  if (normalizedText.includes(normalizedQuery)) {
    return 60;
  }
  
  // Contains parts of the query (split by space)
  const queryParts = normalizedQuery.split(' ').filter(p => p.length > 2);
  if (queryParts.some(part => normalizedText.includes(part))) {
    return 40;
  }
  
  return 0;
};

// Perform a search across all data sources with improved relevance
export const performSearch = (query: string): SearchResult[] => {
  if (!query || query.trim() === '') return [];
  
  // Save the search term
  saveRecentSearch(query.trim());
  
  const normalizedQuery = query.toLowerCase().trim();
  const results: SearchResult[] = [];

  // Search work orders
  workOrders.forEach(order => {
    let relevance = 0;
    
    // Check different fields with different weights
    relevance = Math.max(
      relevance,
      findMatches(order.id, normalizedQuery),
      findMatches(order.description, normalizedQuery) * 0.9,
      findMatches(order.customer, normalizedQuery) * 0.8,
      findMatches(order.location, normalizedQuery) * 0.7,
      findMatches(order.technician, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: order.id,
        title: order.description,
        subtitle: `Work Order - ${order.customer}`,
        type: 'work-order',
        url: `/work-orders/${order.id}`,
        relevance
      });
    }
  });

  // Search invoices
  invoices.forEach(invoice => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(invoice.id, normalizedQuery),
      findMatches(invoice.description, normalizedQuery) * 0.9,
      findMatches(invoice.customer, normalizedQuery) * 0.8
    );
    
    if (relevance > 0) {
      results.push({
        id: invoice.id,
        title: invoice.description,
        subtitle: `Invoice - ${invoice.customer}`,
        type: 'invoice',
        url: `/invoices/${invoice.id}`,
        relevance
      });
    }
  });

  // Search customers
  customers.forEach(customer => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(customer.id, normalizedQuery),
      findMatches(customer.name, normalizedQuery),
      customer.company ? findMatches(customer.company, normalizedQuery) * 0.9 : 0,
      customer.email ? findMatches(customer.email, normalizedQuery) * 0.8 : 0,
      customer.phone ? findMatches(customer.phone, normalizedQuery) * 0.7 : 0
    );
    
    if (relevance > 0) {
      results.push({
        id: customer.id,
        title: customer.name,
        subtitle: `Customer${customer.company ? ` - ${customer.company}` : ''}`,
        type: 'customer',
        url: `/customers/${customer.id}`,
        relevance
      });
    }
  });

  // Search equipment
  equipment.forEach(item => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(item.id, normalizedQuery),
      findMatches(item.name, normalizedQuery),
      findMatches(item.model, normalizedQuery) * 0.9,
      findMatches(item.serialNumber, normalizedQuery) * 0.9,
      findMatches(item.customer, normalizedQuery) * 0.8,
      findMatches(item.manufacturer, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Equipment - ${item.customer}`,
        type: 'equipment',
        url: `/equipment/${item.id}`,
        relevance
      });
    }
  });

  // Search inventory
  inventoryItems.forEach(item => {
    let relevance = 0;
    
    relevance = Math.max(
      relevance,
      findMatches(item.id, normalizedQuery),
      findMatches(item.name, normalizedQuery),
      findMatches(item.sku, normalizedQuery) * 0.9,
      findMatches(item.description || '', normalizedQuery) * 0.8,
      findMatches(item.category, normalizedQuery) * 0.7
    );
    
    if (relevance > 0) {
      results.push({
        id: item.id,
        title: item.name,
        subtitle: `Inventory - ${item.sku}`,
        type: 'inventory',
        url: `/inventory/${item.id}`,
        relevance
      });
    }
  });

  // Sort by relevance score (highest first)
  results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
  
  // Limit to top results but ensure we have some variety in result types
  const topResults: SearchResult[] = [];
  const typeCount: Record<SearchResultType, number> = {
    'work-order': 0,
    'invoice': 0,
    'customer': 0,
    'equipment': 0,
    'inventory': 0
  };
  
  // First pass: add high relevance results (top 5 regardless of type)
  for (let i = 0; i < Math.min(5, results.length); i++) {
    topResults.push(results[i]);
    typeCount[results[i].type]++;
  }
  
  // Second pass: ensure we have at least one of each type (if available)
  for (const type of Object.keys(typeCount) as SearchResultType[]) {
    if (typeCount[type] === 0) {
      const item = results.find(r => r.type === type && !topResults.includes(r));
      if (item) {
        topResults.push(item);
        typeCount[type]++;
      }
    }
  }
  
  // Third pass: add remaining results up to limit
  let remainingSlots = 10 - topResults.length;
  for (let i = 0; i < results.length && remainingSlots > 0; i++) {
    if (!topResults.includes(results[i])) {
      topResults.push(results[i]);
      remainingSlots--;
    }
  }
  
  // Final sort by relevance
  return topResults.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
};
