
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkOrder, TimeEntry } from "@/types/workOrder";
import { findWorkOrderById, deleteWorkOrder } from "@/utils/workOrders";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { WorkOrderDetailsTabs } from "@/components/workOrders/WorkOrderDetailsTabs";
import { WorkOrderCalendarButton } from "@/components/workOrders/calendar/WorkOrderCalendarButton";
import { toast } from "@/hooks/use-toast";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';

export default function WorkOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  
  const currentUser = {
    id: "current-user",
    name: "Current User"
  };

  useEffect(() => {
    const loadWorkOrder = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const data = await findWorkOrderById(id);
        if (data) {
          setWorkOrder(data);
        } else {
          toast({
            title: "Not Found",
            description: "Work order not found",
            variant: "destructive"
          });
          navigate('/work-orders');
        }
      } catch (error) {
        console.error("Error loading work order:", error);
        toast({
          title: "Error",
          description: "Failed to load work order details",
          variant: "destructive"
        });
      } finally {
        setLoading(false);
      }
    };
    
    loadWorkOrder();
  }, [id, navigate]);

  const handleUpdateTimeEntries = (timeEntries: TimeEntry[]) => {
    if (workOrder) {
      setWorkOrder({
        ...workOrder,
        timeEntries
      });
    }
  };

  const handleStatusUpdate = (updatedWorkOrder: WorkOrder) => {
    setWorkOrder(updatedWorkOrder);
  };

  const handleDelete = async () => {
    if (!id) return;
    
    setLoading(true);
    try {
      const success = await deleteWorkOrder(id);
      
      if (success) {
        toast({
          title: "Deleted",
          description: "Work order has been deleted",
        });
        navigate('/work-orders');
      }
    } catch (error) {
      console.error("Error deleting work order:", error);
      toast({
        title: "Error",
        description: "Failed to delete work order",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
      setShowDeleteDialog(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 flex items-center justify-center h-[50vh]">
        <div className="flex flex-col items-center">
          <Loader2 className="h-10 w-10 animate-spin text-indigo-600 mb-4" />
          <p className="text-slate-500">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (!workOrder) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Work Order Not Found</h2>
          <p className="text-slate-500 mb-4">
            The requested work order could not be found or may have been deleted.
          </p>
          <Button onClick={() => navigate('/work-orders')} className="mt-2">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Work Orders
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back
            </Button>
          </div>
          <h1 className="text-2xl font-bold">Work Order: {workOrder.id.substring(0, 8)}</h1>
          <p className="text-slate-500">{workOrder.description}</p>
        </div>

        <div className="flex gap-2">
          <WorkOrderCalendarButton workOrder={workOrder} />
          
          <Button
            variant="outline"
            onClick={() => navigate(`/work-orders/${workOrder.id}/edit`)}
          >
            Edit Work Order
          </Button>
          <Button
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
          >
            Delete
          </Button>
        </div>
      </div>

      <WorkOrderDetailsTabs 
        workOrder={workOrder}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        userId={currentUser.id}
        userName={currentUser.name}
        onStatusUpdate={handleStatusUpdate}
      />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
