
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { getWorkOrderById } from '@/services/workOrder';
import { getWorkOrderJobLines } from '@/services/workOrder/workOrderJobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId: propWorkOrderId, 
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder 
}: WorkOrderDetailsViewProps) {
  const { id: paramWorkOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const workOrderId = propWorkOrderId || paramWorkOrderId;
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [jobLinesLoading, setJobLinesLoading] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      // Initialize new work order with pre-populated data
      const newWorkOrder: WorkOrder = {
        id: 'new',
        status: 'pending',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        customer_id: prePopulatedData?.customerId,
        customer_name: prePopulatedData?.customerName,
        customer_email: prePopulatedData?.customerEmail,
        customer_phone: prePopulatedData?.customerPhone,
        customer_address: prePopulatedData?.customerAddress,
        vehicle_make: prePopulatedData?.vehicleMake,
        vehicle_model: prePopulatedData?.vehicleModel,
        vehicle_year: prePopulatedData?.vehicleYear,
        vehicle_license_plate: prePopulatedData?.vehicleLicensePlate,
        vehicle_vin: prePopulatedData?.vehicleVin,
        description: '',
        priority: 'medium',
        technician_id: '',
        location: '',
        notes: '',
        timeEntries: [],
        inventoryItems: [],
        jobLines: []
      };
      setWorkOrder(newWorkOrder);
      setLoading(false);
      return;
    }

    if (workOrderId && workOrderId !== 'new') {
      fetchWorkOrderData(workOrderId);
    }
  }, [workOrderId, isCreateMode, prePopulatedData]);

  const fetchWorkOrderData = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const [workOrderData, jobLinesData, partsData] = await Promise.all([
        getWorkOrderById(id),
        getWorkOrderJobLines(id),
        getWorkOrderParts(id)
      ]);

      if (workOrderData) {
        setWorkOrder(workOrderData);
        setTimeEntries(workOrderData.timeEntries || []);
        setInventoryItems(workOrderData.inventoryItems || []);
        setNotes(workOrderData.notes || '');
      }

      setJobLines(jobLinesData || []);
      setParts(partsData || []);
    } catch (err) {
      console.error('Error fetching work order data:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
    }
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const handlePartsChange = (updatedParts: WorkOrderPart[]) => {
    setParts(updatedParts);
  };

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };

  const handleUpdateNotes = (updatedNotes: string) => {
    setNotes(updatedNotes);
  };

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
    toast({
      title: 'Success',
      description: 'Invoice created successfully',
    });
    navigate(`/invoices/${invoiceId}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order details...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || (!workOrder && !isCreateMode)) {
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

  if (!workOrder) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      {!isCreateMode && (
        <WorkOrderDetailsHeader 
          workOrder={workOrder}
          onEdit={handleEdit}
          onInvoiceCreated={handleInvoiceCreated}
          isEditMode={isEditMode}
        />
      )}

      <div className="container mx-auto px-6 py-6">
        <WorkOrderDetailsTabs
          workOrder={workOrder}
          timeEntries={timeEntries}
          onUpdateTimeEntries={handleUpdateTimeEntries}
          inventoryItems={inventoryItems}
          notes={notes}
          onUpdateNotes={handleUpdateNotes}
          jobLines={jobLines}
          parts={parts}
          onJobLinesChange={handleJobLinesChange}
          onPartsChange={handlePartsChange}
          jobLinesLoading={jobLinesLoading}
          isEditMode={isEditMode}
          isCreateMode={isCreateMode}
          onCreateWorkOrder={onCreateWorkOrder}
        />
      </div>
    </div>
  );
}
