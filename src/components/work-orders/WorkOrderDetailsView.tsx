
import React, { useState, useEffect } from 'react';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useJobLines } from '@/hooks/useJobLines';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  isEditMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function WorkOrderDetailsView({
  workOrderId,
  isCreateMode = false,
  isEditMode: initialEditMode = false,
  prePopulatedData,
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const [isEditMode, setIsEditMode] = useState(initialEditMode);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [jobLinesLoading, setJobLinesLoading] = useState(false);

  // Create a mock work order for create mode
  const mockWorkOrder: WorkOrder = {
    id: 'new',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    description: '',
    customer_name: prePopulatedData?.customerName || '',
    customer_email: prePopulatedData?.customerEmail || '',
    customer_phone: prePopulatedData?.customerPhone || '',
    customer_address: prePopulatedData?.customerAddress || '',
    vehicle_make: prePopulatedData?.vehicleMake || '',
    vehicle_model: prePopulatedData?.vehicleModel || '',
    vehicle_year: prePopulatedData?.vehicleYear || '',
    vehicle_license_plate: prePopulatedData?.vehicleLicensePlate || '',
    vehicle_vin: prePopulatedData?.vehicleVin || '',
    ...prePopulatedData
  };

  // Use the hook only for existing work orders
  const { workOrder: fetchedWorkOrder, isLoading, error } = useWorkOrder(
    isCreateMode ? '' : workOrderId
  );

  const workOrder = isCreateMode ? mockWorkOrder : fetchedWorkOrder;

  useEffect(() => {
    if (workOrder && !isCreateMode) {
      loadWorkOrderData();
    }
  }, [workOrder, isCreateMode]);

  const loadWorkOrderData = async () => {
    if (!workOrder?.id || isCreateMode) return;

    try {
      setJobLinesLoading(true);
      
      // Load job lines
      const jobLinesData = await getWorkOrderJobLines(workOrder.id);
      setJobLines(jobLinesData);

      // Load parts
      const partsData = await getWorkOrderParts(workOrder.id);
      setParts(partsData);

      // Load time entries
      const timeEntriesData = await getWorkOrderTimeEntries(workOrder.id);
      setTimeEntries(timeEntriesData);

      // Set notes from work order
      setNotes(workOrder.notes || '');
    } catch (error) {
      console.error('Error loading work order data:', error);
    } finally {
      setJobLinesLoading(false);
    }
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

  const handlePartsChange = (newParts: WorkOrderPart[]) => {
    setParts(newParts);
  };

  const handleToggleEditMode = () => {
    setIsEditMode(!isEditMode);
  };

  if (isLoading && !isCreateMode) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error && !isCreateMode) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-destructive">Error loading work order: {error.message}</p>
            <Button 
              onClick={() => window.location.reload()} 
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!workOrder) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-muted-foreground">Work order not found</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {!isCreateMode && (
        <WorkOrderDetailsHeader 
          workOrder={workOrder}
          isEditMode={isEditMode}
        />
      )}

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
  );
}
