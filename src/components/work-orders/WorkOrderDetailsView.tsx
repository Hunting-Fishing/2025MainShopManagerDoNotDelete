
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getWorkOrderById } from '@/services/workOrder';
import { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useJobLines } from '@/hooks/useJobLines';
import { getWorkOrderJobLines } from '@/services/workOrder/jobLinesService';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { getWorkOrderTimeEntries } from '@/services/workOrder';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, AlertCircle } from 'lucide-react';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isEditMode?: boolean;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function WorkOrderDetailsView({
  workOrderId,
  isEditMode = false,
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const [notes, setNotes] = useState('');
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [jobLinesLoading, setJobLinesLoading] = useState(false);

  // For create mode, use a mock work order with pre-populated data
  const mockWorkOrder: WorkOrder = {
    id: 'new',
    status: 'pending',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    customer_name: prePopulatedData?.customerName || '',
    customer_email: prePopulatedData?.customerEmail || '',
    customer_phone: prePopulatedData?.customerPhone || '',
    customer_address: prePopulatedData?.customerAddress || '',
    vehicle_make: prePopulatedData?.vehicleMake || '',
    vehicle_model: prePopulatedData?.vehicleModel || '',
    vehicle_year: prePopulatedData?.vehicleYear || '',
    vehicle_license_plate: prePopulatedData?.vehicleLicensePlate || '',
    vehicle_vin: prePopulatedData?.vehicleVin || '',
    description: '',
    ...prePopulatedData
  };

  // Query for existing work order data (skip if in create mode)
  const { data: workOrder, isLoading, error } = useQuery({
    queryKey: ['workOrder', workOrderId],
    queryFn: () => getWorkOrderById(workOrderId),
    enabled: !isCreateMode && workOrderId !== 'new'
  });

  // Load related data for existing work orders
  useEffect(() => {
    if (isCreateMode || !workOrder?.id) return;

    const loadRelatedData = async () => {
      try {
        setJobLinesLoading(true);
        
        // Load job lines, parts, and time entries
        const [jobLinesData, partsData, timeEntriesData] = await Promise.all([
          getWorkOrderJobLines(workOrder.id),
          getWorkOrderParts(workOrder.id),
          getWorkOrderTimeEntries(workOrder.id)
        ]);

        setJobLines(jobLinesData || []);
        setParts(partsData || []);
        setTimeEntries(timeEntriesData || []);
      } catch (error) {
        console.error('Error loading related work order data:', error);
      } finally {
        setJobLinesLoading(false);
      }
    };

    loadRelatedData();
  }, [workOrder?.id, isCreateMode]);

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setTimeEntries(entries);
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  };

  const handlePartsChange = (updatedParts: WorkOrderPart[]) => {
    setParts(updatedParts);
  };

  // Use mock work order for create mode, otherwise use fetched data
  const currentWorkOrder = isCreateMode ? mockWorkOrder : workOrder;

  if (isLoading && !isCreateMode) {
    return (
      <ResponsiveContainer maxWidth="full" className="py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-lg">Loading work order details...</p>
          </div>
        </div>
      </ResponsiveContainer>
    );
  }

  if (error && !isCreateMode) {
    return (
      <ResponsiveContainer maxWidth="full" className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading work order: {error.message}
          </AlertDescription>
        </Alert>
      </ResponsiveContainer>
    );
  }

  if (!currentWorkOrder) {
    return (
      <ResponsiveContainer maxWidth="full" className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Work order not found
          </AlertDescription>
        </Alert>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer maxWidth="full" className="py-6">
      <Card>
        <CardContent className="p-6">
          <WorkOrderDetailsTabs
            workOrder={currentWorkOrder}
            timeEntries={timeEntries}
            onUpdateTimeEntries={handleUpdateTimeEntries}
            inventoryItems={inventoryItems}
            notes={notes}
            onUpdateNotes={setNotes}
            jobLines={jobLines}
            parts={parts}
            onJobLinesChange={handleJobLinesChange}
            onPartsChange={handlePartsChange}
            jobLinesLoading={jobLinesLoading}
            isEditMode={isEditMode}
            isCreateMode={isCreateMode}
            onCreateWorkOrder={onCreateWorkOrder}
          />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
}
