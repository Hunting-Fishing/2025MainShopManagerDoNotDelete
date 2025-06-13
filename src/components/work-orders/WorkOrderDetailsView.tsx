
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, Loader2, ArrowLeft, Edit, Save, X } from 'lucide-react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { WorkOrderPart } from '@/types/workOrderPart';
import { TimeEntry } from '@/types/workOrder';
import { getWorkOrderById, updateWorkOrder } from '@/services/workOrder';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { useWorkOrderJobLines } from '@/hooks/useWorkOrderJobLines';
import { useTechnicians } from '@/hooks/useTechnicians';
import { WorkOrderFormSchemaValues, workOrderFormSchema } from '@/schemas/workOrderSchema';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { CreateWorkOrderTab } from './details/CreateWorkOrderTab';
import { WorkOrderDocuments } from './details/WorkOrderDocuments';
import { TimeTrackingSection } from './time-tracking/TimeTrackingSection';
import { WorkOrderCommunications } from './communications/WorkOrderCommunications';
import { WorkOrderPartsSection } from './parts/WorkOrderPartsSection';
import { toast } from 'sonner';

export interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: Record<string, string>;
  onCreateWorkOrder?: (data: WorkOrderFormSchemaValues) => Promise<void>;
}

export function WorkOrderDetailsView({
  workOrderId: propWorkOrderId,
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { id: routeWorkOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrderId = propWorkOrderId || routeWorkOrderId;

  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [allParts, setAllParts] = useState<WorkOrderPart[]>([]);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(isCreateMode);
  const [activeTab, setActiveTab] = useState('overview');

  const { jobLines, isLoading: jobLinesLoading, updateJobLines } = useWorkOrderJobLines(workOrderId || '');
  const { technicians, isLoading: technicianLoading, error: technicianError } = useTechnicians();

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending' as const,
      priority: 'medium' as const,
      technician: '',
      location: '',
      dueDate: '',
      notes: '',
      vehicleMake: '',
      vehicleModel: '',
      vehicleYear: '',
      odometer: '',
      licensePlate: '',
      vin: ''
    }
  });

  useEffect(() => {
    if (workOrderId && !isCreateMode) {
      fetchWorkOrderData();
    } else if (isCreateMode) {
      populateFormWithPreData();
      setLoading(false);
    }
  }, [workOrderId, isCreateMode]);

  const fetchWorkOrderData = async () => {
    if (!workOrderId) return;

    try {
      setLoading(true);
      setError(null);

      const [workOrderData, partsData] = await Promise.all([
        getWorkOrderById(workOrderId),
        getWorkOrderParts(workOrderId)
      ]);

      if (workOrderData) {
        setWorkOrder(workOrderData);
        setAllParts(partsData);
        populateForm(workOrderData);
      } else {
        setError('Work order not found');
      }
    } catch (err) {
      console.error('Error fetching work order data:', err);
      const errorMessage = typeof err === 'object' && err !== null && 'message' in err 
        ? (err as { message: string }).message 
        : 'Failed to load work order details';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const populateForm = (workOrderData: WorkOrder) => {
    form.reset({
      customer: workOrderData.customer_name || workOrderData.customer || '',
      description: workOrderData.description || '',
      status: (workOrderData.status || 'pending') as WorkOrderFormSchemaValues['status'],
      priority: (workOrderData.priority || 'medium') as WorkOrderFormSchemaValues['priority'],
      technician: workOrderData.technician || '',
      location: workOrderData.location || '',
      dueDate: workOrderData.due_date || workOrderData.dueDate || '',
      notes: workOrderData.notes || '',
      vehicleMake: workOrderData.vehicle_make || '',
      vehicleModel: workOrderData.vehicle_model || '',
      vehicleYear: workOrderData.vehicle_year || '',
      odometer: workOrderData.vehicle_odometer || '',
      licensePlate: workOrderData.vehicle_license_plate || '',
      vin: workOrderData.vehicle_vin || ''
    });
  };

  const populateFormWithPreData = () => {
    if (Object.keys(prePopulatedData).length > 0) {
      form.reset({
        customer: prePopulatedData.customerName || '',
        description: prePopulatedData.title || '',
        status: 'pending' as const,
        priority: 'medium' as const,
        technician: '',
        location: '',
        dueDate: '',
        notes: '',
        vehicleMake: prePopulatedData.vehicleMake || '',
        vehicleModel: prePopulatedData.vehicleModel || '',
        vehicleYear: prePopulatedData.vehicleYear || '',
        odometer: '',
        licensePlate: prePopulatedData.vehicleLicensePlate || '',
        vin: prePopulatedData.vehicleVin || ''
      });
    }
  };

  const handleSave = async (data: WorkOrderFormSchemaValues) => {
    if (!workOrderId) return;

    try {
      const updatedWorkOrder = await updateWorkOrder(workOrderId, data);
      setWorkOrder(updatedWorkOrder);
      setIsEditMode(false);
      toast.success('Work order updated successfully');
    } catch (err) {
      console.error('Error updating work order:', err);
      toast.error('Failed to update work order');
    }
  };

  const handleCreateWorkOrder = async (data: WorkOrderFormSchemaValues) => {
    if (onCreateWorkOrder) {
      await onCreateWorkOrder(data);
    }
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

  if (error) {
    return (
      <div className="container mx-auto p-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (isCreateMode || !workOrder) {
    return (
      <div className="container mx-auto p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => navigate('/work-orders')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Work Orders
            </Button>
            <h1 className="text-2xl font-bold">Create Work Order</h1>
          </div>
        </div>

        <CreateWorkOrderTab
          form={form}
          technicians={technicians}
          technicianLoading={technicianLoading}
          technicianError={technicianError}
          jobLines={jobLines}
          onJobLinesChange={updateJobLines}
          workOrderId="new"
          shopId=""
          prePopulatedCustomer={prePopulatedData}
          onCreateWorkOrder={handleCreateWorkOrder}
          isEditMode={true}
        />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/work-orders')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Work Orders
          </Button>
          <h1 className="text-2xl font-bold">
            Work Order #{workOrder.work_order_number || workOrder.id.slice(0, 8)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          {isEditMode ? (
            <>
              <Button
                variant="outline"
                onClick={() => setIsEditMode(false)}
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              <Button
                onClick={form.handleSubmit(handleSave)}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button
              variant="outline"
              onClick={() => setIsEditMode(true)}
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="parts">Parts & Inventory</TabsTrigger>
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="communications">Communications</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          {isEditMode ? (
            <CreateWorkOrderTab
              form={form}
              technicians={technicians}
              technicianLoading={technicianLoading}
              technicianError={technicianError}
              jobLines={jobLines}
              onJobLinesChange={updateJobLines}
              workOrderId={workOrder.id}
              shopId={workOrder.customer_id}
              prePopulatedCustomer={{}}
              onCreateWorkOrder={handleSave}
              isEditMode={true}
            />
          ) : (
            <WorkOrderDetailsTab
              workOrder={workOrder}
              jobLines={jobLines}
              allParts={allParts}
              onJobLinesChange={updateJobLines}
              isEditMode={false}
            />
          )}
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
            onUpdateTimeEntries={setTimeEntries}
            isEditMode={isEditMode}
          />
        </TabsContent>

        <TabsContent value="documents">
          <WorkOrderDocuments workOrderId={workOrder.id} />
        </TabsContent>

        <TabsContent value="communications">
          <WorkOrderCommunications workOrder={workOrder} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
