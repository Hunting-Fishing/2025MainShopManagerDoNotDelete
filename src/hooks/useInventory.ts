
import { useState, useEffect, useCallback } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { getInventoryItems } from "@/services/inventory/crudService";
import { calculateTotalValue, countLowStockItems, countOutOfStockItems } from "@/services/inventory/utils";
import { exportToCSV } from "@/utils/export";
import { toast } from "sonner";

interface UseInventoryProps {
  searchQuery: string;
  categoryFilter: string;
  statusFilter: string;
  supplierFilter: string;
  locationFilter: string;
}

export const useInventory = ({
  searchQuery,
  categoryFilter,
  statusFilter,
  supplierFilter,
  locationFilter,
}: UseInventoryProps) => {
  const [items, setItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Get all unique categories, statuses, suppliers, and locations from items
  const categories = [...new Set(items.map(item => item.category))].filter(Boolean).sort();
  const statuses = [...new Set(items.map(item => item.status))].filter(Boolean).sort();
  const suppliers = [...new Set(items.map(item => item.supplier))].filter(Boolean).sort();
  const locations = [...new Set(items.map(item => item.location))].filter(Boolean).sort();
  
  // Fetch inventory data
  const fetchItems = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getInventoryItems();
      setItems(data);
    } catch (err) {
      console.error("Error fetching inventory:", err);
      setError("Failed to load inventory items");
      toast.error("Failed to load inventory items");
    } finally {
      setLoading(false);
    }
  }, []);
  
  // Load inventory on component mount
  useEffect(() => {
    fetchItems();
  }, [fetchItems]);
  
  // Filter items based on search query and filter criteria
  const filteredItems = items.filter((item) => {
    // Search filter
    const matchesSearch = !searchQuery || 
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.description && item.description.toLowerCase().includes(searchQuery.toLowerCase()));
    
    // Category filter
    const categoryArray = categoryFilter.split(',').filter(Boolean);
    const matchesCategory = !categoryFilter || 
      categoryArray.length === 0 || 
      categoryArray.includes(item.category);
    
    // Status filter
    const statusArray = statusFilter.split(',').filter(Boolean);
    const matchesStatus = !statusFilter || 
      statusArray.length === 0 || 
      statusArray.includes(item.status);
    
    // Supplier filter
    const matchesSupplier = !supplierFilter || 
      item.supplier === supplierFilter;
    
    // Location filter
    const matchesLocation = !locationFilter || 
      item.location === locationFilter;
    
    return matchesSearch && matchesCategory && matchesStatus && matchesSupplier && matchesLocation;
  });
  
  // Calculate statistics
  const lowStockCount = countLowStockItems(items);
  const outOfStockCount = countOutOfStockItems(items);
  const totalValue = calculateTotalValue(items);
  
  // Export handler
  const handleExport = useCallback(() => {
    try {
      // Only export filtered items
      const exportData = filteredItems.map((item) => ({
        Name: item.name,
        SKU: item.sku,
        Category: item.category,
        Quantity: item.quantity,
        'Unit Price': item.unit_price,
        'Reorder Point': item.reorder_point,
        Supplier: item.supplier,
        Status: item.status,
        Location: item.location,
        'Last Updated': new Date(item.updated_at).toLocaleDateString()
      }));
      
      exportToCSV(exportData, `inventory-export-${new Date().toISOString().split('T')[0]}`);
      toast.success("Inventory exported successfully");
    } catch (error) {
      console.error("Export failed:", error);
      toast.error("Failed to export inventory");
    }
  }, [filteredItems]);
  
  return {
    items,
    filteredItems,
    loading,
    error,
    categories,
    statuses,
    suppliers,
    locations,
    lowStockCount,
    outOfStockCount,
    totalValue,
    handleExport,
    refreshItems: fetchItems,
    filteredItemsCount: filteredItems.length
  };
};
