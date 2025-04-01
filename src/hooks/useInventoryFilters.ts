
import { useState, useMemo, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { getAllInventoryItems } from "@/services/inventoryService";
import { useToast } from "@/hooks/use-toast";

export function useInventoryFilters() {
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const { toast } = useToast();

  // Fetch inventory items
  useEffect(() => {
    async function fetchInventory() {
      setLoading(true);
      try {
        const items = await getAllInventoryItems();
        setInventoryItems(items);
      } catch (error) {
        console.error("Error fetching inventory:", error);
        toast({
          title: "Error",
          description: "Failed to load inventory items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchInventory();
  }, [toast]);

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
  }, [searchQuery, categoryFilter, statusFilter, supplierFilter, inventoryItems]);

  return {
    inventoryItems,
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
  };
}
