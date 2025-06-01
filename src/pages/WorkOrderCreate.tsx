
import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkOrderCreateForm } from '@/components/work-orders/WorkOrderCreateForm';
import { createWorkOrder } from '@/services/workOrder';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { useToast } from '@/hooks/use-toast';
import { formatWorkOrderForDb } from '@/utils/workOrders/formatters';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  console.log('WorkOrderCreate page loaded with params:', Object.fromEntries(searchParams));

  // Get pre-populated data from URL params
  const prePopulatedData = {
    customerId: searchParams.get('customerId') || '',
    customerName: searchParams.get('customer') || searchParams.get('customerName') || '',
    customerEmail: searchParams.get('customerEmail') || '',
    customerPhone: searchParams.get('customerPhone') || '',
    customerAddress: searchParams.get('customerAddress') || '',
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    priority: searchParams.get('priority') || 'medium',
    vehicleMake: searchParams.get('vehicleMake') || '',
    vehicleModel: searchParams.get('vehicleModel') || '',
    vehicleYear: searchParams.get('vehicleYear') || '',
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || '',
    vehicleVin: searchParams.get('vehicleVin') || '',
    equipmentName: searchParams.get('equipmentName') || '',
    equipmentType: searchParams.get('equipmentType') || ''
  };

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: prePopulatedData.customerName,
      description: prePopulatedData.description || (prePopulatedData.equipmentName ? 
        `Service request for ${prePopulatedData.equipmentName}` : ""),
      status: "pending",
      priority: prePopulatedData.priority as any,
      technician: "",
      location: "",
      dueDate: "",
      notes: prePopulatedData.equipmentType ? 
        `Equipment Type: ${prePopulatedData.equipmentType}` : "",
      vehicleMake: prePopulatedData.vehicleMake,
      vehicleModel: prePopulatedData.vehicleModel,
      vehicleYear: prePopulatedData.vehicleYear,
      odometer: "",
      licensePlate: prePopulatedData.vehicleLicensePlate,
      vin: prePopulatedData.vehicleVin,
      inventoryItems: []
    }
  });

  // Update form values when URL params change
  useEffect(() => {
    if (prePopulatedData.customerName) {
      form.setValue('customer', prePopulatedData.customerName);
    }
    if (prePopulatedData.description) {
      form.setValue('description', prePopulatedData.description);
    }
    if (prePopulatedData.title && !prePopulatedData.description) {
      form.setValue('description', prePopulatedData.title);
    }
    if (prePopulatedData.vehicleMake) {
      form.setValue('vehicleMake', prePopulatedData.vehicleMake);
    }
    if (prePopulatedData.vehicleModel) {
      form.setValue('vehicleModel', prePopulatedData.vehicleModel);
    }
    if (prePopulatedData.vehicleYear) {
      form.setValue('vehicleYear', prePopulatedData.vehicleYear);
    }
    if (prePopulatedData.vehicleLicensePlate) {
      form.setValue('licensePlate', prePopulatedData.vehicleLicensePlate);
    }
    if (prePopulatedData.vehicleVin) {
      form.setValue('vin', prePopulatedData.vehicleVin);
    }
  }, [searchParams, form, prePopulatedData]);

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log('Submitting work order:', values);
      
      // Create a comprehensive description including equipment information
      let fullDescription = values.description;
      if (prePopulatedData.equipmentName && !fullDescription.includes(prePopulatedData.equipmentName)) {
        fullDescription += `\nEquipment: ${prePopulatedData.equipmentName}`;
      }
      if (prePopulatedData.equipmentType) {
        fullDescription += `\nEquipment Type: ${prePopulatedData.equipmentType}`;
      }

      // Format the data for database insertion
      const workOrderData = formatWorkOrderForDb({
        customer_id: prePopulatedData.customerId || undefined,
        description: fullDescription,
        status: values.status,
        priority: values.priority,
        technician_id: values.technician || undefined,
        service_type: prePopulatedData.equipmentType || 'General Service',
        location: values.location || undefined,
        due_date: values.dueDate || undefined,
        notes: values.notes || undefined,
        vehicle_make: values.vehicleMake || undefined,
        vehicle_model: values.vehicleModel || undefined,
        vehicle_year: values.vehicleYear || undefined,
        vehicle_vin: values.vin || undefined,
        vehicle_license_plate: values.licensePlate || undefined,
        vehicle_odometer: values.odometer || undefined
      });

      console.log('Formatted work order data:', workOrderData);

      const result = await createWorkOrder(workOrderData);
      
      if (result) {
        console.log('Work order created successfully:', result);
        toast({
          title: "Success",
          description: "Work order created successfully",
        });
        navigate('/work-orders');
      } else {
        throw new Error('Failed to create work order');
      }
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleBack = () => {
    if (prePopulatedData.customerId) {
      navigate(`/customers/${prePopulatedData.customerId}`);
    } else {
      navigate('/work-orders');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={handleBack}>
          <ChevronLeft className="mr-2 h-4 w-4" />
          {prePopulatedData.customerId ? 'Back to Customer' : 'Back to Work Orders'}
        </Button>
      </div>

      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new work order for tracking service tasks.
          {prePopulatedData.customerName && ` Customer: ${prePopulatedData.customerName}`}
        </p>
      </div>

      <WorkOrderCreateForm 
        form={form} 
        onSubmit={handleSubmit}
        prePopulatedCustomer={prePopulatedData}
      />
    </div>
  );
}
