import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar, User, MapPin, Edit, MoreHorizontal } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { deleteWorkOrder } from '@/services/workOrder';
import { toast } from 'sonner';
interface WorkOrderDetailsHeaderProps {
  workOrder: WorkOrder;
}
export function WorkOrderDetailsHeader({
  workOrder
}: WorkOrderDetailsHeaderProps) {
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'default';
      case 'in-progress':
        return 'secondary';
      case 'on-hold':
        return 'outline';
      case 'cancelled':
        return 'destructive';
      default:
        return 'outline';
    }
  };
  const getPriorityColor = (priority?: string) => {
    if (!priority) return 'outline';
    switch (priority.toLowerCase()) {
      case 'urgent':
        return 'destructive';
      case 'high':
        return 'destructive';
      case 'medium':
        return 'secondary';
      case 'low':
        return 'outline';
      default:
        return 'outline';
    }
  };
  const handleDeleteWorkOrder = async () => {
    try {
      setIsDeleting(true);
      const success = await deleteWorkOrder(workOrder.id);
      if (success) {
        toast.success('Work order deleted successfully');
        navigate('/work-orders');
      } else {
        toast.error('Failed to delete work order');
      }
    } catch (error) {
      console.error('Error deleting work order:', error);
      toast.error('Failed to delete work order');
    } finally {
      setIsDeleting(false);
      setShowDeleteDialog(false);
    }
  };
  return <>
      <Card>
        <CardContent className="p-6">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <Badge variant={getStatusColor(workOrder.status)} className="text-sm">
                  {workOrder.status?.replace('-', ' ')}
                </Badge>
                {workOrder.priority && <Badge variant={getPriorityColor(workOrder.priority)} className="text-sm">
                    {workOrder.priority} Priority
                  </Badge>}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {workOrder.customer && <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Customer:</span>
                    <span>{workOrder.customer}</span>
                  </div>}

                {workOrder.technician && <div className="flex items-center gap-2 text-sm">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Technician:</span>
                    <span>{workOrder.technician}</span>
                  </div>}

                {workOrder.location && <div className="flex items-center gap-2 text-sm">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Location:</span>
                    <span>{workOrder.location}</span>
                  </div>}

                {workOrder.date && <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Created:</span>
                    <span>{new Date(workOrder.date).toLocaleDateString()}</span>
                  </div>}

                {workOrder.dueDate && <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">Due Date:</span>
                    <span>{new Date(workOrder.dueDate).toLocaleDateString()}</span>
                  </div>}
              </div>

              {workOrder.description && <div className="mt-4">
                  <h4 className="font-medium text-sm mb-2">Description</h4>
                  <p className="text-sm text-muted-foreground">{workOrder.description}</p>
                </div>}
            </div>

            <div className="flex items-center gap-2 ml-4">
              <Button variant="outline" size="sm" className="bg-[#08fd08] text-[#0b0b0b] font-bold text-lg">
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem>Print Work Order</DropdownMenuItem>
                  <DropdownMenuItem>Export as PDF</DropdownMenuItem>
                  <DropdownMenuItem>Send to Customer</DropdownMenuItem>
                  <DropdownMenuItem className="text-red-600" onClick={() => setShowDeleteDialog(true)}>
                    Delete Work Order
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Work Order</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this work order? This action cannot be undone.
              Work Order ID: #{workOrder.id.slice(0, 8)}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteWorkOrder} disabled={isDeleting} className="bg-red-600 hover:bg-red-700">
              {isDeleting ? 'Deleting...' : 'Delete Work Order'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>;
}