
import { useState, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";

export const useInventoryFilters = (inventoryHook: any) => {
  const { items, fetchItems } = inventoryHook;
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [filters, setFilters] = useState({
    searchQuery: "",
    category: "",
    status: "",
    location: "",
    supplier: "",
    stockLevel: "",
    priceRange: {
      min: 0,
      max: 1000,
    },
  });

  // Initialize filtered items when items or filters change
  useEffect(() => {
    const applyFilters = () => {
      let result = [...items];

      // Search query
      if (filters.searchQuery) {
        const query = filters.searchQuery.toLowerCase();
        result = result.filter(
          (item) =>
            item.name?.toLowerCase().includes(query) ||
            item.sku?.toLowerCase().includes(query) ||
            item.part_number?.toLowerCase().includes(query) ||
            item.manufacturer?.toLowerCase().includes(query) ||
            item.description?.toLowerCase().includes(query)
        );
      }

      // Category filter
      if (filters.category) {
        result = result.filter((item) => item.category === filters.category);
      }

      // Status filter
      if (filters.status) {
        result = result.filter((item) => item.status === filters.status);
      }

      // Location filter
      if (filters.location) {
        result = result.filter((item) => item.location === filters.location);
      }

      // Supplier filter
      if (filters.supplier) {
        result = result.filter((item) => item.supplier === filters.supplier);
      }

      // Stock level filter
      if (filters.stockLevel) {
        switch (filters.stockLevel) {
          case "outOfStock":
            result = result.filter((item) => (item.quantity || 0) === 0);
            break;
          case "lowStock":
            result = result.filter(
              (item) =>
                (item.quantity || 0) > 0 &&
                (item.quantity || 0) <= (item.reorder_point || 0)
            );
            break;
          case "inStock":
            result = result.filter(
              (item) => (item.quantity || 0) > (item.reorder_point || 0)
            );
            break;
        }
      }

      // Price range filter
      if (filters.priceRange) {
        result = result.filter(
          (item) =>
            item.unit_price >= filters.priceRange.min &&
            item.unit_price <= filters.priceRange.max
        );
      }

      setFilteredItems(result);
    };

    applyFilters();
  }, [items, filters]);

  // Update a single filter
  const updateFilter = (
    key: keyof typeof filters,
    value: string | number | { min: number; max: number }
  ) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // Reset all filters
  const resetFilters = () => {
    setFilters({
      searchQuery: "",
      category: "",
      status: "",
      location: "",
      supplier: "",
      stockLevel: "",
      priceRange: {
        min: 0,
        max: 1000,
      },
    });
  };

  // Get available options for dropdowns
  const getFilterOptions = () => {
    const categories = [...new Set(items.map((item) => item.category))].filter(Boolean);
    const statuses = [...new Set(items.map((item) => item.status))].filter(Boolean);
    const locations = [...new Set(items.map((item) => item.location))].filter(Boolean);
    const suppliers = [...new Set(items.map((item) => item.supplier))].filter(Boolean);

    return {
      categories,
      statuses,
      locations,
      suppliers,
    };
  };

  return {
    filteredItems,
    filters,
    updateFilter,
    resetFilters,
    getFilterOptions,
  };
};
