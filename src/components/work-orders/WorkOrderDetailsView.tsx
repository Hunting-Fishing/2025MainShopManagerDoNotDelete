
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, AlertCircle, Loader2 } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { WorkOrderDetailsTab } from './details/WorkOrderDetailsTab';
import { CreateWorkOrderTab } from './details/CreateWorkOrderTab';
import { WorkOrderDetailsTabs } from './details/WorkOrderDetailsTabs';
import { useWorkOrder } from '@/hooks/useWorkOrder';
import { useWorkOrderJobLines } from '@/hooks/useWorkOrderJobLines';
import { useTechnicians } from '@/hooks/useTechnicians';
import { WorkOrderFormSchemaValues, workOrderFormSchema } from '@/schemas/workOrderSchema';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

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

export interface WorkOrderDetailsViewProps {
  workOrderId?: string;
  isCreateMode?: boolean;
  prePopulatedData?: PrePopulatedData;
  onCreateWorkOrder?: (data: WorkOrderFormSchemaValues) => Promise<void>;
}

export function WorkOrderDetailsView({
  workOrderId: propWorkOrderId,
  isCreateMode = false,
  prePopulatedData = {},
  onCreateWorkOrder
}: WorkOrderDetailsViewProps) {
  const { id: paramWorkOrderId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const workOrderId = propWorkOrderId || paramWorkOrderId;
  
  const [activeTab, setActiveTab] = useState<string>(isCreateMode ? 'edit' : 'details');
  const [isEditMode, setIsEditMode] = useState(isCreateMode);

  // Get work order data
  const { 
    workOrder, 
    isLoading: workOrderLoading, 
    error: workOrderError 
  } = useWorkOrder(workOrderId || '');

  // Get job lines
  const { 
    jobLines = [], 
    isLoading: jobLinesLoading,
    updateJobLines 
  } = useWorkOrderJobLines(workOrderId || '');

  // Get technicians
  const { 
    technicians, 
    isLoading: technicianLoading, 
    error: technicianError 
  } = useTechnicians();

  // Form setup
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      status: (workOrder?.status as any) || 'pending',
      priority: (workOrder?.service_type as any) || 'medium',
      description: workOrder?.description || '',
      customer: workOrder?.customer_name || prePopulatedData.customerName || '',
      customerEmail: prePopulatedData.customerEmail || '',
      customerPhone: prePopulatedData.customerPhone || '',
      customerAddress: prePopulatedData.customerAddress || '',
      vehicleMake: prePopulatedData.vehicleMake || '',
      vehicleModel: prePopulatedData.vehicleModel || '',
      vehicleYear: prePopulatedData.vehicleYear || '',
      licensePlate: prePopulatedData.vehicleLicensePlate || '',
      vin: prePopulatedData.vehicleVin || '',
      technician: '',
      location: '',
      dueDate: '',
      notes: ''
    }
  });

  // Update form when work order data changes
  useEffect(() => {
    if (workOrder && !isCreateMode) {
      form.reset({
        status: (workOrder.status as any) || 'pending',
        priority: (workOrder.service_type as any) || 'medium',
        description: workOrder.description || '',
        customer: workOrder.customer_name || '',
        customerEmail: workOrder.customer_email || '',
        customerPhone: workOrder.customer_phone || '',
        customerAddress: workOrder.customer_address || '',
        vehicleMake: workOrder.vehicle_make || '',
        vehicleModel: workOrder.vehicle_model || '',
        vehicleYear: workOrder.vehicle_year || '',
        licensePlate: workOrder.vehicle_license_plate || '',
        vin: workOrder.vehicle_vin || '',
        technician: '',
        location: workOrder.location || '',
        dueDate: workOrder.due_date ? new Date(workOrder.due_date).toISOString().split('T')[0] : '',
        notes: workOrder.notes || ''
      });
    }
  }, [workOrder, form, isCreateMode]);

  const handleCreateWorkOrder = async (data: WorkOrderFormSchemaValues) => {
    if (onCreateWorkOrder) {
      await onCreateWorkOrder(data);
    }
  };

  const handleJobLinesChange = (updatedJobLines: WorkOrderJobLine[]) => {
    if (updateJobLines) {
      updateJobLines(updatedJobLines);
    }
  };

  // Loading state
  if (workOrderLoading || jobLinesLoading) {
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

  // Error state
  if (workOrderError && !isCreateMode) {
    const errorMessage = workOrderError instanceof Error ? workOrderError.message : String(workOrderError);
    return (
      <ResponsiveContainer maxWidth="full" className="py-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Error loading work order: {errorMessage}
          </AlertDescription>
        </Alert>
      </ResponsiveContainer>
    );
  }

  // Create mode without existing work order
  if (isCreateMode && !workOrder) {
    return (
      <ResponsiveContainer maxWidth="full" className="py-6">
        <CreateWorkOrderTab
          form={form}
          technicians={technicians}
          technicianLoading={technicianLoading}
          technicianError={technicianError ? String(technicianError) : null}
          jobLines={jobLines}
          onJobLinesChange={handleJobLinesChange}
          workOrderId="new"
          shopId=""
          prePopulatedCustomer={prePopulatedData}
          onCreateWorkOrder={handleCreateWorkOrder}
          isEditMode={true}
        />
      </ResponsiveContainer>
    );
  }

  // Work order not found
  if (!workOrder && !isCreateMode) {
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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/work-orders')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Work Orders
            </Button>
            
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                {isCreateMode ? 'Create New Work Order' : `Work Order ${workOrder?.work_order_number || workOrder?.id}`}
              </h1>
              <p className="text-sm text-gray-600 mt-1">
                {workOrder?.customer_name && `Customer: ${workOrder.customer_name}`}
              </p>
            </div>
          </div>
        </div>
      </div>

      <ResponsiveContainer maxWidth="full" className="py-6">
        {workOrder && (
          <WorkOrderDetailsTabs
            workOrder={workOrder}
            form={form}
            technicians={technicians}
            technicianLoading={technicianLoading}
            technicianError={technicianError ? String(technicianError) : null}
            jobLines={jobLines}
            onJobLinesChange={handleJobLinesChange}
            onCreateWorkOrder={handleCreateWorkOrder}
            prePopulatedData={prePopulatedData}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            isEditMode={isEditMode}
          />
        )}
      </ResponsiveContainer>
    </div>
  );
}
