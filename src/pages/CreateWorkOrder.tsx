
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkOrderForm } from '@/components/work-orders/WorkOrderForm';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { createWorkOrder } from '@/services/workOrder';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';

const CreateWorkOrder = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract pre-populated data from URL parameters
  const prePopulatedData = {
    customerId: searchParams.get('customerId') || undefined,
    customerName: searchParams.get('customerName') || '',
    customerEmail: searchParams.get('customerEmail') || '',
    customerPhone: searchParams.get('customerPhone') || '',
    customerAddress: searchParams.get('customerAddress') || '',
    title: searchParams.get('title') || '',
    description: searchParams.get('description') || '',
    priority: searchParams.get('priority') || 'medium',
    equipmentName: searchParams.get('equipmentName') || '',
    equipmentType: searchParams.get('equipmentType') || '',
    vehicleMake: searchParams.get('vehicleMake') || '',
    vehicleModel: searchParams.get('vehicleModel') || '',
    vehicleYear: searchParams.get('vehicleYear') || '',
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || '',
    vehicleVin: searchParams.get('vehicleVin') || ''
  };

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log('Creating work order with values:', values);
      
      // Map form values to work order data structure
      const workOrderData = {
        customer_id: prePopulatedData.customerId,
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician_id: values.technician,
        location: values.location,
        due_date: values.dueDate,
        notes: values.notes,
        vehicle_make: values.vehicleMake,
        vehicle_model: values.vehicleModel,
        vehicle_year: values.vehicleYear,
        license_plate: values.licensePlate,
        vin: values.vin
      };

      const newWorkOrder = await createWorkOrder(workOrderData);
      
      toast({
        title: "Success",
        description: "Work order created successfully!",
      });

      // Navigate to the new work order details page
      navigate(`/work-orders/${newWorkOrder.id}`);
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: "Failed to create work order. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new work order for customer service or maintenance.
        </p>
      </div>

      <WorkOrderForm
        onSubmit={handleSubmit}
        initialValues={{
          customer: prePopulatedData.customerName,
          description: prePopulatedData.description,
          status: "pending",
          priority: prePopulatedData.priority as any || "medium",
          technician: "",
          location: "",
          dueDate: "",
          notes: "",
          vehicleMake: prePopulatedData.vehicleMake,
          vehicleModel: prePopulatedData.vehicleModel,
          vehicleYear: prePopulatedData.vehicleYear,
          odometer: "",
          licensePlate: prePopulatedData.vehicleLicensePlate,
          vin: prePopulatedData.vehicleVin,
          inventoryItems: []
        }}
      />
    </div>
  );
};

export default CreateWorkOrder;
