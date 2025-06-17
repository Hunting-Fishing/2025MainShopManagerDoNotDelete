
import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Edit3, Save, X } from 'lucide-react';
import { WORK_ORDER_STATUSES } from '@/data/workOrderConstants';
import { useWorkOrderStatus } from '@/hooks/useWorkOrderStatus';

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
  const { status, updateStatus, isUpdating } = useWorkOrderStatus(workOrder.id, workOrder.status);
  const [localStatus, setLocalStatus] = useState(status);

  const getStatusColor = (statusValue: string) => {
    switch (statusValue?.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    setLocalStatus(newStatus);
    if (!isEditMode) {
      // Update immediately if not in edit mode
      await updateStatus(newStatus);
    }
  };

  const handleSave = async () => {
    if (localStatus !== status) {
      await updateStatus(localStatus);
    }
    onSaveEdit();
  };

  const handleCancel = () => {
    setLocalStatus(status); // Reset to original status
    onCancelEdit();
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
      <div>
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-2xl font-bold">
            Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
          </h1>
          
          {isEditMode ? (
            <Select value={localStatus} onValueChange={handleStatusChange}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_STATUSES.map((statusOption) => (
                  <SelectItem key={statusOption.value} value={statusOption.value}>
                    {statusOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          ) : (
            <Badge className={getStatusColor(status)}>
              {WORK_ORDER_STATUSES.find(s => s.value === status)?.label || status}
            </Badge>
          )}
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
            <Button 
              size="sm" 
              onClick={handleSave}
              disabled={isUpdating}
            >
              <Save className="h-4 w-4 mr-2" />
              Save
            </Button>
            <Button size="sm" variant="outline" onClick={handleCancel}>
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
