
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { WorkOrder } from '@/types/workOrder';

interface EditModeIndicatorProps {
  workOrder: WorkOrder | null;
  isEditMode: boolean;
  className?: string;
}

export function EditModeIndicator({ workOrder, isEditMode, className }: EditModeIndicatorProps) {
  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className={`text-xs space-y-1 ${className}`}>
      <Badge variant={isEditMode ? "default" : "secondary"}>
        {isEditMode ? "Edit Mode" : "Read Only"}
      </Badge>
      {workOrder && (
        <div className="text-muted-foreground">
          Status: {workOrder.status}
        </div>
      )}
    </div>
  );
}
