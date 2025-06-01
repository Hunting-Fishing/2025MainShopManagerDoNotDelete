
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { WorkOrderCreateForm } from "@/components/work-orders/WorkOrderCreateForm";
import { WorkOrderFormSchemaValues, workOrderFormSchema } from "@/schemas/workOrderSchema";
import { createWorkOrder } from "@/services/workOrder";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customerId: "",
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerAddress: "",
      title: "",
      description: "",
      priority: "medium",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      vehicleLicensePlate: "",
      vehicleVin: "",
      equipmentName: "",
      equipmentType: "",
      technicianId: "",
      status: "pending",
      startDate: "",
      dueDate: "",
      estimatedHours: 0,
      notes: ""
    }
  });

  // Pre-populate form with URL parameters
  useEffect(() => {
    const prePopulatedData: any = {};
    
    // Extract all URL parameters
    const customerId = searchParams.get("customerId");
    const vehicleId = searchParams.get("vehicleId"); // NEW: Capture vehicle ID
    const customer = searchParams.get("customer");
    const customerEmail = searchParams.get("customerEmail");
    const customerPhone = searchParams.get("customerPhone");
    const customerAddress = searchParams.get("customerAddress");
    const title = searchParams.get("title");
    const description = searchParams.get("description");
    const priority = searchParams.get("priority");
    const vehicleMake = searchParams.get("vehicleMake");
    const vehicleModel = searchParams.get("vehicleModel");
    const vehicleYear = searchParams.get("vehicleYear");
    const vehicleLicensePlate = searchParams.get("vehicleLicensePlate");
    const vehicleVin = searchParams.get("vehicleVin");

    // Set form values from URL parameters
    if (customerId) {
      prePopulatedData.customerId = customerId;
      form.setValue("customerId", customerId);
    }
    
    // NEW: Store vehicle ID for later use
    if (vehicleId) {
      prePopulatedData.vehicleId = vehicleId;
    }
    
    if (customer) {
      prePopulatedData.customerName = customer;
      form.setValue("customerName", customer);
    }
    if (customerEmail) {
      prePopulatedData.customerEmail = customerEmail;
      form.setValue("customerEmail", customerEmail);
    }
    if (customerPhone) {
      prePopulatedData.customerPhone = customerPhone;
      form.setValue("customerPhone", customerPhone);
    }
    if (customerAddress) {
      prePopulatedData.customerAddress = customerAddress;
      form.setValue("customerAddress", customerAddress);
    }
    if (title) {
      prePopulatedData.title = title;
      form.setValue("title", title);
    }
    if (description) {
      prePopulatedData.description = description;
      form.setValue("description", description);
    }
    if (priority) {
      prePopulatedData.priority = priority;
      form.setValue("priority", priority as any);
    }
    if (vehicleMake) {
      prePopulatedData.vehicleMake = vehicleMake;
      form.setValue("vehicleMake", vehicleMake);
    }
    if (vehicleModel) {
      prePopulatedData.vehicleModel = vehicleModel;
      form.setValue("vehicleModel", vehicleModel);
    }
    if (vehicleYear) {
      prePopulatedData.vehicleYear = vehicleYear;
      form.setValue("vehicleYear", vehicleYear);
    }
    if (vehicleLicensePlate) {
      prePopulatedData.vehicleLicensePlate = vehicleLicensePlate;
      form.setValue("vehicleLicensePlate", vehicleLicensePlate);
    }
    if (vehicleVin) {
      prePopulatedData.vehicleVin = vehicleVin;
      form.setValue("vehicleVin", vehicleVin);
    }

    // Store the vehicle ID in a way that can be accessed during form submission
    if (vehicleId) {
      form.setValue("vehicleId" as any, vehicleId);
    }

    console.log("Pre-populated work order data:", prePopulatedData);
  }, [searchParams, form]);

  const handleSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      console.log("Submitting work order with values:", values);
      
      // Extract vehicle ID from form or URL params
      const vehicleId = (values as any).vehicleId || searchParams.get("vehicleId");
      
      // Prepare the work order data
      const workOrderData = {
        customer_id: values.customerId || undefined,
        vehicle_id: vehicleId || undefined, // NEW: Include vehicle_id
        description: values.description,
        status: values.status,
        priority: values.priority,
        technician_id: values.technicianId || undefined,
        estimated_hours: values.estimatedHours || undefined,
        start_time: values.startDate ? new Date(values.startDate).toISOString() : undefined,
        end_time: values.dueDate ? new Date(values.dueDate).toISOString() : undefined,
        service_type: values.title || undefined,
        notes: values.notes || undefined,
        // Individual vehicle fields as fallback
        vehicle_make: values.vehicleMake || undefined,
        vehicle_model: values.vehicleModel || undefined,
        vehicle_year: values.vehicleYear || undefined,
        vehicle_license_plate: values.vehicleLicensePlate || undefined,
        vehicle_vin: values.vehicleVin || undefined,
        // Customer information
        customer_name: values.customerName || undefined,
        customer_email: values.customerEmail || undefined,
        customer_phone: values.customerPhone || undefined,
        customer_address: values.customerAddress || undefined,
      };

      console.log("Final work order data being sent:", workOrderData);

      const result = await createWorkOrder(workOrderData);
      
      if (result) {
        toast.success("Work order created successfully!");
        navigate("/work-orders");
      } else {
        toast.error("Failed to create work order");
      }
    } catch (error) {
      console.error("Error creating work order:", error);
      toast.error("Failed to create work order");
    }
  };

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate("/work-orders")}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Work Orders
        </Button>
        <h1 className="text-2xl font-bold">Create Work Order</h1>
      </div>

      <WorkOrderCreateForm 
        form={form} 
        onSubmit={handleSubmit}
      />
    </div>
  );
}
