import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useWorkOrderMaster } from '@/hooks/useWorkOrderMaster';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { LoadingSpinner } from '@/components/ui/loading-spinner';

interface WorkOrderDetailsViewProps {
  isEditMode?: boolean;
}

export function WorkOrderDetailsView({ isEditMode = false }: WorkOrderDetailsViewProps) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [editMode, setEditMode] = useState(isEditMode);

  const {
    workOrder,
    jobLines,
    allParts,
    timeEntries,
    customer,
    isLoading,
    error,
    updateJobLines,
    updateTimeEntries,
    handleJobLineUpdate,
    handleJobLineDelete,
    handlePartUpdate,
    handlePartDelete
  } = useWorkOrderMaster(id);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-center min-h-[400px]">
            <LoadingSpinner />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-xl font-semibold text-red-600 mb-2">Error Loading Work Order</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => navigate('/work-orders')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="container mx-auto px-6 py-8">
          <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Work Order Not Found</h2>
            <p className="text-gray-600 mb-4">The requested work order could not be found.</p>
            <Button onClick={() => navigate('/work-orders')} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Button>
          </div>
        </div>
      </div>
    );
  }

  const handleStartEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  const handleSaveEdit = () => {
    setEditMode(false);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Work Orders
            </Button>
            
            <div className="flex-1">
              <h1 className="text-2xl font-semibold text-gray-900">
                Work Order #{workOrder.id.slice(0, 8)}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {workOrder.description || 'No description provided'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        <WorkOrderDetailsTabs
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries || []}
          customer={customer}
          onJobLinesChange={updateJobLines}
          onTimeEntriesChange={updateTimeEntries}
          onJobLineUpdate={handleJobLineUpdate}
          onJobLineDelete={handleJobLineDelete}
          onPartUpdate={handlePartUpdate}
          onPartDelete={handlePartDelete}
          isEditMode={editMode}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
}
