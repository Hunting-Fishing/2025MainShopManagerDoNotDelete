
import React from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { CheckSquare, ChevronDown, Loader2, ClipboardList, UserCheck, AlertCircle } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkOrder, WorkOrderStatusType } from '@/types/workOrder';
import { updateWorkOrder } from '@/utils/workOrders';
import { statusMap } from '@/utils/workOrders';

interface WorkOrderBatchActionsProps {
  selectedWorkOrders: WorkOrder[];
  setSelectedWorkOrders: (workOrders: WorkOrder[]) => void;
  allWorkOrders: WorkOrder[];
  setAllWorkOrders: (workOrders: WorkOrder[]) => void;
  isSelectAll: boolean;
  setIsSelectAll: (isSelectAll: boolean) => void;
  onBatchActionComplete: () => void;
}

export function WorkOrderBatchActions({
  selectedWorkOrders,
  setSelectedWorkOrders,
  allWorkOrders,
  setAllWorkOrders,
  isSelectAll,
  setIsSelectAll,
  onBatchActionComplete
}: WorkOrderBatchActionsProps) {
  const [isProcessing, setIsProcessing] = React.useState(false);

  const handleBatchStatusChange = async (status: WorkOrderStatusType) => {
    if (selectedWorkOrders.length === 0) {
      toast({
        title: "No work orders selected",
        description: "Please select at least one work order to update.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      
      // Create a copy of allWorkOrders to update the UI immediately
      const updatedAllWorkOrders = [...allWorkOrders];
      
      // Update each selected work order
      const promises = selectedWorkOrders.map(async (workOrder) => {
        const updatedWorkOrder = { ...workOrder, status: status as WorkOrderStatusType };
        
        // Update the work order in the database
        await updateWorkOrder(updatedWorkOrder);
        
        // Update the copy in our local state
        const index = updatedAllWorkOrders.findIndex(wo => wo.id === workOrder.id);
        if (index !== -1) {
          updatedAllWorkOrders[index] = { ...updatedAllWorkOrders[index], status };
        }
        
        return updatedWorkOrder;
      });
      
      // Wait for all updates to complete
      await Promise.all(promises);
      
      // Update the UI
      setAllWorkOrders(updatedAllWorkOrders);
      
      // Show success message
      toast({
        title: "Work orders updated",
        description: `${selectedWorkOrders.length} work order(s) have been updated to ${statusMap[status as keyof typeof statusMap]}.`,
        variant: "success"
      });
      
      // Clear selection
      setSelectedWorkOrders([]);
      setIsSelectAll(false);
      
      // Notify parent component
      onBatchActionComplete();
      
    } catch (error) {
      console.error('Error updating work orders:', error);
      toast({
        title: "Update failed",
        description: "There was an error updating the work orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSelectAll = () => {
    if (isSelectAll) {
      setSelectedWorkOrders([]);
    } else {
      setSelectedWorkOrders([...allWorkOrders]);
    }
    setIsSelectAll(!isSelectAll);
  };

  return (
    <div className={`flex items-center space-x-2 mb-4 ${selectedWorkOrders.length === 0 ? 'opacity-80' : ''}`}>
      <Button
        variant="outline"
        size="sm"
        onClick={handleSelectAll}
        className="border-dashed"
      >
        <CheckSquare className="h-4 w-4 mr-2" />
        {isSelectAll ? 'Deselect All' : 'Select All'}
      </Button>
      
      {selectedWorkOrders.length > 0 && (
        <div className="rounded-md bg-indigo-50 px-3 py-1 text-sm font-medium text-indigo-700 flex items-center">
          <ClipboardList className="h-4 w-4 mr-1" /> 
          {selectedWorkOrders.length} selected
        </div>
      )}
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="default" 
            size="sm" 
            disabled={selectedWorkOrders.length === 0 || isProcessing}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            {isProcessing ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <UserCheck className="h-4 w-4 mr-2" />
            )}
            Batch Actions
            <ChevronDown className="h-4 w-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Change Status To</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem 
            onClick={() => handleBatchStatusChange("pending")}
            disabled={isProcessing}
          >
            <div className="h-2 w-2 rounded-full bg-yellow-400 mr-2" />
            Pending
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleBatchStatusChange("in-progress")}
            disabled={isProcessing}
          >
            <div className="h-2 w-2 rounded-full bg-blue-500 mr-2" />
            In Progress
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleBatchStatusChange("completed")}
            disabled={isProcessing}
          >
            <div className="h-2 w-2 rounded-full bg-green-500 mr-2" />
            Completed
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleBatchStatusChange("cancelled")}
            disabled={isProcessing}
          >
            <div className="h-2 w-2 rounded-full bg-red-500 mr-2" />
            Cancelled
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>Assign To</DropdownMenuLabel>
          <DropdownMenuItem disabled={true}>
            <AlertCircle className="h-4 w-4 mr-2 text-muted-foreground" />
            Coming soon...
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
