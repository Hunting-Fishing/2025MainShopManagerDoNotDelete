
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, MapPin, FileText, Calendar, DollarSign } from 'lucide-react';
import { WorkOrderNotes } from './WorkOrderNotes';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { UnifiedItemsTable } from '../shared/UnifiedItemsTable';
import { updateWorkOrder } from '@/services/workOrder';
import { WorkOrderStatus } from '@/utils/workOrders/constants';
import { toast } from '@/hooks/use-toast';

export interface WorkOrderDetailsTabProps {
  workOrder: WorkOrder;
  jobLines: WorkOrderJobLine[];
  allParts: WorkOrderPart[];
  timeEntries: TimeEntry[];
  customer: Customer | null;
  onJobLinesChange: (jobLines: WorkOrderJobLine[]) => void;
  onTimeEntriesChange: (timeEntries: TimeEntry[]) => void;
  onWorkOrderUpdate: (workOrder: WorkOrder) => void;
  isEditMode: boolean;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
}

export function WorkOrderDetailsTab({
  workOrder,
  jobLines,
  allParts,
  timeEntries,
  customer,
  onJobLinesChange,
  onTimeEntriesChange,
  onWorkOrderUpdate,
  isEditMode,
  onStartEdit,
  onCancelEdit,
  onSaveEdit
}: WorkOrderDetailsTabProps) {
  const handleStatusChange = async (newStatus: WorkOrderStatus) => {
    try {
      console.log('Updating work order status:', { workOrderId: workOrder.id, newStatus });
      
      // Cast the status to ensure type compatibility
      const updatedWorkOrder = await updateWorkOrder(workOrder.id, { 
        ...workOrder,
        status: newStatus as string // Cast to string for database compatibility
      });
      
      // Update local state with properly typed status
      const typedWorkOrder = {
        ...updatedWorkOrder,
        status: newStatus
      } as WorkOrder;
      
      onWorkOrderUpdate(typedWorkOrder);
      
      toast({
        title: "Success",
        description: "Work order status updated successfully",
      });
    } catch (error) {
      console.error('Error updating work order status:', error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive"
      });
    }
  };

  const handleNotesUpdate = async (notes: string) => {
    try {
      console.log('Updating work order notes:', { workOrderId: workOrder.id, notes });
      
      const updatedWorkOrder = await updateWorkOrder(workOrder.id, { 
        ...workOrder,
        notes 
      });
      
      onWorkOrderUpdate(updatedWorkOrder);
      
      toast({
        title: "Success",
        description: "Work order notes updated successfully",
      });
    } catch (error) {
      console.error('Error updating work order notes:', error);
      toast({
        title: "Error",
        description: "Failed to update work order notes",
        variant: "destructive"
      });
    }
  };

  const formatCurrency = (amount: number | undefined) => {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusColor = (status: string) => {
    const statusColors: Record<string, string> = {
      'pending': 'bg-yellow-100 text-yellow-800',
      'in-progress': 'bg-blue-100 text-blue-800',
      'completed': 'bg-green-100 text-green-800',
      'cancelled': 'bg-red-100 text-red-800',
      'on-hold': 'bg-gray-100 text-gray-800'
    };
    return statusColors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <div className="space-y-6">
      {/* Work Order Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Work Order Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="flex items-center gap-2">
              <Badge className={getStatusColor(workOrder.status)}>
                {workOrder.status}
              </Badge>
            </div>
            
            {workOrder.created_at && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Created: {formatDate(workOrder.created_at)}</span>
              </div>
            )}
            
            {workOrder.total_cost && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm">Total: {formatCurrency(workOrder.total_cost)}</span>
              </div>
            )}
          </div>

          {workOrder.description && (
            <div className="mt-4">
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">{workOrder.description}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Information */}
      {customer && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Customer Information
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium">{customer.first_name} {customer.last_name}</h4>
                <p className="text-sm text-muted-foreground">{customer.email}</p>
                <p className="text-sm text-muted-foreground">{customer.phone}</p>
              </div>
              <div className="flex items-start gap-2">
                <MapPin className="h-4 w-4 text-muted-foreground mt-1" />
                <div className="text-sm text-muted-foreground">
                  <p>{customer.address}</p>
                  {customer.city && customer.state && (
                    <p>{customer.city}, {customer.state} {customer.postal_code}</p>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Combined Items Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Services & Parts Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedItemsTable
            jobLines={jobLines}
            allParts={allParts}
            isEditMode={false}
            showType="labor"
          />
        </CardContent>
      </Card>

      {/* Job Lines Section */}
      <JobLinesSection
        workOrderId={workOrder.id}
        description={workOrder.description}
        jobLines={jobLines}
        onJobLinesChange={onJobLinesChange}
        isEditMode={isEditMode}
        shopId={workOrder.shop_id}
      />

      {/* Parts Section */}
      <WorkOrderPartsSection
        workOrderId={workOrder.id}
        isEditMode={isEditMode}
      />

      {/* Time Tracking */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>

      {/* Notes Section */}
      <Card>
        <CardHeader>
          <CardTitle>Notes</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderNotes
            workOrderId={workOrder.id}
            notes={workOrder.notes || ''}
            onUpdateNotes={handleNotesUpdate}
          />
        </CardContent>
      </Card>
    </div>
  );
}
