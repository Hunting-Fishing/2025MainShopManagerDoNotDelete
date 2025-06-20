
import React, { useState } from 'react';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { useWorkOrderData } from '@/hooks/useWorkOrderData';
import { useWorkOrderStatus } from '@/hooks/useWorkOrderStatus';
import { toast } from '@/hooks/use-toast';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const [isEditMode, setIsEditMode] = useState(false);
  
  const {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    refreshData
  } = useWorkOrderData(workOrderId);

  const {
    status,
    isUpdating: isUpdatingStatus,
    updateStatus,
    error: statusError
  } = useWorkOrderStatus(workOrderId, workOrder?.status || '');

  const handleWorkOrderUpdate = async () => {
    await refreshData();
  };

  const handlePartsChange = async () => {
    await refreshData();
  };

  const handleStatusChange = async (newStatus: string) => {
    try {
      const result = await updateStatus(newStatus);
      if (result.success) {
        toast({
          title: "Success",
          description: "Work order status updated successfully",
        });
        await refreshData();
      }
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive",
      });
    }
  };

  const handleStartEdit = () => {
    setIsEditMode(true);
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
  };

  const handleSaveEdit = async () => {
    try {
      await refreshData();
      setIsEditMode(false);
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
    } catch (error) {
      console.error('Error saving work order:', error);
      toast({
        title: "Error",
        description: "Failed to save work order changes",
        variant: "destructive",
      });
    }
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
        <WorkOrderDetailsHeader
          workOrder={workOrder}
          customer={customer}
          currentStatus={status}
          isUpdatingStatus={isUpdatingStatus}
          onStatusChange={handleStatusChange}
          isEditMode={isEditMode}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
        
        <WorkOrderDetailsTabs
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries}
          customer={customer}
          onWorkOrderUpdate={handleWorkOrderUpdate}
          onPartsChange={handlePartsChange}
          isEditMode={isEditMode}
        />
      </div>
    </div>
  );
}
