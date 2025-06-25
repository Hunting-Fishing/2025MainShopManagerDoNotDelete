
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import WorkOrdersHeader from '@/components/work-orders/WorkOrdersHeader';
import { WorkOrderTable } from '@/components/work-orders/WorkOrderTable';
import { WorkOrderDetailsView } from '@/components/work-orders/WorkOrderDetailsView';
import { WorkOrderErrorBoundary } from '@/components/work-orders/WorkOrderErrorBoundary';
import { useWorkOrders } from '@/hooks/useWorkOrders';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

function WorkOrdersList() {
  const { workOrders, loading, error } = useWorkOrders();

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

  // Show error state if data fetching failed
  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 rounded-md p-4">
          <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Work Orders</h3>
          <p className="text-red-700">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
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
        <Route path="/:id" element={<WorkOrderDetailsView />} />
      </Routes>
    </WorkOrderErrorBoundary>
  );
}
