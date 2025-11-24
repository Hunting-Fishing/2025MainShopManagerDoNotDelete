
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { InventoryPageHeader } from '@/components/inventory/InventoryPageHeader';
import { InventoryContent } from '@/components/inventory/InventoryContent';
import { QuickActionsFloatingButton } from '@/components/inventory/QuickActionsFloatingButton';
import { EnhancedNavigation } from '@/components/inventory/EnhancedNavigation';
import { PerformanceIndicator } from '@/components/inventory/PerformanceOptimizations';
import { useOptimizedInventoryItems } from '@/hooks/inventory/useOptimizedInventoryItems';
import { useOptimizedInventoryFilters } from '@/hooks/inventory/useOptimizedInventoryFilters';
import { useMemoryOptimization } from '@/hooks/inventory/useMemoryOptimization';
import { InventoryLoadingState } from '@/components/inventory/InventoryLoadingState';
import { InventoryErrorState } from '@/components/inventory/InventoryErrorState';
import { InventoryViewProvider } from '@/contexts/InventoryViewContext';
import { ErrorBoundary } from '@/components/inventory/ErrorBoundary';
import { QueryOptimizer } from '@/components/inventory/QueryOptimizer';
import { BulkActionsBar } from '@/components/inventory/BulkActionsBar';
import { ImportExportDialog } from '@/components/inventory/ImportExportDialog';
import { useToast } from '@/hooks/use-toast';
import InventoryAdd from '@/pages/InventoryAdd';
import InventoryEdit from '@/pages/InventoryEdit';
import InventoryCategories from '@/pages/InventoryCategories';
import InventorySuppliers from '@/pages/InventorySuppliers';
import InventoryLocations from '@/pages/InventoryLocations';
import InventoryOrders from '@/pages/InventoryOrders';
import InventoryManager from '@/pages/InventoryManager';
import InventoryManagerNew from '@/pages/InventoryManagerNew';
import InventoryItemDetailsPage from '@/pages/InventoryItemDetails';
import InvoiceScan from '@/pages/InvoiceScan';

/**
 * IMPORTANT: This page uses optimized inventory functionality with centralized data management
 * Performance optimizations: consolidated data fetching, memoization, efficient caching
 * Includes: inventory list, creation, categories, suppliers, locations, etc.
 */
export default function Inventory() {
  const { items, loading, error, updateItem, inventoryStats, refetch } = useOptimizedInventoryItems();
  const { filteredItems } = useOptimizedInventoryFilters();
  const { toast } = useToast();
  
  // Initialize memory optimization for better performance
  useMemoryOptimization({
    maxCacheSize: 50,
    gcInterval: 3 * 60 * 1000, // 3 minutes
    enablePerformanceMonitoring: true
  });
  
  // Dialog states
  const [importExportOpen, setImportExportOpen] = React.useState(false);

  // Use filtered items for display logic
  const displayItems = filteredItems;

  // Bulk actions handlers
  const handleBulkEdit = (itemIds: string[]) => {
    console.log('Bulk edit for items:', itemIds);
    toast({
      title: "Bulk edit",
      description: `Opening bulk edit for ${itemIds.length} items`,
    });
  };

  const handleBulkDelete = async (itemIds: string[]) => {
    console.log('Bulk delete for items:', itemIds);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    toast({
      title: "Items deleted",
      description: `Successfully deleted ${itemIds.length} items`,
    });
  };

  const handleBulkStatusChange = async (itemIds: string[], status: string) => {
    console.log('Bulk status change for items:', itemIds, 'to:', status);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    toast({
      title: "Status updated",
      description: `Updated status for ${itemIds.length} items to ${status}`,
    });
  };

  const handleExportSelected = async (itemIds: string[]) => {
    console.log('Export selected items:', itemIds);
    toast({
      title: "Export started",
      description: `Exporting ${itemIds.length} items`,
    });
  };

  // Import/Export handlers
  const handleImport = async (file: File, options: any) => {
    console.log('Importing file:', file.name, 'with options:', options);
    // Simulate import process
    await new Promise(resolve => setTimeout(resolve, 2000));
    return {
      success: true,
      imported: 150,
      failed: 5,
      errors: ['Invalid SKU format in row 12', 'Missing price in row 34']
    };
  };

  const handleExport = async (options: any) => {
    console.log('Exporting with options:', options);
    // Simulate export process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Create and download a mock file
    const blob = new Blob(['mock,export,data\n1,Item 1,100'], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `inventory-export.${options.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleQuickReorder = () => {
    console.log('Quick reorder triggered');
  };

  const handleBulkImport = () => {
    setImportExportOpen(true);
  };

  const handleGenerateReport = () => {
    console.log('Generate report triggered');
  };

  const handleScanBarcode = () => {
    console.log('Scan barcode triggered');
  };

  return (
    <ErrorBoundary>
      <InventoryViewProvider>
        <div className="relative">
          <Routes>
            <Route path="/" element={
              <div className="p-6 space-y-6">
                <EnhancedNavigation />
                <InventoryPageHeader />
                {loading ? (
                  <InventoryLoadingState />
                ) : error ? (
                  <InventoryErrorState error={error} onRetry={refetch} />
                ) : (
                  <InventoryContent items={displayItems} onUpdateItem={updateItem} loading={loading} />
                )}
              </div>
            } />
            <Route path="/add" element={<InventoryAdd />} />
            <Route path="/edit/:id" element={<InventoryEdit />} />
            <Route path="/categories" element={<InventoryCategories />} />
            <Route path="/suppliers" element={<InventorySuppliers />} />
            <Route path="/locations" element={<InventoryLocations />} />
            <Route path="/orders" element={<InventoryOrders />} />
            <Route path="/manager" element={<InventoryManagerNew />} />
            <Route path="/scan" element={<InvoiceScan />} />
            <Route path="/item/:id" element={<InventoryItemDetailsPage />} />
          </Routes>

          {/* Quick Actions Floating Button - Only on main inventory page */}
          <Routes>
            <Route path="/" element={
              <QuickActionsFloatingButton
                stats={inventoryStats}
                onQuickReorder={handleQuickReorder}
                onBulkImport={handleBulkImport}
                onGenerateReport={handleGenerateReport}
                onScanBarcode={handleScanBarcode}
              />
            } />
          </Routes>

          {/* Bulk Actions Bar */}
          <BulkActionsBar
            onBulkEdit={handleBulkEdit}
            onBulkDelete={handleBulkDelete}
            onBulkStatusChange={handleBulkStatusChange}
            onExportSelected={handleExportSelected}
          />

          {/* Import/Export Dialog */}
          <ImportExportDialog
            isOpen={importExportOpen}
            onClose={() => setImportExportOpen(false)}
            onImport={handleImport}
            onExport={handleExport}
          />

          {/* Performance Monitor - Development Only */}
          <PerformanceIndicator />
          <QueryOptimizer />
        </div>
      </InventoryViewProvider>
    </ErrorBoundary>
  );
}
