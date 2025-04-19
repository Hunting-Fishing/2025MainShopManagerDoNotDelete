
import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { 
  CheckSquare, 
  ChevronDown, 
  Loader2, 
  ClipboardList, 
  UserCheck, 
  Trash2, 
  FileText, 
  FileSpreadsheet,
  Calendar 
} from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { WorkOrder, WorkOrderStatusType } from '@/types/workOrder';
import { updateWorkOrder, deleteWorkOrder } from '@/utils/workOrders';
import { statusMap } from '@/utils/workOrders';
import { exportToCSV } from '@/utils/export';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  const [isProcessing, setIsProcessing] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);

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
        variant: "default"
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

  const handleBatchDelete = async () => {
    if (selectedWorkOrders.length === 0) return;

    try {
      setIsProcessing(true);
      
      const promises = selectedWorkOrders.map(workOrder => deleteWorkOrder(workOrder.id));
      await Promise.all(promises);
      
      // Remove deleted work orders from the list
      const remainingWorkOrders = allWorkOrders.filter(
        wo => !selectedWorkOrders.some(selected => selected.id === wo.id)
      );
      
      setAllWorkOrders(remainingWorkOrders);
      setSelectedWorkOrders([]);
      setIsSelectAll(false);
      
      toast({
        title: "Work orders deleted",
        description: `${selectedWorkOrders.length} work order(s) have been deleted successfully.`,
        variant: "default"
      });
      
      onBatchActionComplete();
      setShowDeleteAlert(false);
    } catch (error) {
      console.error('Error deleting work orders:', error);
      toast({
        title: "Delete failed",
        description: "There was an error deleting the work orders. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleExportCSV = () => {
    if (selectedWorkOrders.length === 0) {
      toast({
        title: "No work orders selected",
        description: "Please select at least one work order to export.",
        variant: "destructive"
      });
      return;
    }

    try {
      // Prepare data for export
      const exportData = selectedWorkOrders.map(order => ({
        id: order.id,
        customer: order.customer,
        description: order.description || '',
        status: order.status,
        priority: order.priority,
        date: order.date,
        dueDate: order.dueDate,
        technician: order.technician,
        location: order.location || '',
        totalBillableTime: order.totalBillableTime || 0
      }));

      // Export to CSV
      exportToCSV(exportData, 'Selected_Work_Orders');

      toast({
        title: "Export successful",
        description: `${selectedWorkOrders.length} work order(s) have been exported to CSV.`,
      });
    } catch (error) {
      console.error('Error exporting work orders:', error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the work orders. Please try again.",
        variant: "destructive"
      });
    }
  };

  return (
    <>
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
          <DropdownMenuContent align="end" className="w-56">
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
            
            <DropdownMenuLabel>Export</DropdownMenuLabel>
            <DropdownMenuItem onClick={handleExportCSV} disabled={isProcessing}>
              <FileText className="h-4 w-4 mr-2 text-blue-600" />
              Export to CSV
            </DropdownMenuItem>
            
            <DropdownMenuSeparator />
            <DropdownMenuItem 
              onClick={() => setShowDeleteAlert(true)}
              disabled={isProcessing}
              className="text-red-600 focus:text-red-600"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Selected
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Orders</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedWorkOrders.length} selected work order{selectedWorkOrders.length !== 1 && 's'}? 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleBatchDelete}
              className="bg-red-600 hover:bg-red-700"
            >
              {isProcessing ? 
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : 
                <Trash2 className="h-4 w-4 mr-2" />
              }
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
