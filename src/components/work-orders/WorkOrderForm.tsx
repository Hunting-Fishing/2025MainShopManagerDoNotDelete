
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
import { format } from "date-fns";

// Import all the previously missing components with correct paths
import { VehicleDetailsField } from "./fields/VehicleDetailsField";
import { CommonServicesChecklist } from "./fields/CommonServicesChecklist";
import { CustomerInfoSection } from "./CustomerInfoSection";
import { WorkOrderStatusSection } from "./WorkOrderStatusSection";
import { AssignmentSection } from "./AssignmentSection";
import { WorkOrderDescriptionField } from "./fields/WorkOrderDescriptionField";
import { NotesSection } from "./NotesSection";
import { WorkOrderInventorySection } from "./WorkOrderInventorySection";
import { SaveAsTemplateDialog } from "./templates/SaveAsTemplateDialog";
import { FormActions } from "./FormActions";
import { TimeTrackingSection } from "./TimeTrackingSection";

interface WorkOrderFormProps {
  technicians: string[];
  initialTemplate?: WorkOrderTemplate | null;
  loadingTechnicians?: boolean;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ 
  technicians,
  initialTemplate,
  loadingTechnicians = false
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { form, onSubmit, isSubmitting, error, setTimeEntries, setFormValues } = useWorkOrderForm();
  const [timeEntries, setLocalTimeEntries] = useState<TimeEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isFleetCustomer, setIsFleetCustomer] = useState<boolean>(false);

  const customerId = searchParams.get('customerId');
  const vehicleId = searchParams.get('vehicleId');
  const customerName = searchParams.get('customerName');
  const vehicleInfo = searchParams.get('vehicleInfo');

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
          const adaptedCustomers = data.map(customer => adaptCustomerForUI(customer));
          setCustomers(adaptedCustomers);

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

  useEffect(() => {
    if (initialTemplate) {
      console.log("Applying template:", initialTemplate.name);
      
      const today = format(new Date(), 'yyyy-MM-dd');
      
      form.reset({
        customer: initialTemplate.customer || "",
        description: initialTemplate.description || "",
        status: initialTemplate.status,
        priority: initialTemplate.priority,
        technician: initialTemplate.technician,
        location: initialTemplate.location || "",
        dueDate: today,
        notes: initialTemplate.notes || "",
        inventoryItems: initialTemplate.inventoryItems || [],
      });

      toast({
        title: "Template Applied",
        description: `${initialTemplate.name} template has been applied.`,
        variant: "success",
      });
    }
  }, [initialTemplate, form]);

  useEffect(() => {
    if (customerId) {
      console.log("Pre-filling form with customerId:", customerId);
      form.setValue('customer', customerId);
      
      if (vehicleInfo) {
        form.setValue('description', `Service for ${vehicleInfo}`);
        
        if (vehicleId) {
          setSelectedVehicleId(vehicleId);
          form.setValue('vehicle_id', vehicleId);
        }
        
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
    workOrderTemplates.push(template);
    toast({
      title: "Template Saved",
      description: `Template "${template.name}" has been saved.`,
    });
  };

  const handleServiceChecked = (services: string[]) => {
    if (services.length > 0) {
      let currentDescription = form.getValues("description") || "";
      
      if (!currentDescription.includes("Service Checklist:")) {
        currentDescription += "\n\nService Checklist:\n";
      } else {
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
          {vehicleId && vehicleInfo && (
            <VehicleDetailsField 
              form={form} 
              isFleetCustomer={isFleetCustomer} 
            />
          )}
          
          <CommonServicesChecklist onServiceChecked={handleServiceChecked} />
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <CustomerInfoSection 
              form={form as any} 
              customers={customers} 
              isLoading={loadingCustomers} 
              selectedVehicleId={selectedVehicleId}
              preSelectedCustomerId={customerId}
            />
            
            <WorkOrderStatusSection form={form as any} />
            
            <AssignmentSection 
              form={form as any} 
              technicians={technicians} 
              isLoading={loadingTechnicians}
            />
            
            <div className="col-span-1 md:col-span-2">
              <WorkOrderDescriptionField form={form} />
            </div>
            
            <NotesSection form={form as any} />

            <WorkOrderInventorySection form={form as any} />
          </div>

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
