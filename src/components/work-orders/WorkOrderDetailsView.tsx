
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderInventoryItems } from '@/services/workOrder/workOrderInventoryService';
import { getWorkOrderTimeEntries } from '@/services/workOrder/workOrderQueryService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { toast } from '@/hooks/use-toast';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
}

export function WorkOrderDetailsView({ workOrderId: propWorkOrderId }: WorkOrderDetailsViewProps) {
  const { id: paramWorkOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrderId = propWorkOrderId || paramWorkOrderId;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (workOrderId) {
      fetchWorkOrderData(workOrderId);
    }
  }, [workOrderId]);

  const fetchWorkOrderData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);

      const [workOrderData, jobLinesData, inventoryData, timeData, partsData] = await Promise.all([
        getWorkOrderById(id),
        getWorkOrderJobLines(id),
        getWorkOrderInventoryItems(id),
        getWorkOrderTimeEntries(id),
        getWorkOrderParts(id)
      ]);

      if (!workOrderData) {
        setError('Work order not found');
        return;
      }

      setWorkOrder(workOrderData);
      setJobLines(jobLinesData);
      
      // Transform inventory data to include total property
      const transformedInventory = inventoryData.map(item => ({
        ...item,
        total: item.quantity * item.unit_price
      }));
      setInventoryItems(transformedInventory);
      
      setTimeEntries(timeData);
      setParts(partsData);
      setNotes(workOrderData.notes || '');
      
      console.log('Work order data loaded successfully');
    } catch (err) {
      console.error('Error fetching work order data:', err);
      setError('Failed to load work order details');
      toast({
        title: "Error",
        description: "Failed to load work order details",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = () => {
    if (workOrderId) {
      navigate(`/work-orders/${workOrderId}/edit`);
    }
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    toast({
      title: "Success",
      description: "Invoice created successfully",
    });
    // Optionally navigate to invoice details
    // navigate(`/invoices/${invoiceId}`);
  };

  if (!workOrderId) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            No work order ID provided
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
            <p className="text-lg font-medium">Loading work order details...</p>
            <p className="text-sm text-muted-foreground">Please wait while we fetch the information</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div id="work-order-details-content" className="container mx-auto p-6 space-y-6 max-w-7xl">
      <WorkOrderDetailsHeader 
        workOrder={workOrder}
        onEdit={handleEdit}
        onInvoiceCreated={handleInvoiceCreated}
        isEditMode={isEditMode}
      />

      <WorkOrderDetailsTabs
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={setTimeEntries}
        inventoryItems={inventoryItems}
        notes={notes}
        onUpdateNotes={setNotes}
        jobLines={jobLines}
        parts={parts}
        onJobLinesChange={setJobLines}
        jobLinesLoading={loading}
        isEditMode={isEditMode}
      />
    </div>
  );
}
