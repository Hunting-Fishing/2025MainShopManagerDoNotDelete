
import { useState, useEffect, useMemo } from "react";
import { InventoryItemExtended } from "@/types/inventory";

interface UseInventoryParams {
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  supplierFilter: string;
  locationFilter: string;
}

export const useInventory = (params: UseInventoryParams) => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch inventory items
  useEffect(() => {
    const fetchInventory = async () => {
      setLoading(true);
      try {
        // In a real application, this would be an API call
        // For now, we'll simulate data
        const mockData = generateMockInventoryItems(50);
        setItems(mockData);
        setError(null);
      } catch (err) {
        console.error("Error fetching inventory:", err);
        setError("Failed to load inventory data");
      } finally {
        setLoading(false);
      }
    };

    fetchInventory();
  }, []);

  // Filter items based on search and filters
  const filteredItems = useMemo(() => {
    return items.filter(item => {
      // Apply search filter
      if (params.searchQuery && 
          !item.name.toLowerCase().includes(params.searchQuery.toLowerCase()) && 
          !item.sku.toLowerCase().includes(params.searchQuery.toLowerCase()) &&
          !item.description?.toLowerCase().includes(params.searchQuery.toLowerCase())) {
        return false;
      }
      
      // Apply category filter
      if (params.categoryFilter && 
          !params.categoryFilter.split(',').some(cat => cat === item.category)) {
        return false;
      }
      
      // Apply status filter
      if (params.statusFilter && 
          !params.statusFilter.split(',').some(status => status === item.status)) {
        return false;
      }
      
      // Apply supplier filter
      if (params.supplierFilter && item.supplier !== params.supplierFilter) {
        return false;
      }

      // Apply location filter
      if (params.locationFilter && item.location !== params.locationFilter) {
        return false;
      }
      
      return true;
    });
  }, [items, params.searchQuery, params.categoryFilter, params.statusFilter, params.supplierFilter, params.locationFilter]);

  // Calculate low stock and out of stock counts
  const lowStockCount = useMemo(() => {
    return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_point).length;
  }, [items]);

  const outOfStockCount = useMemo(() => {
    return items.filter(item => item.quantity === 0).length;
  }, [items]);

  // Calculate total value
  const totalValue = useMemo(() => {
    return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
  }, [items]);

  // Extract unique categories, statuses, suppliers, locations
  const categories = useMemo(() => {
    return [...new Set(items.map(item => item.category))];
  }, [items]);

  const statuses = useMemo(() => {
    return [...new Set(items.map(item => item.status))];
  }, [items]);

  const suppliers = useMemo(() => {
    return [...new Set(items.map(item => item.supplier))];
  }, [items]);

  const locations = useMemo(() => {
    return [...new Set(items.map(item => item.location || ""))].filter(location => location);
  }, [items]);

  return {
    items,
    filteredItems,
    loading,
    error,
    lowStockCount,
    outOfStockCount,
    totalValue,
    categories,
    statuses,
    suppliers,
    locations
  };
};

// Helper function to generate mock inventory data
function generateMockInventoryItems(count: number): InventoryItemExtended[] {
  const categories = ["Electronics", "Automotive", "Tools", "Office Supplies", "Plumbing"];
  const suppliers = ["Acme Corp", "Tech Distributors", "Auto Parts Inc", "Office Depot", "Hardware World"];
  const statuses = ["In Stock", "Low Stock", "Out of Stock", "Discontinued"];
  const locations = ["Warehouse A", "Warehouse B", "Store Front", "Back Room", "Workshop"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `inv-${i+1}`,
    name: `Item ${i+1}`,
    sku: `SKU-${1000 + i}`,
    quantity: Math.floor(Math.random() * 100),
    reorder_point: 10,
    unit_price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
    category: categories[Math.floor(Math.random() * categories.length)],
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    location: locations[Math.floor(Math.random() * locations.length)],
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    updated_at: new Date().toISOString(),
    description: `Description for item ${i+1}`,
    cost: parseFloat((Math.random() * 80 + 5).toFixed(2)),
    marginMarkup: Math.floor(Math.random() * 20 + 10)
  }));
}
