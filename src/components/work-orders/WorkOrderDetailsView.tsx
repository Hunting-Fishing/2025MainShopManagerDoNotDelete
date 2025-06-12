
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2 } from 'lucide-react';
import { WorkOrder, TimeEntry, WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderById } from '@/services/workOrder';
import { getJobLinesByWorkOrderId } from '@/services/workOrder/jobLinesService';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { WorkOrderDetailsHeader } from './details/WorkOrderDetailsHeader';
import { WorkOrderDetailsActions } from './details/WorkOrderDetailsActions';

interface WorkOrderDetailsViewProps {
  workOrderId: string;
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (data: any) => Promise<void>;
}

export function WorkOrderDetailsView({
  workOrderId,
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const navigate = useNavigate();
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [loading, setLoading] = useState(!isCreateMode);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [notes, setNotes] = useState('');
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [jobLinesLoading, setJobLinesLoading] = useState(false);

  useEffect(() => {
    if (isCreateMode) {
      // Create a new work order template for creation mode
      const newWorkOrder: WorkOrder = {
        id: 'new',
        status: 'pending',
        description: prePopulatedData.description || '',
        customer_name: prePopulatedData.customerName || '',
        customer_id: prePopulatedData.customerId || '',
        customer_email: prePopulatedData.customerEmail || '',
        customer_phone: prePopulatedData.customerPhone || '',
        customer_address: prePopulatedData.customerAddress || '',
        vehicle_make: prePopulatedData.vehicleMake || '',
        vehicle_model: prePopulatedData.vehicleModel || '',
        vehicle_year: prePopulatedData.vehicleYear || '',
        vehicle_license_plate: prePopulatedData.vehicleLicensePlate || '',
        vehicle_vin: prePopulatedData.vehicleVin || '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        priority: prePopulatedData.priority || 'medium',
        notes: prePopulatedData.notes || ''
      };
      setWorkOrder(newWorkOrder);
      setLoading(false);
    } else if (workOrderId && workOrderId !== 'new') {
      fetchWorkOrder(workOrderId);
    }
  }, [workOrderId, isCreateMode, prePopulatedData]);

  const fetchWorkOrder = async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const data = await getWorkOrderById(id);
      if (data) {
        setWorkOrder(data);
        setNotes(data.notes || '');
        
        // Fetch job lines
        setJobLinesLoading(true);
        try {
          const jobLinesData = await getJobLinesByWorkOrderId(id);
          setJobLines(jobLinesData || []);
        } catch (err) {
          console.error('Error fetching job lines:', err);
        } finally {
          setJobLinesLoading(false);
        }
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order:', err);
      setError('Failed to load work order details');
    } finally {
      setLoading(false);
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

  const handleEdit = () => {
    setIsEditMode(true);
  };

  const handleInvoiceCreated = (invoiceId: string) => {
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
    <div className="min-h-screen bg-background">
      {!isCreateMode && (
        <>
          <WorkOrderDetailsHeader 
            workOrder={workOrder}
            isEditMode={isEditMode}
            onToggleEditMode={() => setIsEditMode(!isEditMode)}
          />

          <div className="container mx-auto px-6 py-4">
            <WorkOrderDetailsActions
              workOrder={workOrder}
              onEdit={handleEdit}
              onInvoiceCreated={handleInvoiceCreated}
            />
          </div>
        </>
      )}

      <div className="container mx-auto px-6 pb-6">
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
