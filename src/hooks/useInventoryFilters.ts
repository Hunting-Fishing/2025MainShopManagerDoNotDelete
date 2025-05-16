
import { useState, useMemo, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";

export interface InventoryFilters {
  search: string;
  category: string;
  status: string;
  supplier: string;
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export function useInventoryFilters() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  
  const [filters, setFilters] = useState<InventoryFilters>({
    search: "",
    category: "",
    status: "",
    supplier: "",
    sortBy: "name",
    sortDirection: "asc"
  });

  // Function to update a specific filter
  const updateFilter = (key: keyof InventoryFilters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Function to reset all filters
  const resetFilters = () => {
    setFilters({
      search: "",
      category: "",
      status: "",
      supplier: "",
      sortBy: "name",
      sortDirection: "asc"
    });
    setSearchQuery("");
    setCategoryFilter("");
    setStatusFilter("");
    setSupplierFilter("");
  };

  // Fetch inventory items
  useEffect(() => {
    const fetchInventoryData = async () => {
      setLoading(true);
      setError(null);
      try {
        // Simulate API call for now
        // In a real app, you would fetch from API or database
        const data = generateMockInventoryItems(50);
        setInventoryItems(data);
      } catch (err) {
        console.error("Error fetching inventory data:", err);
        setError("Failed to load inventory data. Please try again.");
      } finally {
        setLoading(false);
      }
    };
    
    fetchInventoryData();
  }, []);

  // Sync individual filter states with the combined filters object
  useEffect(() => {
    setFilters(prev => ({
      ...prev,
      search: searchQuery,
      category: categoryFilter,
      status: statusFilter,
      supplier: supplierFilter
    }));
  }, [searchQuery, categoryFilter, statusFilter, supplierFilter]);

  // Apply filters to inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter(item => {
      // Apply search filter
      if (filters.search && 
          !item.name.toLowerCase().includes(filters.search.toLowerCase()) && 
          !item.sku.toLowerCase().includes(filters.search.toLowerCase()) &&
          !item.description?.toLowerCase().includes(filters.search.toLowerCase())) {
        return false;
      }
      
      // Apply category filter
      if (filters.category && item.category !== filters.category) {
        return false;
      }
      
      // Apply status filter
      if (filters.status && item.status !== filters.status) {
        return false;
      }
      
      // Apply supplier filter
      if (filters.supplier && item.supplier !== filters.supplier) {
        return false;
      }
      
      return true;
    }).sort((a, b) => {
      // Apply sorting
      const sortField = filters.sortBy as keyof InventoryItemExtended;
      const direction = filters.sortDirection === 'asc' ? 1 : -1;
      
      if (sortField === 'unit_price') {
        return (a.unit_price - b.unit_price) * direction;
      }
      
      if (typeof a[sortField] === 'string' && typeof b[sortField] === 'string') {
        return (a[sortField] as string).localeCompare(b[sortField] as string) * direction;
      }
      
      return 0;
    });
  }, [inventoryItems, filters]);

  // Extract unique categories, statuses, and suppliers for filter options
  const categories = useMemo(() => {
    const uniqueCategories = [...new Set(inventoryItems.map(item => item.category))];
    return uniqueCategories.sort();
  }, [inventoryItems]);
  
  const statuses = useMemo(() => {
    const uniqueStatuses = [...new Set(inventoryItems.map(item => item.status))];
    return uniqueStatuses.sort();
  }, [inventoryItems]);
  
  const suppliers = useMemo(() => {
    const uniqueSuppliers = [...new Set(inventoryItems.map(item => item.supplier))];
    return uniqueSuppliers.sort();
  }, [inventoryItems]);
  
  const filteredItemsCount = filteredItems.length;

  return {
    loading,
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    filteredItems,
    error,
    categories,
    statuses,
    suppliers,
    filters,
    updateFilter,
    resetFilters,
    filteredItemsCount
  };
}

// Helper function to generate mock inventory data
function generateMockInventoryItems(count: number): InventoryItemExtended[] {
  const categories = ["Electronics", "Automotive", "Tools", "Office Supplies", "Plumbing"];
  const suppliers = ["Acme Corp", "Tech Distributors", "Auto Parts Inc", "Office Depot", "Hardware World"];
  const statuses = ["In Stock", "Low Stock", "Out of Stock", "Discontinued"];
  
  return Array.from({ length: count }, (_, i) => ({
    id: `inv-${i+1}`,
    name: `Item ${i+1}`,
    sku: `SKU-${1000 + i}`,
    quantity: Math.floor(Math.random() * 100),
    reorder_point: 10,
    unit_price: parseFloat((Math.random() * 100 + 10).toFixed(2)),
    category: categories[Math.floor(Math.random() * categories.length)],
    supplier: suppliers[Math.floor(Math.random() * suppliers.length)],
    location: `Shelf ${String.fromCharCode(65 + Math.floor(Math.random() * 26))}-${Math.floor(Math.random() * 10)}`,
    status: statuses[Math.floor(Math.random() * statuses.length)],
    created_at: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
    updated_at: new Date().toISOString(),
    description: `Description for item ${i+1}`,
    cost: parseFloat((Math.random() * 80 + 5).toFixed(2)),
    marginMarkup: Math.floor(Math.random() * 20 + 10)
  }));
}
