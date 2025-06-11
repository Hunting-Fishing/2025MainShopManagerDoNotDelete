
import React, { useState, useEffect } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Form } from '@/components/ui/form';
import { toast } from '@/hooks/use-toast';
import { workOrderFormSchema, type WorkOrderFormSchemaValues } from '@/schemas/workOrderSchema';
import { createWorkOrder } from '@/services/workOrder';
import { useTechnicians } from '@/hooks/useTechnicians';
import { useCustomers } from '@/hooks/useCustomers';

// Import form field components
import { CustomerInfoSection } from './CustomerInfoSection';
import { StatusFields } from './form-fields/StatusFields';
import { AssignmentFields } from './form-fields/AssignmentFields';
import { NotesField } from './form-fields/NotesField';
import { WorkOrderInventoryField } from './inventory/WorkOrderInventoryField';

export function WorkOrderCreateForm() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { technicians, loading: technicianLoading, error: technicianError } = useTechnicians();
  const { filteredCustomers: customers, loading: customersLoading } = useCustomers();

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: '',
      description: '',
      status: 'pending',
      priority: 'medium',
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
      inventoryItems: [],
    }
  });

  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      setIsSubmitting(true);
      
      // Create the work order
      const workOrder = await createWorkOrder({
        customer_name: values.customer,
        description: values.description,
        status: values.status,
        technician_id: values.technician || null,
        notes: values.notes || null,
        vehicle_make: values.vehicleMake || null,
        vehicle_model: values.vehicleModel || null,
        vehicle_year: values.vehicleYear ? parseInt(values.vehicleYear) : null,
        vehicle_license_plate: values.licensePlate || null,
        vehicle_vin: values.vin || null,
      });

      toast({
        title: "Success",
        description: "Work order created successfully"
      });

      navigate(`/work-orders/${workOrder.id}`);
    } catch (error: any) {
      console.error('Error creating work order:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create work order",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Create Work Order</h1>
          <p className="text-muted-foreground">Create a new work order for your shop</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Work Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Customer Information */}
                <CustomerInfoSection 
                  form={form} 
                  customers={customers} 
                  isLoading={customersLoading} 
                />
                
                {/* Status & Priority */}
                <StatusFields form={form} />
                
                {/* Assignment */}
                <AssignmentFields 
                  form={form} 
                  technicians={technicians}
                  technicianLoading={technicianLoading}
                  technicianError={technicianError}
                />
                
                {/* Notes */}
                <NotesField form={form} />

                {/* Inventory Items */}
                <WorkOrderInventoryField form={form} />
              </div>

              <div className="flex justify-end gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/work-orders')}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="bg-blue-600 hover:bg-blue-700"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Work Order"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
