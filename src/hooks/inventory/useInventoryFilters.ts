
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { 
  getInventoryCategories, 
  getInventorySuppliers,
  getInventoryLocations,
  getInventoryStatuses
} from '@/services/inventory/filterService';
import { InventoryItemExtended } from '@/types/inventory';

export const useInventoryFilters = () => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [priceRangeFilter, setPriceRangeFilter] = useState({ min: 0, max: 1000 });
  const [stockLevelFilter, setStockLevelFilter] = useState('');
  
  // Reference data
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Load all inventory data
  useEffect(() => {
    const loadInventoryData = async () => {
      setLoading(true);
      try {
        const inventoryItems = await getInventoryItems();
        setItems(inventoryItems);
        setFilteredItems(inventoryItems);
        
        // Load filter options
        const cats = await getInventoryCategories();
        const stats = await getInventoryStatuses();
        const supps = await getInventorySuppliers();
        const locs = await getInventoryLocations();
        
        setCategories(cats);
        setStatuses(stats);
        setSuppliers(supps);
        setLocations(locs);
        
        setError('');
      } catch (err) {
        setError('Failed to load inventory data');
        console.error('Error loading inventory data:', err);
      } finally {
        setLoading(false);
      }
    };
    
    loadInventoryData();
  }, []);

  // Apply filters whenever filter states change
  useEffect(() => {
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
      result = result.filter(item => categoryFilter.includes(item.category));
    }
    
    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter(item => statusFilter.includes(item.status));
    }
    
    // Apply supplier filter
    if (supplierFilter) {
      result = result.filter(item => item.supplier === supplierFilter);
    }
    
    // Apply location filter
    if (locationFilter) {
      result = result.filter(item => item.location === locationFilter);
    }
    
    // Apply price range filter
    result = result.filter(item => {
      const price = Number(item.unit_price);
      return price >= priceRangeFilter.min && price <= priceRangeFilter.max;
    });
    
    // Apply stock level filter
    if (stockLevelFilter) {
      if (stockLevelFilter === 'low') {
        result = result.filter(item => 
          item.quantity > 0 && item.quantity <= item.reorder_point
        );
      } else if (stockLevelFilter === 'out') {
        result = result.filter(item => item.quantity <= 0);
      } else if (stockLevelFilter === 'in') {
        result = result.filter(item => item.quantity > 0);
      }
    }
    
    setFilteredItems(result);
  }, [
    items, 
    searchQuery, 
    categoryFilter, 
    statusFilter, 
    supplierFilter, 
    locationFilter, 
    priceRangeFilter, 
    stockLevelFilter
  ]);

  // Update a single filter
  const updateFilter = (key: string, value: any) => {
    switch (key) {
      case 'search':
        setSearchQuery(value);
        break;
      case 'category':
        setCategoryFilter(value);
        break;
      case 'status':
        setStatusFilter(value);
        break;
      case 'supplier':
        setSupplierFilter(value);
        break;
      case 'location':
        setLocationFilter(value);
        break;
      case 'priceRange':
        setPriceRangeFilter(value);
        break;
      case 'stockLevel':
        setStockLevelFilter(value);
        break;
      default:
        break;
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setCategoryFilter([]);
    setStatusFilter([]);
    setSupplierFilter('');
    setLocationFilter('');
    setPriceRangeFilter({ min: 0, max: 1000 });
    setStockLevelFilter('');
  };
  
  return {
    filteredItems,
    filters: {
      searchQuery,
      category: categoryFilter,
      status: statusFilter,
      location: locationFilter,
      supplier: supplierFilter,
      stockLevel: stockLevelFilter,
      priceRange: priceRangeFilter
    },
    updateFilter,
    resetFilters,
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
    error,
    categories,
    statuses,
    suppliers,
    locations
  };
};
