
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Edit3, Save, X } from 'lucide-react';

interface WorkOrderHeaderProps {
  workOrder: WorkOrder;
  customer: Customer | null;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderHeader({
  workOrder,
  customer,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderHeaderProps) {
  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">
            Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
          </h1>
          <Badge className={getStatusColor(workOrder.status)}>
            {workOrder.status}
          </Badge>
        </div>
        <div className="space-y-1 text-sm text-muted-foreground">
          {customer && (
            <p>Customer: {customer.first_name} {customer.last_name}</p>
          )}
          <p>{workOrder.description}</p>
          {workOrder.created_at && (
            <p>Created: {new Date(workOrder.created_at).toLocaleDateString()}</p>
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {isEditMode ? (
          <>
            <Button size="sm" onClick={onSaveEdit}>
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={onCancelEdit}>
              <X className="h-4 w-4 mr-2" />
              Cancel
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={onStartEdit}>
            <Edit3 className="h-4 w-4 mr-2" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
