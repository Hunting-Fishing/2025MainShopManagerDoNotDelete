
import React from 'react';
import { useSearchParams } from 'react-router-dom';
import { WorkOrderForm } from '@/components/work-orders/WorkOrderForm';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { createWorkOrder } from '@/services/workOrder';
import { WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { useNavigate } from 'react-router-dom';

const CreateWorkOrder = () => {
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Extract pre-populated data from URL parameters
  const prePopulatedCustomer = {
    customerId: searchParams.get('customerId') || undefined,
    customerName: searchParams.get('customerName') || undefined,
    customerEmail: searchParams.get('customerEmail') || undefined,
    customerPhone: searchParams.get('customerPhone') || undefined,
    customerAddress: searchParams.get('customerAddress') || undefined,
    vehicleMake: searchParams.get('vehicleMake') || undefined,
    vehicleModel: searchParams.get('vehicleModel') || undefined,
    vehicleYear: searchParams.get('vehicleYear') || undefined,
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || undefined,
    vehicleVin: searchParams.get('vehicleVin') || undefined,
  };

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log('Creating work order with values:', values);
      
      // Ensure inventory items have proper IDs and all required properties
      const inventoryItems = values.inventoryItems.map(item => ({
        id: item.id || crypto.randomUUID(),
        name: item.name || '',
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity || 0,
        unit_price: item.unit_price || 0,
        total: item.total || (item.quantity || 0) * (item.unit_price || 0),
        notes: item.notes
      }));
      
      const workOrderData = {
        customer_id: prePopulatedCustomer.customerId,
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
        vehicle_license_plate: values.licensePlate,
        vehicle_vin: values.vin,
        inventory_items: inventoryItems
      };

      const newWorkOrder = await createWorkOrder(workOrderData);
      
      toast({
        title: 'Success',
        description: 'Work order created successfully!',
      });

      // Navigate to the created work order details page
      navigate(`/work-orders/${newWorkOrder.id}`);
      
    } catch (error) {
      console.error('Error creating work order:', error);
      toast({
        title: 'Error',
        description: 'Failed to create work order. Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <ResponsiveContainer maxWidth="full" className="py-6">
      <Card className="mx-auto max-w-6xl">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">Create New Work Order</CardTitle>
        </CardHeader>
        <CardContent>
          <WorkOrderForm 
            onSubmit={handleSubmit}
            prePopulatedCustomer={prePopulatedCustomer}
          />
        </CardContent>
      </Card>
    </ResponsiveContainer>
  );
};

export default CreateWorkOrder;
