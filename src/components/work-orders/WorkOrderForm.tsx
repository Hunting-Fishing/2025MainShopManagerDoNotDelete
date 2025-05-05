
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useSearchParams } from "react-router-dom";
import { workOrderFormSchema, WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { toast } from "sonner";
import { CustomerInfo } from "@/components/work-orders/fields/CustomerInfo";
import { VehicleInfo } from "@/components/work-orders/fields/VehicleInfo";
import { ScheduleSection } from "@/components/work-orders/fields/ScheduleSection";
import { PartsAndServicesTable } from "@/components/work-orders/fields/PartsAndServicesTable";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderSummary } from "@/components/work-orders/fields/WorkOrderSummary";
import { Separator } from "@/components/ui/separator";
import { Card } from "@/components/ui/card";
import { WorkOrderTemplate } from "@/types/workOrder";

interface WorkOrderFormProps {
  technicians: string[];
  isLoadingTechnicians: boolean;
  initialTemplate?: WorkOrderTemplate | null;
}

export function WorkOrderForm({
  technicians,
  isLoadingTechnicians,
  initialTemplate,
}: WorkOrderFormProps) {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [selectedItems, setSelectedItems] = useState<any[]>([]);
  
  // Get pre-filled info if coming from a vehicle page
  const customerId = searchParams.get('customerId');
  const vehicleId = searchParams.get('vehicleId');
  const customerName = searchParams.get('customerName');
  
  // Initialize the form with React Hook Form + zod validation
  const form = useForm<WorkOrderFormSchemaValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      customer: customerName || "",
      description: "",
      status: "pending",
      priority: "medium",
      technician: "",
      location: "",
      dueDate: new Date(),
      notes: "",
      vehicleMake: "",
      vehicleModel: "",
      vehicleYear: "",
      odometer: "",
      licensePlate: "",
      vin: "",
    },
  });
  
  // Apply template if provided
  useEffect(() => {
    if (initialTemplate) {
      form.setValue("description", initialTemplate.description || "");
      form.setValue("status", initialTemplate.status);
      form.setValue("priority", initialTemplate.priority);
      form.setValue("notes", initialTemplate.notes || "");
      form.setValue("technician", initialTemplate.technician || "");
      
      // Set any other template values if available
      if (initialTemplate.location) form.setValue("location", initialTemplate.location);
      
      toast.success(`Template "${initialTemplate.name}" applied`);
    }
  }, [initialTemplate, form]);
  
  // Function to calculate the total amount from selected items
  const calculateTotal = () => {
    return selectedItems.reduce((acc, item) => {
      return acc + (item.quantity * item.unitPrice);
    }, 0);
  };

  const onSubmit = async (data: WorkOrderFormSchemaValues) => {
    setIsSubmitting(true);
    setFormError(null);
    
    try {
      // Here we would normally send the data to the backend
      console.log("Submitting work order data:", data);
      console.log("Selected items:", selectedItems);
      
      // Simulate a successful submission
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast.success("Work order created successfully");
      navigate("/work-orders");
    } catch (error) {
      console.error("Error creating work order:", error);
      setFormError("There was a problem creating the work order. Please try again.");
      toast.error("Failed to create work order");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WorkOrderFormHeader 
          isSubmitting={isSubmitting} 
          error={formError}
          title="Work Order #1000" 
          description="Create a new work order for your customer's vehicle"
        />
        
        <div className="grid grid-cols-1 gap-6">
          {/* Customer and Vehicle Info Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="space-y-6">
              <Card className="border-l-4 border-l-blue-600">
                <CustomerInfo form={form} />
              </Card>
              
              <Card className="border-l-4 border-l-green-600">
                <VehicleInfo form={form} />
              </Card>
            </div>
            
            <Card className="border-l-4 border-l-amber-600">
              <ScheduleSection 
                form={form} 
                technicians={technicians}
                isLoadingTechnicians={isLoadingTechnicians}
              />
            </Card>
          </div>
          
          <Separator className="my-4" />
          
          {/* Parts and Services Section */}
          <Card className="border-t-4 border-t-slate-700">
            <PartsAndServicesTable 
              items={selectedItems}
              setItems={setSelectedItems}
            />
          </Card>
          
          {/* Work Order Summary Section */}
          <Card className="border-t-4 border-t-purple-600">
            <WorkOrderSummary 
              form={form}
              total={calculateTotal()}
            />
          </Card>
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isSubmitting ? "Creating Work Order..." : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
