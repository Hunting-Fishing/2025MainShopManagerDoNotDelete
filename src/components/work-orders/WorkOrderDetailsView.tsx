
import React, { useState, useEffect } from 'react';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Loader2, AlertCircle } from 'lucide-react';
import { WorkOrderDetailsActions } from './details/WorkOrderDetailsActions';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderQueryService';
import { getWorkOrderInventoryItems } from '@/services/workOrder/workOrderQueryService';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { toast } from '@/hooks/use-toast';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
}

export function WorkOrderDetailsView({ workOrderId }: WorkOrderDetailsViewProps) {
  const { workOrder, isLoading, error } = useWorkOrder(workOrderId);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [notes, setNotes] = useState('');
  const [jobLinesLoading, setJobLinesLoading] = useState(false);
  const [dataLoading, setDataLoading] = useState(true);

  // Load additional work order data
  useEffect(() => {
    if (workOrder?.id) {
      loadWorkOrderData();
      setNotes(workOrder.notes || workOrder.description || '');
    }
  }, [workOrder?.id]);

  const loadWorkOrderData = async () => {
    if (!workOrder?.id) return;

    try {
      setDataLoading(true);
      setJobLinesLoading(true);

      // Load time entries
      try {
        const timeData = await getWorkOrderTimeEntries(workOrder.id);
        setTimeEntries(timeData || []);
      } catch (err) {
        console.error('Error loading time entries:', err);
      }

      // Load inventory items
      try {
        const inventoryData = await getWorkOrderInventoryItems(workOrder.id);
        setInventoryItems(inventoryData || []);
      } catch (err) {
        console.error('Error loading inventory items:', err);
      }

      // Load job lines
      try {
        const jobLinesData = await getWorkOrderJobLines(workOrder.id);
        setJobLines(jobLinesData || []);
      } catch (err) {
        console.error('Error loading job lines:', err);
      }

    } catch (err) {
      console.error('Error loading work order data:', err);
      toast({
        title: "Error",
        description: "Failed to load work order details",
        variant: "destructive"
      });
    } finally {
      setDataLoading(false);
      setJobLinesLoading(false);
    }
  };

  const handleEdit = () => {
    console.log('Edit work order:', workOrderId);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    console.log('Invoice created:', invoiceId);
    toast({
      title: "Success",
      description: "Invoice created successfully"
    });
  };

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };

  const handleUpdateNotes = (newNotes: string) => {
    setNotes(newNotes);
  };

  const handleJobLinesChange = (newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
  };

  if (isLoading || dataLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading work order details...</p>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          {error?.message || 'Work order not found'}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">
            Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
          </h1>
          <div className="flex items-center gap-2 mt-2">
            <Badge variant="secondary">{workOrder.status}</Badge>
            {workOrder.service_type && (
              <Badge variant="outline">{workOrder.service_type}</Badge>
            )}
          </div>
        </div>
        
        <WorkOrderDetailsActions
          workOrder={workOrder}
          onEdit={handleEdit}
          onInvoiceCreated={handleInvoiceCreated}
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Work Order Details */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Work Order Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-muted-foreground">Description</label>
                <p className="mt-1">{workOrder.description || 'No description provided'}</p>
              </div>
              
              {workOrder.total_cost && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Total Cost</label>
                  <p className="mt-1 text-lg font-semibold">${workOrder.total_cost}</p>
                </div>
              )}
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Created</label>
                  <p className="mt-1">{new Date(workOrder.created_at).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Updated</label>
                  <p className="mt-1">{new Date(workOrder.updated_at).toLocaleDateString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Customer Info */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.customer_name ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Name</label>
                    <p className="mt-1">{workOrder.customer_name}</p>
                  </div>
                  {workOrder.customer_email && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Email</label>
                      <p className="mt-1">{workOrder.customer_email}</p>
                    </div>
                  )}
                  {workOrder.customer_phone && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">Phone</label>
                      <p className="mt-1">{workOrder.customer_phone}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {workOrder.customer_id ? 'Loading customer details...' : 'No customer assigned'}
                </p>
              )}
            </CardContent>
          </Card>

          {/* Vehicle Info */}
          <Card>
            <CardHeader>
              <CardTitle>Vehicle Information</CardTitle>
            </CardHeader>
            <CardContent>
              {workOrder.vehicle_make || workOrder.vehicle_model || workOrder.vehicle_year ? (
                <div className="space-y-2">
                  <div>
                    <label className="text-sm font-medium text-muted-foreground">Vehicle</label>
                    <p className="mt-1">
                      {[workOrder.vehicle_year, workOrder.vehicle_make, workOrder.vehicle_model]
                        .filter(Boolean)
                        .join(' ')}
                    </p>
                  </div>
                  {workOrder.vehicle_vin && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">VIN</label>
                      <p className="mt-1">{workOrder.vehicle_vin}</p>
                    </div>
                  )}
                  {workOrder.vehicle_license_plate && (
                    <div>
                      <label className="text-sm font-medium text-muted-foreground">License Plate</label>
                      <p className="mt-1">{workOrder.vehicle_license_plate}</p>
                    </div>
                  )}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  {workOrder.vehicle_id ? 'Loading vehicle details...' : 'No vehicle assigned'}
                </p>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Detailed Tabs */}
      <WorkOrderDetailsTabs
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        inventoryItems={inventoryItems}
        notes={notes}
        onUpdateNotes={handleUpdateNotes}
        jobLines={jobLines}
        onJobLinesChange={handleJobLinesChange}
        jobLinesLoading={jobLinesLoading}
        isEditMode={false}
      />
    </div>
  );
}
