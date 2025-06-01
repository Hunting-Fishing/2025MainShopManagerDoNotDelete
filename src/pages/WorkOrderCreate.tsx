
import React, { useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { WorkOrderCreateForm } from "@/components/work-orders/WorkOrderCreateForm";
import { createWorkOrder } from "@/services/workOrder/workOrderMutationService";

export default function WorkOrderCreate() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract URL parameters for pre-population
  const prePopulatedData = {
    customerId: searchParams.get('customerId'),
    customerName: searchParams.get('customer'),
    customerEmail: searchParams.get('customerEmail'),
    customerPhone: searchParams.get('customerPhone'),
    customerAddress: searchParams.get('customerAddress'),
    title: searchParams.get('title'),
    description: searchParams.get('description'),
    priority: searchParams.get('priority'),
    vehicleId: searchParams.get('vehicleId'),
    vehicleMake: searchParams.get('vehicleMake'),
    vehicleModel: searchParams.get('vehicleModel'),
    vehicleYear: searchParams.get('vehicleYear'),
    vehicleLicensePlate: searchParams.get('vehicleLicensePlate'),
    vehicleVin: searchParams.get('vehicleVin')
  };

  // Create form with mapped default values
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: prePopulatedData.customerName || "",
      description: prePopulatedData.description || "",
      status: "pending",
      priority: (prePopulatedData.priority as "low" | "medium" | "high" | "urgent") || "medium",
      technician: "",
      location: "",
      dueDate: "",
      notes: "",
      vehicleMake: prePopulatedData.vehicleMake || "",
      vehicleModel: prePopulatedData.vehicleModel || "",
      vehicleYear: prePopulatedData.vehicleYear || "",
      odometer: "",
      licensePlate: prePopulatedData.vehicleLicensePlate || "",
      vin: prePopulatedData.vehicleVin || "",
      inventoryItems: []
    }
  });

  // Update form values when URL parameters change
  useEffect(() => {
    if (prePopulatedData.customerName) {
      form.setValue('customer', prePopulatedData.customerName);
    }
    if (prePopulatedData.description) {
      form.setValue('description', prePopulatedData.description);
    }
    if (prePopulatedData.priority) {
      form.setValue('priority', prePopulatedData.priority as "low" | "medium" | "high" | "urgent");
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
  }, [form, prePopulatedData]);

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log("Form values:", values);
      console.log("Pre-populated data:", prePopulatedData);
      
      // Create work order data with both form values and pre-populated data
      const workOrderData = {
        // Form values
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician: values.technician,
        location: values.location,
        notes: values.notes,
        
        // Vehicle information
        vehicle_make: values.vehicleMake,
        vehicle_model: values.vehicleModel,
        vehicle_year: values.vehicleYear,
        vehicle_license_plate: values.licensePlate,
        vehicle_vin: values.vin,
        
        // Customer information from pre-populated data
        customer: values.customer,
        customer_name: values.customer,
        customer_email: prePopulatedData.customerEmail,
        customer_phone: prePopulatedData.customerPhone,
        customer_address: prePopulatedData.customerAddress,
        
        // IDs from pre-populated data
        customer_id: prePopulatedData.customerId,
        vehicle_id: prePopulatedData.vehicleId,
        
        // Additional fields
        due_date: values.dueDate || null,
        estimated_hours: null,
        total_cost: null
      };

      console.log("Work order data to be created:", workOrderData);

      const result = await createWorkOrder(workOrderData);
      console.log("Work order created:", result);

      toast.success("Work order created successfully!");
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.error("Failed to create work order. Please try again.");
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Create Work Order</h1>
        <p className="text-muted-foreground">
          Create a new work order for your customer
        </p>
      </div>
      
      <WorkOrderCreateForm 
        form={form} 
        onSubmit={handleSubmit}
        prePopulatedCustomer={{
          customerName: prePopulatedData.customerName || '',
          customerEmail: prePopulatedData.customerEmail || '',
          customerPhone: prePopulatedData.customerPhone || '',
          customerAddress: prePopulatedData.customerAddress || '',
          vehicleMake: prePopulatedData.vehicleMake || '',
          vehicleModel: prePopulatedData.vehicleModel || '',
          vehicleYear: prePopulatedData.vehicleYear || '',
          vehicleLicensePlate: prePopulatedData.vehicleLicensePlate || '',
          vehicleVin: prePopulatedData.vehicleVin || ''
        }}
      />
    </div>
  );
}
