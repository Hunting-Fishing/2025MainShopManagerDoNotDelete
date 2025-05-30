
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderCreateForm } from "@/components/work-orders/WorkOrderCreateForm";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Info } from "lucide-react";

const WorkOrderCreate = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Extract customer and equipment information from URL parameters
  const customerId = searchParams.get('customerId');
  const customerName = searchParams.get('customerName');
  const customerEmail = searchParams.get('customerEmail');
  const customerPhone = searchParams.get('customerPhone');
  const customerAddress = searchParams.get('customerAddress');
  const equipmentType = searchParams.get('equipmentType');
  const equipmentName = searchParams.get('equipmentName');
  const equipmentId = searchParams.get('equipmentId');
  
  // Extract equipment details
  const vehicleMake = searchParams.get('equipment_make');
  const vehicleModel = searchParams.get('equipment_model');
  const vehicleYear = searchParams.get('equipment_year');
  const vehicleVin = searchParams.get('equipment_vin');
  const vehicleLicensePlate = searchParams.get('equipment_license_plate');

  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: customerName || "",
      description: equipmentName ? `Service for ${equipmentName}` : "",
      status: "pending",
      priority: "medium",
      technician: "",
      location: customerAddress || "",
      dueDate: "",
      notes: "",
      vehicleMake: vehicleMake || "",
      vehicleModel: vehicleModel || "",
      vehicleYear: vehicleYear || "",
      odometer: "",
      licensePlate: vehicleLicensePlate || "",
      vin: vehicleVin || "",
      inventoryItems: []
    }
  });

  // Update form when URL params change
  useEffect(() => {
    if (customerName) {
      form.setValue('customer', customerName);
    }
    if (equipmentName) {
      form.setValue('description', `Service for ${equipmentName}`);
    }
    if (customerAddress) {
      form.setValue('location', customerAddress);
    }
    if (vehicleMake) {
      form.setValue('vehicleMake', vehicleMake);
    }
    if (vehicleModel) {
      form.setValue('vehicleModel', vehicleModel);
    }
    if (vehicleYear) {
      form.setValue('vehicleYear', vehicleYear);
    }
    if (vehicleLicensePlate) {
      form.setValue('licensePlate', vehicleLicensePlate);
    }
    if (vehicleVin) {
      form.setValue('vin', vehicleVin);
    }
  }, [searchParams, form]);

  const onSubmit = async (values: WorkOrderFormSchemaValues) => {
    try {
      setIsSubmitting(true);
      
      // Include customer information in the work order data
      const workOrderData = {
        ...values,
        customer_id: customerId,
        customer_email: customerEmail,
        customer_phone: customerPhone,
        customer_address: customerAddress,
        equipment_id: equipmentId,
        equipment_type: equipmentType
      };
      
      console.log("Submitting work order:", workOrderData);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setSuccessMessage("Work order created successfully!");
      // Navigate after a short delay to show the success message
      setTimeout(() => {
        navigate("/work-orders");
      }, 2000);
    } catch (error) {
      console.error("Error creating work order:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <WorkOrderFormHeader 
        title="Create Work Order" 
        description="Create a new work order for a customer's vehicle service" 
      />

      {/* Show customer info if pre-populated */}
      {customerName && (
        <Alert className="mb-6">
          <Info className="h-4 w-4" />
          <AlertDescription>
            Creating work order for <strong>{customerName}</strong>
            {equipmentName && <span> - {equipmentName}</span>}
            {customerEmail && <span> ({customerEmail})</span>}
          </AlertDescription>
        </Alert>
      )}

      {successMessage && (
        <div className="bg-green-50 border-l-4 border-green-500 p-4 mb-4">
          <p className="text-green-700">{successMessage}</p>
        </div>
      )}

      <WorkOrderCreateForm
        form={form}
        onSubmit={onSubmit}
      />
    </div>
  );
};

export default WorkOrderCreate;
