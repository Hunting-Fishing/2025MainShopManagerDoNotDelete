
import { useState, useEffect, useMemo } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';
import { 
  getInventoryCategories, 
  getInventorySuppliers, 
  getInventoryLocations,
  getInventoryStatuses
} from '@/services/inventory/filterService';

export function useInventoryFilters() {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  
  // Category, status, supplier, and location options
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Load items and filter options when component mounts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [itemsData, categoriesData, statusesData, suppliersData, locationsData] = await Promise.all([
          getInventoryItems(),
          getInventoryCategories(),
          getInventoryStatuses(),
          getInventorySuppliers(),
          getInventoryLocations()
        ]);
        
        setItems(itemsData);
        setFilteredItems(itemsData);
        setCategories(categoriesData);
        setStatuses(statusesData);
        setSuppliers(suppliersData);
        setLocations(locationsData);
        setError(null);
      } catch (err) {
        setError('Failed to load inventory items');
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Apply filters when filter states change
  useEffect(() => {
    // Apply filters to items
    let result = [...items];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.name.toLowerCase().includes(query) || 
        item.sku.toLowerCase().includes(query) ||
        (item.description && item.description.toLowerCase().includes(query))
      );
    }

    // Apply category filter
    if (categoryFilter.length > 0) {
      result = result.filter(item => categoryFilter.includes(item.category || ''));
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(item => statusFilter.includes(item.status || ''));
    }

    // Apply supplier filter
    if (supplierFilter) {
      result = result.filter(item => item.supplier === supplierFilter);
    }

    // Apply location filter
    if (locationFilter) {
      result = result.filter(item => item.location === locationFilter);
    }

    setFilteredItems(result);
  }, [items, searchQuery, categoryFilter, statusFilter, supplierFilter, locationFilter]);

  // Mock handlers for export and import
  const handleExport = () => {
    console.log('Export inventory data');
    // Implement export functionality
  };

  const handleImport = () => {
    console.log('Import inventory data');
    // Implement import functionality
  };

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
    locationFilter,
    setLocationFilter,
    filteredItems,
    error,
    // Additional properties needed for the Inventory pages
    categories,
    statuses,
    suppliers,
    locations,
    handleExport,
    handleImport,
    inventoryItems: filteredItems // Alias for backward compatibility
  };
}
