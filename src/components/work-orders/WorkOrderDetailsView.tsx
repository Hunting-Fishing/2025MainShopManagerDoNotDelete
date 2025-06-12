
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useToast } from '@/hooks/use-toast';

interface PrePopulatedData {
  customerId?: string;
  customerName?: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerCity?: string;
  customerState?: string;
  customerZip?: string;
  vehicleId?: string;
  vehicleMake?: string;
  vehicleModel?: string;
  vehicleYear?: string;
  vehicleLicensePlate?: string;
  vehicleVin?: string;
}

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: PrePopulatedData;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function WorkOrderDetailsView({ 
  workOrderId, 
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);

  // For create mode, use a mock work order structure
  const mockWorkOrder: WorkOrder = {
    id: 'new',
    status: 'pending',
    description: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: prePopulatedData.customerName || '',
    customer_email: prePopulatedData.customerEmail || '',
    customer_phone: prePopulatedData.customerPhone || '',
    customer_address: prePopulatedData.customerAddress || '',
    vehicle_make: prePopulatedData.vehicleMake || '',
    vehicle_model: prePopulatedData.vehicleModel || '',
    vehicle_year: prePopulatedData.vehicleYear || '',
    vehicle_vin: prePopulatedData.vehicleVin || '',
    vehicle_license_plate: prePopulatedData.vehicleLicensePlate || '',
  };

  // Query for existing work order (skip if in create mode)
  const { 
    data: workOrder, 
    isLoading, 
    error,
    refetch 
  } = useQuery({
    queryKey: ['work-order', workOrderId],
    queryFn: () => getWorkOrderById(workOrderId),
    enabled: !isCreateMode && workOrderId !== 'new',
    retry: 1,
  });

  const currentWorkOrder = isCreateMode ? mockWorkOrder : workOrder;

  useEffect(() => {
    if (workOrder) {
      // Initialize state with work order data
      setTimeEntries(workOrder.timeEntries || []);
      setInventoryItems(workOrder.inventoryItems || workOrder.inventory_items || []);
      setNotes(workOrder.notes || '');
      setJobLines(workOrder.jobLines || []);
    }
  }, [workOrder]);

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
    toast({
      title: "Time entries updated",
      description: "Time tracking information has been saved.",
    });
  };

  const handleUpdateNotes = (newNotes: string) => {
    setNotes(newNotes);
    toast({
      title: "Notes updated",
      description: "Work order notes have been saved.",
    });
  };

  const handleJobLinesChange = (newJobLines: WorkOrderJobLine[]) => {
    setJobLines(newJobLines);
    console.log('Job lines updated:', newJobLines);
  };

  const handlePartsChange = (newParts: WorkOrderPart[]) => {
    setParts(newParts);
    console.log('Parts updated:', newParts);
  };

  // Loading state for existing work orders
  if (!isCreateMode && isLoading) {
    return (
      <div className="container mx-auto p-6">
        <Card>
          <CardContent className="p-8">
            <div className="flex items-center justify-center">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
                <p className="text-lg">Loading work order details...</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state for existing work orders
  if (!isCreateMode && error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading work order: {error instanceof Error ? error.message : 'Unknown error'}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  // Missing work order
  if (!isCreateMode && !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Work order not found
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!currentWorkOrder) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Unable to load work order data
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <WorkOrderDetailsTabs
        workOrder={currentWorkOrder}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        inventoryItems={inventoryItems}
        notes={notes}
        onUpdateNotes={handleUpdateNotes}
        jobLines={jobLines}
        parts={parts}
        onJobLinesChange={handleJobLinesChange}
        onPartsChange={handlePartsChange}
        jobLinesLoading={false}
        isEditMode={!isCreateMode}
        isCreateMode={isCreateMode}
        onCreateWorkOrder={onCreateWorkOrder}
        prePopulatedData={prePopulatedData}
      />
    </div>
  );
}
