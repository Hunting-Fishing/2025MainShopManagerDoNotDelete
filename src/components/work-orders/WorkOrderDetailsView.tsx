
import React from 'react';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    updateJobLines,
    updateParts,
    updateTimeEntries,
    refreshData
  } = useWorkOrderData(workOrderId);

  const handleWorkOrderUpdate = async () => {
    await refreshData();
  };

  const handlePartsChange = async () => {
    await refreshData();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center py-12">
            <div className="bg-white rounded-xl shadow-sm border border-slate-200/60 p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600 text-lg">Loading work order...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200/60 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error Loading Work Order</h1>
            <p className="text-slate-600 mb-4">{error}</p>
            <button 
              onClick={refreshData}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200/60 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Work Order Not Found</h1>
            <p className="text-slate-600">The requested work order could not be found.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      <div className="container mx-auto p-6 max-w-7xl">
        <WorkOrderDetailsTabs
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries}
          customer={customer}
          onWorkOrderUpdate={handleWorkOrderUpdate}
          onPartsChange={handlePartsChange}
          isEditMode={false}
        />
      </div>
    </div>
  );
}
