
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Check, Loader2 } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { updateWorkOrderStatus } from '@/services/workOrder';
import { toast } from '@/hooks/use-toast';

interface WorkOrderStatusUpdateProps {
  workOrder: WorkOrder;
  onStatusUpdated?: (newStatus: string) => void;
}

const statusOptions = [
  { value: 'pending', label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'in-progress', label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  { value: 'on-hold', label: 'On Hold', color: 'bg-orange-100 text-orange-800' },
  { value: 'completed', label: 'Completed', color: 'bg-green-100 text-green-800' },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-100 text-red-800' }
];

export function WorkOrderStatusUpdate({ workOrder, onStatusUpdated }: WorkOrderStatusUpdateProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(workOrder.status);

  const currentStatusOption = statusOptions.find(option => option.value === workOrder.status);
  
  const handleStatusChange = async (newStatus: string) => {
    if (newStatus === workOrder.status) return;
    
    setIsUpdating(true);
    try {
      console.log('Updating work order status:', workOrder.id, 'to:', newStatus);
      
      const updatedWorkOrder = await updateWorkOrderStatus(workOrder.id, newStatus);
      
      if (updatedWorkOrder) {
        toast({
          title: "Success",
          description: `Work order status updated to ${statusOptions.find(s => s.value === newStatus)?.label}`,
        });
        
        setSelectedStatus(newStatus);
        onStatusUpdated?.(newStatus);
      }
    } catch (error) {
      console.error('Error updating work order status:', error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive"
      });
      
      // Reset selection on error
      setSelectedStatus(workOrder.status);
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2">
        <span className="text-sm font-medium text-muted-foreground">Status:</span>
        <Badge className={currentStatusOption?.color}>
          {currentStatusOption?.label || workOrder.status}
        </Badge>
      </div>
      
      <Select
        value={selectedStatus}
        onValueChange={handleStatusChange}
        disabled={isUpdating}
      >
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Change status" />
          {isUpdating && <Loader2 className="h-4 w-4 animate-spin ml-2" />}
        </SelectTrigger>
        <SelectContent>
          {statusOptions.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              <div className="flex items-center gap-2">
                {option.value === workOrder.status && (
                  <Check className="h-4 w-4 text-green-600" />
                )}
                <span>{option.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
