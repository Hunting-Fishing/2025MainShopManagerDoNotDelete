
import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import { WorkOrder } from '@/types/workOrder';

export function WorkOrderDetailsView() {
  const { id } = useParams<{ id: string }>();
  const [isEditMode, setIsEditMode] = useState(false);
  
  if (!id) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
        <div className="container mx-auto p-6">
          <div className="bg-white rounded-xl shadow-sm border border-red-200/60 p-8 text-center">
            <h1 className="text-2xl font-bold text-red-600 mb-2">Invalid Work Order</h1>
            <p className="text-slate-600">No work order ID provided</p>
          </div>
        </div>
      </div>
    );
  }

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
  } = useWorkOrderData(id);

  const [currentWorkOrder, setCurrentWorkOrder] = useState<WorkOrder | null>(workOrder);

  // Update local state when workOrder data changes
  React.useEffect(() => {
    if (workOrder) {
      setCurrentWorkOrder(workOrder);
    }
  }, [workOrder]);

  const handleWorkOrderUpdate = (updatedWorkOrder: WorkOrder) => {
    console.log('WorkOrderDetailsView: Work order updated', updatedWorkOrder);
    setCurrentWorkOrder(updatedWorkOrder);
  };

  const handleStartEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = () => {
    setIsEditMode(false);
    // Additional save logic could go here
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
            <h1 className="text-2xl font-bold text-red-600 mb-2">Error</h1>
            <p className="text-slate-600">{error}</p>
          </div>
        </div>
      </div>
    );
  }

  if (!currentWorkOrder) {
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
          workOrder={currentWorkOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries}
          customer={customer}
          onJobLinesChange={updateJobLines}
          onTimeEntriesChange={updateTimeEntries}
          onWorkOrderUpdate={handleWorkOrderUpdate}
          onRefreshData={refreshData}
          isEditMode={isEditMode}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
}
