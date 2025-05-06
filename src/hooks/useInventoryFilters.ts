import { useState, useEffect, useCallback } from "react";
import { useInventoryCrud } from "@/hooks/inventory/useInventoryCrud";
import { InventoryItemExtended } from "@/types/inventory";
import { getInventoryCategories } from "@/services/inventory/categoryService";
import { getInventorySuppliers } from "@/services/inventory/supplierService";
import { toast } from "@/hooks/use-toast";

export function useInventoryFilters() {
  const { loadInventoryItems } = useInventoryCrud();
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [filteredItems, setFilteredItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dataFetchAttempted, setDataFetchAttempted] = useState(false);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState("all");
  const [locationFilter, setLocationFilter] = useState("all");

  // Filter options
  const [categories, setCategories] = useState<string[]>([]);
  const [statuses, setStatuses] = useState<string[]>([]);
  const [suppliers, setSuppliers] = useState<string[]>([]);
  const [locations, setLocations] = useState<string[]>([]);

  // Load inventory items
  useEffect(() => {
    async function fetchData() {
      if (dataFetchAttempted) return; // Only try to fetch once to prevent infinite loops
      
      setDataFetchAttempted(true);
      setLoading(true);
      
      try {
        // First load the inventory items
        const items = await loadInventoryItems();
        setInventoryItems(items);
        setFilteredItems(items);
        
        // Extract unique filter values from items
        const uniqueCategories = Array.from(new Set(items.map(item => item.category))).filter(Boolean) as string[];
        const uniqueStatuses = Array.from(new Set(items.map(item => item.status))).filter(Boolean) as string[];
        const uniqueSuppliers = Array.from(new Set(items.map(item => item.supplier))).filter(Boolean) as string[];
        const uniqueLocations = Array.from(new Set(items.map(item => item.location))).filter(Boolean) as string[];
        
        // Set these as fallbacks
        setStatuses(uniqueStatuses);
        setLocations(uniqueLocations);
        
        // Get additional categories and suppliers from database
        try {
          const dbCategories = await getInventoryCategories();
          const dbSuppliers = await getInventorySuppliers();
          
          // Merge with unique values from items
          setCategories([...new Set([...uniqueCategories, ...dbCategories])]);
          setSuppliers([...new Set([...uniqueSuppliers, ...dbSuppliers])]);
        } catch (err) {
          console.error("Error fetching categories or suppliers:", err);
          // Fall back to unique values from items
          setCategories(uniqueCategories);
          setSuppliers(uniqueSuppliers);
        }
      } catch (err) {
        console.error("Failed to load inventory items:", err);
        setError("Failed to load inventory items");
        toast({
          title: "Error",
          description: "Could not load inventory items",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [loadInventoryItems, dataFetchAttempted]);

  // Apply filters
  useEffect(() => {
    let result = [...inventoryItems];

    // Apply search filter
    if (searchQuery) {
      const lowerSearch = searchQuery.toLowerCase();
      result = result.filter(
        (item) =>
          item.name.toLowerCase().includes(lowerSearch) ||
          (item.sku && item.sku.toLowerCase().includes(lowerSearch)) ||
          (item.partNumber && item.partNumber.toLowerCase().includes(lowerSearch)) ||
          (item.description && item.description.toLowerCase().includes(lowerSearch)) ||
          (item.barcode && item.barcode.toLowerCase().includes(lowerSearch))
      );
    }

    // Apply category filter
    if (categoryFilter.length > 0) {
      result = result.filter((item) => categoryFilter.includes(item.category));
    }

    // Apply status filter
    if (statusFilter.length > 0) {
      result = result.filter((item) => statusFilter.includes(item.status));
    }

    // Apply supplier filter
    if (supplierFilter && supplierFilter !== "all") {
      result = result.filter((item) => item.supplier === supplierFilter);
    }

    // Apply location filter
    if (locationFilter && locationFilter !== "all") {
      result = result.filter((item) => item.location === locationFilter);
    }

    setFilteredItems(result);
  }, [inventoryItems, searchQuery, categoryFilter, statusFilter, supplierFilter, locationFilter]);

  // CSV export handler
  const handleExport = useCallback(() => {
    try {
      // Create CSV content
      const headers = [
        "Part Number", "Name", "SKU", "Category", "Quantity", 
        "Status", "Cost", "Price", "Supplier", "Location", "Description"
      ];
      
      const rows = filteredItems.map(item => [
        item.partNumber || "",
        item.name,
        item.sku,
        item.category,
        item.quantity,
        item.status,
        item.cost?.toFixed(2) || "",
        item.unitPrice.toFixed(2),
        item.supplier,
        item.location || "",
        item.description || ""
      ]);
      
      const csvContent = [
        headers.join(","),
        ...rows.map(row => row.map(cell => `"${String(cell).replace(/"/g, '""')}"`).join(","))
      ].join("\n");
      
      // Create download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement("a");
      const url = URL.createObjectURL(blob);
      link.setAttribute("href", url);
      link.setAttribute("download", `inventory_export_${new Date().toISOString().slice(0,10)}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: `Exported ${filteredItems.length} inventory items to CSV`,
        variant: "default",
      });
    } catch (err) {
      console.error("Export error:", err);
      toast({
        title: "Export failed",
        description: "Could not export inventory items",
        variant: "destructive",
      });
    }
  }, [filteredItems]);
  
  // CSV import handler - just a stub for now
  const handleImport = useCallback(() => {
    // This would open a dialog to select a file and then process it
    toast({
      title: "Import",
      description: "CSV import functionality will be added soon",
      variant: "default",
    });
  }, []);

  return {
    inventoryItems,
    loading,
    error,
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
    categories,
    statuses,
    suppliers,
    locations,
    handleExport,
    handleImport
  };
}
