
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Settings } from "lucide-react";
import { useWorkOrderData } from "@/hooks/useWorkOrderData";

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
    updateTimeEntries
  } = useWorkOrderData(id || '');

  const handleStartEdit = () => setEditMode(true);
  const handleCancelEdit = () => setEditMode(false);
  const handleSaveEdit = () => {
    setEditMode(false);
    // Add save logic here if needed
  };

  if (!id) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-4">Error: Work Order ID is required</div>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="space-y-6">
          {/* Header skeleton */}
          <div className="flex items-center justify-between">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-10 w-32" />
          </div>
          
          {/* Main content skeleton */}
          <Card>
            <CardContent className="p-6">
              <div className="space-y-4">
                <Skeleton className="h-12 w-full" />
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                  <Skeleton className="h-24 w-full" />
                </div>
                <Skeleton className="h-64 w-full" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-red-500 text-lg font-medium mb-4">Error: {error}</div>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-gray-500 text-lg font-medium mb-4">Work Order not found</div>
              <Button onClick={() => navigate(-1)} variant="outline">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Go Back
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto p-6 max-w-7xl">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
              </h1>
              <p className="text-gray-600">
                {customer ? `${customer.first_name} ${customer.last_name}` : 'Customer details loading...'}
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            {editMode && (
              <div className="flex items-center gap-2 bg-blue-50 px-3 py-1 rounded-full">
                <Settings className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-700">Edit Mode</span>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <WorkOrderDetailsTabs
          workOrder={workOrder}
          jobLines={jobLines}
          allParts={allParts}
          timeEntries={timeEntries}
          customer={customer}
          onJobLinesChange={updateJobLines}
          onTimeEntriesChange={updateTimeEntries}
          isEditMode={editMode}
          onStartEdit={handleStartEdit}
          onCancelEdit={handleCancelEdit}
          onSaveEdit={handleSaveEdit}
        />
      </div>
    </div>
  );
}
