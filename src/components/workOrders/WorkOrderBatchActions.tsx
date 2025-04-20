
import React from 'react';
import { Button } from '@/components/ui/button';

interface WorkOrderBatchActionsProps {
  selectedCount: number;
}

export const WorkOrderBatchActions: React.FC<WorkOrderBatchActionsProps> = ({ selectedCount }) => {
  if (selectedCount === 0) {
    return null;
  }

  return (
    <div className="bg-blue-50 p-3 rounded-lg border border-blue-200 flex justify-between items-center">
      <div className="font-medium text-blue-800">
        {selectedCount} work order{selectedCount !== 1 ? 's' : ''} selected
      </div>
      <div className="flex gap-2">
        <Button variant="outline" size="sm">
          Export Selected
        </Button>
        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
          Delete Selected
        </Button>
      </div>
    </div>
  );
};
