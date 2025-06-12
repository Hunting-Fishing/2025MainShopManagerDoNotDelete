
import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Loader2, User, Car, FileText, Settings } from 'lucide-react';
import { useWorkOrderPrePopulation } from '@/hooks/useWorkOrderPrePopulation';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { CustomerFields } from '../form-fields/CustomerFields';
import { VehicleDetailsField } from '../fields/VehicleDetailsField';
import { ServicesSection } from '../form-fields/ServicesSection';
import { StatusFields } from '../form-fields/StatusFields';
import { NotesField } from '../form-fields/NotesField';
import { WorkOrder } from '@/types/workOrder';

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

interface CreateWorkOrderTabProps {
  workOrder: WorkOrder;
  onCreateWorkOrder?: (data: any) => Promise<void>;
  prePopulatedData?: PrePopulatedData;
}

export function CreateWorkOrderTab({ 
  workOrder, 
  onCreateWorkOrder,
  prePopulatedData = {}
}: CreateWorkOrderTabProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Use the pre-population hook to load customer data
  const {
    selectedCustomer,
    selectedVehicle,
    loading: prePopLoading,
    error: prePopError,
    getInitialFormData
  } = useWorkOrderPrePopulation(prePopulatedData);

  // Initialize form with default values and pre-populated data
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
      vin: '',
      customerEmail: '',
      customerPhone: '',
      customerAddress: '',
    }
  });

  // Update form when pre-populated data is loaded
  useEffect(() => {
    if (!prePopLoading && (selectedCustomer || prePopulatedData.customerName)) {
      const initialData = getInitialFormData();
      console.log('Setting initial form data:', initialData);
      
      // Set form values from pre-populated data
      Object.entries(initialData).forEach(([key, value]) => {
        if (value) {
          form.setValue(key as keyof WorkOrderFormSchemaValues, value);
        }
      });
    }
  }, [selectedCustomer, selectedVehicle, prePopLoading, getInitialFormData, form]);

  const handleSubmit = async (data: WorkOrderFormSchemaValues) => {
    if (!onCreateWorkOrder) return;

    setIsSubmitting(true);
    setError(null);

    try {
      console.log('Creating work order with data:', data);
      
      // Add customer and vehicle IDs if available
      const workOrderData = {
        ...data,
        customer_id: selectedCustomer?.id || prePopulatedData.customerId,
        vehicle_id: selectedVehicle?.id || prePopulatedData.vehicleId,
        customer_name: data.customer || selectedCustomer?.first_name + ' ' + selectedCustomer?.last_name,
        work_order_number: `WO-${Date.now()}`, // Generate work order number
      };

      await onCreateWorkOrder(workOrderData);
    } catch (err) {
      console.error('Error creating work order:', err);
      setError(err instanceof Error ? err.message : 'Failed to create work order');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (prePopLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
          <p className="text-lg">Loading customer information...</p>
        </div>
      </div>
    );
  }

  if (prePopError) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          Error loading customer data: {prePopError}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-2">Create New Work Order</h2>
        {selectedCustomer && (
          <p className="text-blue-100">
            Creating work order for {selectedCustomer.first_name} {selectedCustomer.last_name}
          </p>
        )}
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Customer Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <CustomerFields 
                form={form} 
                prePopulatedCustomer={{
                  customerName: selectedCustomer ? 
                    `${selectedCustomer.first_name} ${selectedCustomer.last_name}`.trim() : 
                    prePopulatedData.customerName,
                  customerEmail: selectedCustomer?.email || prePopulatedData.customerEmail,
                  customerPhone: selectedCustomer?.phone || prePopulatedData.customerPhone,
                  customerAddress: selectedCustomer?.address || prePopulatedData.customerAddress,
                }}
              />
            </CardContent>
          </Card>

          {/* Vehicle Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Car className="h-5 w-5" />
                Vehicle Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <VehicleDetailsField 
                form={form}
                isFleetCustomer={selectedCustomer?.customer_type === 'business'}
              />
            </CardContent>
          </Card>

          {/* Service Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Service Details
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesSection form={form} />
            </CardContent>
          </Card>

          {/* Work Order Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Work Order Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <StatusFields form={form} />
              <NotesField form={form} />
            </CardContent>
          </Card>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            <Button type="button" variant="outline">
              Save as Draft
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creating Work Order...
                </>
              ) : (
                'Create Work Order'
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
