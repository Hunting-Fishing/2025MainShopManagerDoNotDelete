
import { useEffect } from "react";
import { useInventoryOrders } from "@/hooks/inventory/useInventoryOrders";
import { InventoryOrdersHeader } from "./InventoryOrdersHeader";
import { InventoryOrdersTable } from "./InventoryOrdersTable";
import { InventoryOrdersFilters } from "./InventoryOrdersFilters";
import { OverdueOrdersAlert } from "./OverdueOrdersAlert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useState } from "react";

export function InventoryOrdersPage() {
  const { 
    loading, 
    error, 
    orders, 
    loadOrders, 
    overdueOrders, 
    loadOverdueOrders 
  } = useInventoryOrders();
  
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [supplierFilter, setSupplierFilter] = useState<string>("all");
  const [dateFilter, setDateFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState<string>("");
  
  // Load orders on component mount
  useEffect(() => {
    loadOrders();
    loadOverdueOrders();
  }, [loadOrders, loadOverdueOrders]);
  
  // Filter orders based on selected filters
  const filteredOrders = orders.filter(order => {
    // Status filter
    if (statusFilter !== "all" && order.status !== statusFilter) {
      return false;
    }
    
    // Supplier filter
    if (supplierFilter !== "all" && order.supplier !== supplierFilter) {
      return false;
    }
    
    // Date filter
    const orderDate = new Date(order.order_date);
    const now = new Date();
    
    if (dateFilter === "today") {
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      if (!(orderDate >= today && orderDate < tomorrow)) {
        return false;
      }
    } else if (dateFilter === "thisWeek") {
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);
      
      if (!(orderDate >= startOfWeek && orderDate < endOfWeek)) {
        return false;
      }
    } else if (dateFilter === "thisMonth") {
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      
      if (!(orderDate >= startOfMonth && orderDate <= endOfMonth)) {
        return false;
      }
    }
    
    // Search query (case-insensitive search on item name, supplier, and notes)
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const matchesItemName = order.item_name?.toLowerCase().includes(query);
      const matchesSupplier = order.supplier.toLowerCase().includes(query);
      const matchesNotes = order.notes?.toLowerCase().includes(query);
      
      if (!(matchesItemName || matchesSupplier || matchesNotes)) {
        return false;
      }
    }
    
    return true;
  });
  
  // Get unique suppliers for filter dropdown
  const suppliers = [...new Set(orders.map(order => order.supplier))];
  
  if (loading) {
    return (
      <div className="flex justify-center items-center h-[500px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg text-center">
        <h3 className="text-lg font-semibold text-red-800">Error Loading Orders</h3>
        <p className="text-red-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <InventoryOrdersHeader />
      
      {overdueOrders.length > 0 && (
        <OverdueOrdersAlert orders={overdueOrders} />
      )}
      
      <InventoryOrdersFilters 
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
        suppliers={suppliers}
        dateFilter={dateFilter}
        setDateFilter={setDateFilter}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <InventoryOrdersTable orders={filteredOrders} />
    </div>
  );
}
