
import { SearchResult } from "./types";
import { saveRecentSearch } from "./recentSearches";
import { 
  searchWorkOrders, 
  searchInvoices, 
  searchCustomers,
  searchEquipment,
  searchInventory,
  searchVehicles 
} from "./searchProviders";

// Perform a search across all data sources with improved relevance
export const performSearch = async (query: string): Promise<SearchResult[]> => {
  if (!query || query.trim() === '') return [];
  
  // Save the search term
  saveRecentSearch(query.trim());
  
  try {
    // Get results from all search providers
    const [workOrderResults, invoiceResults, customerResults, equipmentResults, inventoryResults, vehicleResults] = await Promise.all([
      searchWorkOrders(query),
      searchInvoices(query),
      searchCustomers(query),
      searchEquipment(query),
      searchInventory(query),
      searchVehicles(query)
    ]);
    
    // Transform customer results to SearchResult type
    const customerSearchResults: SearchResult[] = (customerResults || []).map(customer => ({
      id: customer.id,
      title: `${customer.first_name} ${customer.last_name}`,
      subtitle: customer.email || customer.phone || '',
      type: 'customer',
      url: `/customers/${customer.id}`,
      relevance: 1
    }));
    
    // Transform inventory results to SearchResult type
    const inventorySearchResults: SearchResult[] = (inventoryResults || []).map(item => ({
      id: item.id,
      title: item.name,
      subtitle: `${item.sku} - ${item.category}`,
      type: 'inventory',
      url: `/inventory/${item.id}`,
      relevance: 1
    }));
    
    // Transform vehicle results to SearchResult type
    const vehicleSearchResults: SearchResult[] = (vehicleResults || []).map(vehicle => ({
      id: vehicle.id,
      title: `${vehicle.year} ${vehicle.make} ${vehicle.model}`,
      subtitle: vehicle.customerName || 'Unknown Customer',
      type: 'customer',
      url: `/customers/vehicles/${vehicle.id}`,
      relevance: 1
    }));
    
    // Combine all results
    const results: SearchResult[] = [
      ...workOrderResults,
      ...invoiceResults,
      ...customerSearchResults,
      ...equipmentResults,
      ...inventorySearchResults,
      ...vehicleSearchResults
    ];
    
    // Sort by relevance score (highest first)
    results.sort((a, b) => (b.relevance || 0) - (a.relevance || 0));
    
    // Limit to top results but ensure we have some variety in result types
    const topResults: SearchResult[] = [];
    const typeCount: Record<string, number> = {
      'work-order': 0,
      'invoice': 0,
      'customer': 0,
      'equipment': 0,
      'inventory': 0
    };
    
    // First pass: add high relevance results (top 5 regardless of type)
    for (let i = 0; i < Math.min(5, results.length); i++) {
      topResults.push(results[i]);
      typeCount[results[i].type] = (typeCount[results[i].type] || 0) + 1;
    }
    
    // Second pass: ensure we have at least one of each type (if available)
    for (const type of Object.keys(typeCount)) {
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
    
  } catch (error) {
    console.error("Error performing search:", error);
    return [];
  }
};
