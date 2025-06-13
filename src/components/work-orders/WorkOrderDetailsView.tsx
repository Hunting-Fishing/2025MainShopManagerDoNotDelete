
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { getWorkOrderById } from '@/services/workOrder';
import { useWorkOrderJobLines } from '@/hooks/useWorkOrderJobLines';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { WorkOrderComprehensiveOverview } from './details/WorkOrderComprehensiveOverview';
import { WorkOrderTabs } from './WorkOrderTabs';
import { CreateWorkOrderTab } from './details/CreateWorkOrderTab';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useForm } from 'react-hook-form';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';

export interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: {
    customerId?: string;
    customerName?: string;
    customerEmail?: string;
    customerPhone?: string;
    customerAddress?: string;
    title?: string;
    description?: string;
    priority?: string;
    equipmentName?: string;
    equipmentType?: string;
    vehicleMake?: string;
    vehicleModel?: string;
    vehicleYear?: string;
    vehicleLicensePlate?: string;
    vehicleVin?: string;
    [key: string]: any;
  };
  onCreateWorkOrder?: (values: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId: propWorkOrderId,
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { id: paramWorkOrderId } = useParams<{ id: string }>();
  const workOrderId = propWorkOrderId || paramWorkOrderId;
  
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(!isCreateMode);
  const [error, setError] = useState<Error | null>(null);

  const { jobLines, isLoading: jobLinesLoading, updateJobLines } = useWorkOrderJobLines(workOrderId || '');
  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();

  // Form for create mode
  const form = useForm<WorkOrderFormSchemaValues>({
    defaultValues: {
      customer: prePopulatedData?.customerName || '',
      description: prePopulatedData?.description || '',
      status: 'pending' as const,
      priority: (prePopulatedData?.priority as any) || 'medium' as const,
      technician: '',
      location: '',
      dueDate: '',
      notes: '',
      vehicleMake: prePopulatedData?.vehicleMake || '',
      vehicleModel: prePopulatedData?.vehicleModel || '',
      vehicleYear: prePopulatedData?.vehicleYear || '',
      odometer: '',
      licensePlate: prePopulatedData?.vehicleLicensePlate || '',
      vin: prePopulatedData?.vehicleVin || '',
      inventoryItems: []
    }
  });

  useEffect(() => {
    if (!isCreateMode && workOrderId && workOrderId !== 'new') {
      fetchWorkOrderData(workOrderId);
    }
  }, [workOrderId, isCreateMode]);

  const fetchWorkOrderData = async (id: string) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Fetch work order details
      const workOrderData = await getWorkOrderById(id);
      if (workOrderData) {
        setWorkOrder(workOrderData);
        
        // Fetch parts data
        try {
          const partsData = await getWorkOrderParts(id);
          setAllParts(partsData);
        } catch (partsError) {
          console.error('Error fetching parts:', partsError);
          setAllParts([]);
        }

        // TODO: Fetch time entries data
        setTimeEntries(workOrderData.timeEntries || []);
      } else {
        setError(new Error('Work order not found'));
      }
    } catch (err) {
      console.error('Error fetching work order data:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle create mode
  if (isCreateMode) {
    return (
      <CreateWorkOrderTab
        form={form}
        technicians={technicians}
        technicianLoading={technicianLoading}
        technicianError={technicianError?.message || null}
        jobLines={jobLines}
        onJobLinesChange={updateJobLines}
        workOrderId={workOrderId}
        prePopulatedCustomer={prePopulatedData}
        onCreateWorkOrder={onCreateWorkOrder}
        isEditMode={false}
      />
    );
  }

  // Handle loading state
  if (isLoading) {
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

  // Handle error state
  if (error || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            {error?.message || 'Work order not found'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Comprehensive Overview */}
      <WorkOrderComprehensiveOverview 
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
      />

      {/* Tab-based Interface */}
      <WorkOrderTabs
        workOrder={workOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={setTimeEntries}
        isEditMode={false}
      />
    </div>
  );
}
