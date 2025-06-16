
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { WorkOrderDetailsTabs } from "./details/WorkOrderDetailsTabs";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
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
  };

  if (!id) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: Work Order ID is required.</div>
          <button onClick={() => navigate(-1)} className="text-blue-500 mt-2">
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-40 w-full" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-32 w-full" />
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-red-500">Error: {error}</div>
          <button onClick={() => navigate(-1)} className="text-blue-500 mt-2">
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  if (!workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div>Work Order not found.</div>
          <button onClick={() => navigate(-1)} className="text-blue-500 mt-2">
            Go Back
          </button>
        </CardContent>
      </Card>
    );
  }

  return (
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
  );
}
