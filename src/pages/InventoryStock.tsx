
import React, { useState, useEffect } from 'react';
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/lib/supabase";
import { InventoryItem } from "@/types/inventory";
import { InventoryStockHeader } from "@/components/inventory/InventoryStockHeader";
import { InventoryTable } from "@/components/inventory/InventoryTable";
import { InventoryFilter } from "@/components/inventory/InventoryFilter";
import { InventoryPagination } from "@/components/inventory/InventoryPagination";
import { generateInventoryReport } from "@/utils/inventory/reportGenerator";

export default function InventoryStock() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string[]>([]);
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [supplierFilter, setSupplierFilter] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error } = await supabase
        .from('inventory_items')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      if (data) {
        setInventory(data);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch inventory data');
      toast({
        title: 'Error',
        description: 'Failed to fetch inventory data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventory.filter(item => {
    const searchMatch = item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        (item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false) ||
                        item.sku.toLowerCase().includes(searchQuery.toLowerCase());

    const categoryMatch = categoryFilter.length === 0 || categoryFilter.includes(item.category || '');
    const statusMatch = statusFilter.length === 0 || statusFilter.includes(item.status || '');
    const supplierMatch = supplierFilter === '' || item.supplier === supplierFilter;

    return searchMatch && categoryMatch && statusMatch && supplierMatch;
  });

  const totalItems = filteredInventory.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);
  const paginatedInventory = filteredInventory.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const handleExport = async () => {
    try {
      const reportData = inventory.map(item => ({
        Name: item.name,
        SKU: item.sku,
        Description: item.description,
        Price: item.unit_price,
        Category: item.category,
        Supplier: item.supplier,
        Status: item.status,
        Quantity: item.quantity,
        ReorderPoint: item.reorder_point,
      }));

      await generateInventoryReport(reportData);
      toast({
        title: 'Success',
        description: 'Inventory report generated successfully',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to generate inventory report',
        variant: 'destructive',
      });
    }
  };

  const lowStockCount = inventory.filter(item => item.quantity !== undefined && item.reorder_point !== undefined && item.quantity <= item.reorder_point).length;
  const outOfStockCount = inventory.filter(item => item.quantity === 0).length;
  const totalInventoryValue = inventory.reduce((acc, item) => acc + (item.unit_price * (item.quantity || 0)), 0);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  return (
    <div className="container mx-auto p-4 space-y-6">
      <InventoryStockHeader 
        title="Inventory Stock"
        lowStockCount={lowStockCount}
        outOfStockCount={outOfStockCount}
        totalValue={totalInventoryValue}
        onExport={handleExport}
        onRefresh={fetchInventoryData}
      />
      
      <InventoryFilter
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        supplierFilter={supplierFilter}
        setSupplierFilter={setSupplierFilter}
      />

      {loading ? (
        <div className="text-center">Loading inventory data...</div>
      ) : error ? (
        <div className="text-red-500 text-center">{error}</div>
      ) : (
        <>
          <InventoryTable items={paginatedInventory} />
          <InventoryPagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        </>
      )}
    </div>
  );
}
