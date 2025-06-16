
import React, { useState } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CalendarDays, Clock, User, MapPin, Phone, Mail, Car, Settings, FileText, Activity, Edit, Save, X } from 'lucide-react';
import { formatCurrency } from '@/lib/utils';
import { JobLinesSection } from '../form-fields/JobLinesSection';
import { WorkOrderPartsSection } from '../parts/WorkOrderPartsSection';
import { TimeTrackingSection } from '../time-tracking/TimeTrackingSection';
import { WorkOrderActivityHistory } from './WorkOrderActivityHistory';
import { WorkOrderDocuments } from './WorkOrderDocuments';
import { ConvertToInvoiceButton } from '../ConvertToInvoiceButton';
import { WorkOrderNotes } from './WorkOrderNotes';
import { updateWorkOrder } from '@/services/workOrder';
import { toast } from '@/hooks/use-toast';

interface WorkOrderDetailsTabProps {
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
  const [localWorkOrder, setLocalWorkOrder] = useState<WorkOrder>(workOrder);
  const [isSaving, setIsSaving] = useState(false);

  // Update local state when workOrder prop changes
  React.useEffect(() => {
    setLocalWorkOrder(workOrder);
  }, [workOrder]);

  const handleWorkOrderSave = async () => {
    try {
      setIsSaving(true);
      console.log('Saving work order changes:', localWorkOrder);
      
      const updatedWorkOrder = await updateWorkOrder(localWorkOrder.id, localWorkOrder);
      onWorkOrderUpdate(updatedWorkOrder);
      onSaveEdit();
      
      toast({
        title: "Success",
        description: "Work order updated successfully",
      });
    } catch (error) {
      console.error('Error saving work order:', error);
      toast({
        title: "Error",
        description: "Failed to save work order changes",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setLocalWorkOrder(workOrder); // Reset to original values
    onCancelEdit();
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-blue-100 text-blue-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const calculateTotals = () => {
    const laborTotal = jobLines.reduce((sum, line) => sum + (line.total_amount || 0), 0);
    const partsTotal = allParts.reduce((sum, part) => sum + (part.total_price || 0), 0);
    return { laborTotal, partsTotal, grandTotal: laborTotal + partsTotal };
  };

  const { laborTotal, partsTotal, grandTotal } = calculateTotals();

  return (
    <div className="space-y-6">
      {/* Header with Edit Controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold">Work Order #{workOrder.work_order_number}</h1>
          <Badge className={getStatusColor(workOrder.status)}>
            {workOrder.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          {!isEditMode ? (
            <>
              <Button variant="outline" onClick={onStartEdit}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
              <ConvertToInvoiceButton 
                workOrderId={workOrder.id}
                workOrderStatus={workOrder.status}
              />
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleWorkOrderSave} disabled={isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
            </>
          )}
        </div>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="labor">Labor</TabsTrigger>
          <TabsTrigger value="parts">Parts</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="activity">Activity</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Customer & Vehicle Info */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Customer Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {customer ? (
                  <>
                    <div className="flex justify-between">
                      <span className="font-medium">Name:</span>
                      <span>{customer.first_name} {customer.last_name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Email:</span>
                      <span className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        {customer.email}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Phone:</span>
                      <span className="flex items-center gap-2">
                        <Phone className="h-4 w-4" />
                        {customer.phone}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="font-medium">Address:</span>
                      <span className="flex items-center gap-2">
                        <MapPin className="h-4 w-4" />
                        {customer.street_address}, {customer.city}
                      </span>
                    </div>
                  </>
                ) : (
                  <p className="text-muted-foreground">No customer information available</p>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Car className="h-5 w-5" />
                  Vehicle Information
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="font-medium">Vehicle:</span>
                  <span>{workOrder.vehicle_year} {workOrder.vehicle_make} {workOrder.vehicle_model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">License Plate:</span>
                  <span>{workOrder.vehicle_license_plate || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">VIN:</span>
                  <span>{workOrder.vehicle_vin || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Odometer:</span>
                  <span>{workOrder.vehicle_odometer || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Work Order Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Work Order Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Description:</span>
                <span>{workOrder.description || 'No description provided'}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Created:</span>
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {new Date(workOrder.created_at || '').toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Estimated Hours:</span>
                <span className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  {workOrder.estimated_hours || 'N/A'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Financial Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Financial Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="font-medium">Labor Total:</span>
                <span>{formatCurrency(laborTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Parts Total:</span>
                <span>{formatCurrency(partsTotal)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold border-t pt-2">
                <span>Grand Total:</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Notes Section */}
          <WorkOrderNotes workOrder={localWorkOrder} />
        </TabsContent>

        <TabsContent value="labor">
          <JobLinesSection
            workOrderId={workOrder.id}
            jobLines={jobLines}
            onJobLinesChange={onJobLinesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="parts">
          <WorkOrderPartsSection
            workOrderId={workOrder.id}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="time">
          <TimeTrackingSection
            workOrderId={workOrder.id}
            timeEntries={timeEntries}
            onTimeEntriesChange={onTimeEntriesChange}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="activity">
          <div className="space-y-6">
            <WorkOrderActivityHistory workOrderId={workOrder.id} />
            <WorkOrderDocuments workOrderId={workOrder.id} />
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
