
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

function WorkOrdersList() {
  const { workOrders, loading, error, refetch } = useWorkOrders();

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
        <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-medium text-yellow-800">Data Loading Issues</h3>
              <p className="text-sm text-yellow-700">{error}</p>
            </div>
            <button
              onClick={refetch}
              className="text-sm text-yellow-600 hover:text-yellow-800 underline"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      <WorkOrdersHeader workOrders={workOrders} />
      <WorkOrderTable workOrders={workOrders} />
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
