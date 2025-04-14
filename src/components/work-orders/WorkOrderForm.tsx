
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderTemplate } from "@/types/workOrder";
import { workOrderTemplates } from "@/data/workOrderTemplatesData";
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { toast } from "@/hooks/use-toast";
import { format } from "date-fns"; // Import format for date formatting

// Import components
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { WorkOrderInventorySection } from "@/components/work-orders/inventory/WorkOrderInventorySection";
import { FormActions } from "@/components/work-orders/FormActions";
import { TimeTrackingSection } from "@/components/work-orders/time-tracking/TimeTrackingSection";
import { SaveAsTemplateDialog } from "./templates/SaveAsTemplateDialog";
import { WorkOrderDescriptionField } from "./fields/WorkOrderDescriptionField";
import { VehicleDetailsField } from "./fields/VehicleDetailsField";
import { CommonServicesChecklist } from "./fields/CommonServicesChecklist";

interface WorkOrderFormProps {
  technicians: string[];
  initialTemplate?: WorkOrderTemplate | null;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ 
  technicians,
  initialTemplate
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { form, onSubmit, isSubmitting, error, setTimeEntries, setFormValues } = useWorkOrderForm();
  const [timeEntries, setLocalTimeEntries] = useState<TimeEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isFleetCustomer, setIsFleetCustomer] = useState<boolean>(false);

  // Get customer and vehicle information from URL parameters
  const customerId = searchParams.get('customerId');
  const vehicleId = searchParams.get('vehicleId');
  const customerName = searchParams.get('customerName');
  const vehicleInfo = searchParams.get('vehicleInfo');

  // Fetch real customers from Supabase
  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      try {
        const { data, error } = await supabase
          .from('customers')
          .select('*')
          .order('last_name', { ascending: true });
        
        if (error) {
          console.error("Error fetching customers:", error);
          throw error;
        }
        
        if (data) {
          console.log("Fetched customers:", data.length);
          // Apply adaptCustomerForUI to normalize each customer record
          const adaptedCustomers = data.map(customer => adaptCustomerForUI(customer));
          setCustomers(adaptedCustomers);

          // If we have a customerId, find if this customer is a fleet customer
          if (customerId) {
            const selectedCustomer = adaptedCustomers.find(c => c.id === customerId);
            if (selectedCustomer) {
              setIsFleetCustomer(selectedCustomer.is_fleet === true || Boolean(selectedCustomer.fleet_company));
            }
          }
        }
      } catch (err) {
        console.error("Error fetching customers:", err);
        toast({
          title: "Error",
          description: "Failed to load customers. Please try again.",
          variant: "destructive",
        });
      } finally {
        setLoadingCustomers(false);
      }
    };

    fetchCustomers();
  }, [customerId]);

  // Apply template values when initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      console.log("Applying template:", initialTemplate.name);
      
      // Format today's date as a string for the form
      const today = format(new Date(), 'yyyy-MM-dd');
      
      // Reset form with template values
      form.reset({
        customer: initialTemplate.customer || "",
        description: initialTemplate.description || "",
        status: initialTemplate.status,
        priority: initialTemplate.priority,
        technician: initialTemplate.technician,
        location: initialTemplate.location || "",
        dueDate: today, // Always use current date as string
        notes: initialTemplate.notes || "",
        inventoryItems: initialTemplate.inventoryItems || [],
      });

      // Show notification
      toast({
        title: "Template Applied",
        description: `${initialTemplate.name} template has been applied.`,
        variant: "success",
      });
    }
  }, [initialTemplate, form]);

  // Pre-fill form with customer and vehicle information from URL
  useEffect(() => {
    if (customerId) {
      console.log("Pre-filling form with customerId:", customerId);
      // Automatically select the customer in the form
      form.setValue('customer', customerId);
      
      if (vehicleInfo) {
        form.setValue('description', `Service for ${vehicleInfo}`);
        
        // If we have a vehicle ID, store it for the component that needs it
        if (vehicleId) {
          setSelectedVehicleId(vehicleId);
          form.setValue('vehicle_id', vehicleId); // Using correct field name from form
        }
        
        // Show a toast notification to confirm the pre-fill
        toast({
          title: "Information Pre-filled",
          description: `Work order created for ${customerName}'s ${vehicleInfo}`,
        });
      }
    }
  }, [customerId, customerName, vehicleId, vehicleInfo, form]);

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    console.log("Updating time entries:", entries.length);
    setLocalTimeEntries(entries);
    setTimeEntries(entries);
  };

  const handleSaveTemplate = (template: WorkOrderTemplate) => {
    console.log("Saving template:", template.name);
    // Add the template to the templates array
    workOrderTemplates.push(template);
    toast({
      title: "Template Saved",
      description: `Template "${template.name}" has been saved.`,
    });
  };

  const handleServiceChecked = (services: string[]) => {
    // Add checked services to description
    if (services.length > 0) {
      let currentDescription = form.getValues("description") || "";
      
      // Check if we already have a checklist section
      if (!currentDescription.includes("Service Checklist:")) {
        currentDescription += "\n\nService Checklist:\n";
      } else {
        // Remove the existing checklist section
        currentDescription = currentDescription.replace(/\n\nService Checklist:[\s\S]*/, "");
        currentDescription += "\n\nService Checklist:\n";
      }
      
      services.forEach(service => {
        currentDescription += `- ${service}\n`;
      });
      
      form.setValue("description", currentDescription);
    }
  };

  return (
    <div className="rounded-lg border border-slate-200 p-6 bg-white">
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Vehicle Details Section - Only show if we have a vehicleId and vehicleInfo */}
          {vehicleId && vehicleInfo && (
            <VehicleDetailsField 
              form={form} 
              isFleetCustomer={isFleetCustomer} 
            />
          )}
          
          {/* Common Services Checklist - New! */}
          <CommonServicesChecklist onServiceChecked={handleServiceChecked} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information - Pass the selected customer ID */}
            <CustomerInfoSection 
              form={form as any} 
              customers={customers} 
              isLoading={loadingCustomers} 
              selectedVehicleId={selectedVehicleId}
              preSelectedCustomerId={customerId}
            />
            
            {/* Status & Priority */}
            <WorkOrderStatusSection form={form as any} />
            
            {/* Assignment */}
            <AssignmentSection form={form as any} technicians={technicians} />
            
            {/* Description Field - Enhanced! */}
            <div className="col-span-1 md:col-span-2">
              <WorkOrderDescriptionField form={form} />
            </div>
            
            {/* Notes */}
            <NotesSection form={form as any} />

            {/* Inventory Items */}
            <WorkOrderInventorySection form={form as any} />
          </div>

          {/* Form Actions with Save as Template */}
          <div className="flex justify-between items-center">
            <SaveAsTemplateDialog 
              formValues={form.getValues()} 
              onSave={handleSaveTemplate} 
            />
            <FormActions 
              isSubmitting={isSubmitting} 
              onCancel={() => navigate("/work-orders")} 
            />
          </div>
        </form>
      </Form>

      {/* Time Tracking Section - Only available after work order creation */}
      <div className="pt-8 mt-8 border-t border-gray-200">
        <div className="text-sm text-gray-500 mb-2">Note: Additional time tracking can be added after the work order is created.</div>
        
        {timeEntries.length > 0 && (
          <TimeTrackingSection 
            workOrderId="new-work-order" 
            timeEntries={timeEntries} 
            onUpdateTimeEntries={handleUpdateTimeEntries} 
          />
        )}
      </div>
    </div>
  );
};
