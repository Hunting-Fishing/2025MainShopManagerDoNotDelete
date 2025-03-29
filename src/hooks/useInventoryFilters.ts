
import { useState, useMemo } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { inventoryItems } from "@/data/mockInventoryData";

export function useInventoryFilters() {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string>("all");

  // Filter inventory items
  const filteredItems = useMemo(() => {
    return inventoryItems.filter((item) => {
      const matchesSearch = 
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = 
        categoryFilter.length === 0 || categoryFilter.includes(item.category);
      
      const matchesStatus = 
        statusFilter.length === 0 || statusFilter.includes(item.status);
      
      const matchesSupplier = 
        supplierFilter === "all" || item.supplier === supplierFilter;
      
      return matchesSearch && matchesCategory && matchesStatus && matchesSupplier;
    });
  }, [searchQuery, categoryFilter, statusFilter, supplierFilter]);

  return {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    statusFilter,
    setStatusFilter,
    supplierFilter,
    setSupplierFilter,
    filteredItems,
  };
}
