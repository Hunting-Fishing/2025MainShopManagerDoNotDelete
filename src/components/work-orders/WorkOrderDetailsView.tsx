import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { Customer } from '@/types/customer';
import { useToast } from '@/hooks/use-toast';
import {
  getWorkOrderById,
  updateWorkOrder,
  getWorkOrderJobLines,
  getWorkOrderTimeEntries,
  createWorkOrder,
} from '@/services/workOrder';
import { getCustomerById } from '@/services/customer';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';

interface WorkOrderDetailsViewProps {
  isCreateMode?: boolean;
  prePopulatedData?: any;
  onCreateWorkOrder?: (workOrderData: any) => Promise<void>;
}

export const WorkOrderDetailsView: React.FC<WorkOrderDetailsViewProps> = ({
  isCreateMode = false,
  prePopulatedData,
  onCreateWorkOrder,
}) => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [workOrder, setWorkOrder] = useState<WorkOrder>({} as WorkOrder);
  const [jobLines, setJobLines] = useState<WorkOrderJobLine[]>([]);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(isCreateMode);

  const workOrderId = id as string;
  const shouldLoadData = !isCreateMode && workOrderId;

  useEffect(() => {
    if (isCreateMode && prePopulatedData) {
      // Set initial values for create mode
      setWorkOrder({
        ...workOrder,
        customer_name: prePopulatedData.customerName,
        customer_email: prePopulatedData.customerEmail,
        customer_phone: prePopulatedData.customerPhone,
        vehicle_make: prePopulatedData.vehicleMake,
        vehicle_model: prePopulatedData.vehicleModel,
        vehicle_year: prePopulatedData.vehicleYear,
        vehicle_license_plate: prePopulatedData.vehicleLicensePlate,
        vehicle_vin: prePopulatedData.vehicleVin,
      });
    }
  }, [isCreateMode, prePopulatedData]);

  useEffect(() => {
    if (shouldLoadData) {
      const fetchData = async () => {
        setIsLoading(true);
        setError(null);
        try {
          // Fetch work order details
          const workOrderData = await getWorkOrderById(workOrderId);
          setWorkOrder(workOrderData);

          // Fetch customer details
          if (workOrderData.customer_id) {
            const customerData = await getCustomerById(workOrderData.customer_id);
            setCustomer(customerData);
          }

          // Fetch job lines
          const jobLinesData = await getWorkOrderJobLines(workOrderId);
          setJobLines(jobLinesData);

          // Fetch time entries
          const timeEntriesData = await getWorkOrderTimeEntries(workOrderId);
          setTimeEntries(timeEntriesData);
        } catch (err: any) {
          setError(err.message || 'Failed to load work order details.');
          console.error('Error fetching work order details:', err);
        } finally {
          setIsLoading(false);
        }
      };

      fetchData();
    }
  }, [shouldLoadData, workOrderId]);

  const handleSaveWorkOrder = async (workOrderData: any) => {
    setIsLoading(true);
    setError(null);

    try {
      if (isCreateMode) {
        if (onCreateWorkOrder) {
          await onCreateWorkOrder(workOrderData);
        } else {
          // Create work order logic
          const newWorkOrder = await createWorkOrder(workOrderData);
          toast({
            title: 'Success',
            description: 'Work order created successfully!',
          });
          navigate(`/work-orders/${newWorkOrder.id}`);
        }
      } else {
        // Update work order logic
        await updateWorkOrder(workOrderId, workOrderData);
        toast({
          title: 'Success',
          description: 'Work order updated successfully!',
        });
        setWorkOrder(workOrderData);
      }
      setIsEditMode(false);
    } catch (err: any) {
      setError(err.message || 'Failed to save work order.');
      toast({
        title: 'Error',
        description: 'Failed to save work order. Please try again.',
        variant: 'destructive',
      });
      console.error('Error saving work order:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const onJobLinesChange = useCallback((updatedJobLines: WorkOrderJobLine[]) => {
    setJobLines(updatedJobLines);
  }, []);

  const onTimeEntriesChange = useCallback((updatedTimeEntries: TimeEntry[]) => {
    setTimeEntries(updatedTimeEntries);
  }, []);

  if (shouldLoadData && isLoading) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold">Loading Work Order...</h1>
          <p className="text-muted-foreground">Please wait while we fetch the details.</p>
        </div>
      </div>
    );
  }

  if (shouldLoadData && error) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-destructive">Error</h1>
          <p className="text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  // Determine if we're in create mode or edit mode
  if (isCreateMode || isEditMode) {
    return (
      <div className="container mx-auto max-w-5xl p-0 md:p-6">
        {/* Edit Mode UI - Render the form here */}
        <div>
          <h2>Work Order Form (Edit Mode)</h2>
          {/* Implement your form here, passing in workOrder, jobLines, allParts, timeEntries, customer, etc. */}
          {/* Include form fields and submit button */}
          {/* Call handleSaveWorkOrder on form submission */}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl p-0 md:p-6">
      {/* Details Tabs! */}
      <WorkOrderDetailsTabs
        workOrder={workOrder}
        jobLines={jobLines}
        allParts={allParts}
        timeEntries={timeEntries}
        customer={customer}
        onJobLinesChange={onJobLinesChange}
        onTimeEntriesChange={onTimeEntriesChange}
        isEditMode={isEditMode}
      />
    </div>
  );
};
