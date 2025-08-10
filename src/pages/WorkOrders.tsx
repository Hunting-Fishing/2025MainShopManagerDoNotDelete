
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WorkOrdersHeader from '@/components/work-orders/WorkOrdersHeader';
import { WorkOrderTable } from '@/components/work-orders/WorkOrderTable';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';
import { WorkOrderErrorBoundary } from '@/components/work-orders/WorkOrderErrorBoundary';
import WorkOrderCreate from './WorkOrderCreate';
import { DatabaseStatusIndicator } from '@/components/database/DatabaseStatusIndicator';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { WorkOrdersViewToggle } from '@/components/work-orders/WorkOrdersViewToggle';
import { WorkOrdersCardsGrid } from '@/components/work-orders/WorkOrdersCardsGrid';

function WorkOrdersList() {
  const { workOrders, loading, error, refetch } = useWorkOrders();
  const [viewMode, setViewMode] = React.useState<'table' | 'cards'>('table');

  console.log('WorkOrdersList: Render state:', { 
    workOrdersCount: workOrders.length, 
    loading, 
    error: error ? error.substring(0, 100) + '...' : null 
  });

  // Show loading state while fetching data
  if (loading) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <LoadingSpinner size="lg" />
          <span className="ml-3 text-lg">Loading work orders...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Show database status indicator */}
      <DatabaseStatusIndicator />
      
      {/* Show error state if data fetching failed */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-red-800">Database Connection Error</h3>
              <p className="text-sm text-red-700 mt-1">{error}</p>
              <p className="text-xs text-red-600 mt-2">
                This might be a temporary issue. Try refreshing the page or contact support if the problem persists.
              </p>
            </div>
            <button
              onClick={refetch}
              className="px-3 py-1 text-sm bg-red-100 text-red-800 hover:bg-red-200 rounded border border-red-300"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* Show work orders count for debugging */}
      {!error && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <p className="text-sm text-blue-800">
            ✅ Database connection successful. Found {workOrders.length} work orders.
            {workOrders.length === 0 && " Try creating a new work order to get started."}
          </p>
        </div>
      )}

      <WorkOrdersHeader workOrders={workOrders} />
      <div className="flex justify-end">
        <WorkOrdersViewToggle view={viewMode} onChange={setViewMode} />
      </div>
      {viewMode === 'table' ? (
        <WorkOrderTable workOrders={workOrders} />
      ) : (
        <WorkOrdersCardsGrid workOrders={workOrders} />
      )}
    </div>
  );
}

export default function WorkOrders() {
  return (
    <WorkOrderErrorBoundary>
      <Routes>
        <Route path="/" element={<WorkOrdersList />} />
        <Route path="/create" element={<WorkOrderCreate />} />
        <Route path="/:id" element={<WorkOrderDetailsView />} />
      </Routes>
    </WorkOrderErrorBoundary>
  );
}
