
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface WorkOrderDocumentsTabProps {
  workOrder: WorkOrder;
  isEditMode: boolean;
}

export function WorkOrderDocumentsTab({
  workOrder,
  isEditMode
}: WorkOrderDocumentsTabProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            No documents found for this work order.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
