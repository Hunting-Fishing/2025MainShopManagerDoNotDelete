
// Create a new hook that matches what the Inventory page expects
import { useState, useEffect } from 'react';
import { getInventoryItems } from '@/services/inventory/crudService';
import { InventoryItemExtended } from '@/types/inventory';

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

  useEffect(() => {
    const fetchItems = async () => {
      setLoading(true);
      try {
        const data = await getInventoryItems();
        setItems(data);
        setFilteredItems(data);
        setError(null);
      } catch (err) {
        setError('Failed to load inventory items');
        console.error("Error fetching inventory:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchItems();
  }, []);

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
  };
}
