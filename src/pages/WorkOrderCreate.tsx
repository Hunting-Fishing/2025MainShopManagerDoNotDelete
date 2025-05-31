
import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { WorkOrderCreateForm } from '@/components/work-orders/WorkOrderCreateForm';
import { createWorkOrder } from '@/services/workOrder';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { workOrderFormSchema, WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { useToast } from '@/hooks/use-toast';
import { formatWorkOrderForDb } from '@/utils/workOrders/formatters';

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  // Get pre-populated data from URL params
  const prePopulatedCustomer = {
    customerName: searchParams.get('customerName') || undefined,
    customerEmail: searchParams.get('customerEmail') || undefined,
    customerPhone: searchParams.get('customerPhone') || undefined,
    customerAddress: searchParams.get('customerAddress') || undefined,
    equipmentName: searchParams.get('equipmentName') || undefined,
    equipmentType: searchParams.get('equipmentType') || undefined,
    vehicleMake: searchParams.get('vehicleMake') || undefined,
    vehicleModel: searchParams.get('vehicleModel') || undefined,
    vehicleYear: searchParams.get('vehicleYear') || undefined,
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate') || undefined,
    vehicleVin: searchParams.get('vehicleVin') || undefined
  };

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: prePopulatedCustomer.customerName || "",
      description: prePopulatedCustomer.equipmentName ? 
        `Service request for ${prePopulatedCustomer.equipmentName}` : "",
      status: "pending",
      priority: "medium",
      technician: "",
      location: "",
      dueDate: "",
      notes: prePopulatedCustomer.equipmentType ? 
        `Equipment Type: ${prePopulatedCustomer.equipmentType}` : "",
      vehicleMake: prePopulatedCustomer.vehicleMake || "",
      vehicleModel: prePopulatedCustomer.vehicleModel || "",
      vehicleYear: prePopulatedCustomer.vehicleYear || "",
      odometer: "",
      licensePlate: prePopulatedCustomer.vehicleLicensePlate || "",
      vin: prePopulatedCustomer.vehicleVin || "",
      inventoryItems: []
    }
  });

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log('Submitting work order:', values);
      
      // Create a comprehensive description including equipment information
      let fullDescription = values.description;
      if (prePopulatedCustomer.equipmentName && !fullDescription.includes(prePopulatedCustomer.equipmentName)) {
        fullDescription += `\nEquipment: ${prePopulatedCustomer.equipmentName}`;
      }
      if (prePopulatedCustomer.equipmentType) {
        fullDescription += `\nEquipment Type: ${prePopulatedCustomer.equipmentType}`;
      }

      // Format the data for database insertion
      const workOrderData = formatWorkOrderForDb({
        customer_id: searchParams.get('customerId') || undefined,
        description: fullDescription,
        status: values.status,
        service_type: prePopulatedCustomer.equipmentType || 'General Service',
        // Add other fields as needed
      });

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

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new work order for tracking service tasks.
        </p>
      </div>

      <WorkOrderCreateForm 
        form={form} 
        onSubmit={handleSubmit}
        prePopulatedCustomer={prePopulatedCustomer}
      />
    </div>
  );
}
