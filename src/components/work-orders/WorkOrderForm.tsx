
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useNavigate } from "react-router-dom";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { WorkOrderTemplate } from "@/types/workOrder";
import { workOrderTemplates } from "@/data/workOrderTemplatesData";
import { supabase } from "@/integrations/supabase/client";
import { Customer } from "@/types/customer";

// Import components
import { CustomerInfoSection } from "@/components/work-orders/CustomerInfoSection";
import { WorkOrderStatusSection } from "@/components/work-orders/WorkOrderStatusSection";
import { AssignmentSection } from "@/components/work-orders/AssignmentSection";
import { NotesSection } from "@/components/work-orders/NotesSection";
import { WorkOrderInventorySection } from "@/components/work-orders/inventory/WorkOrderInventorySection";
import { FormActions } from "@/components/work-orders/FormActions";
import { TimeTrackingSection } from "@/components/work-orders/time-tracking/TimeTrackingSection";
import { SaveAsTemplateDialog } from "./templates/SaveAsTemplateDialog";
import { toast } from "@/hooks/use-toast";

interface WorkOrderFormProps {
  technicians: string[];
  initialTemplate?: WorkOrderTemplate | null;
}

export const WorkOrderForm: React.FC<WorkOrderFormProps> = ({ 
  technicians,
  initialTemplate
}) => {
  const navigate = useNavigate();
  const { form, onSubmit, isSubmitting, error, setTimeEntries, setFormValues } = useWorkOrderForm();
  const [timeEntries, setLocalTimeEntries] = useState<TimeEntry[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);

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
          throw error;
        }
        
        if (data) {
          // Apply adaptCustomerForUI to normalize each customer record
          setCustomers(data.map(customer => adaptCustomerForUI(customer)));
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
  }, []);

  // Apply template values when initialTemplate changes
  useEffect(() => {
    if (initialTemplate) {
      // Reset form with template values
      form.reset({
        customer: initialTemplate.customer || "",
        description: initialTemplate.description || "",
        status: initialTemplate.status,
        priority: initialTemplate.priority,
        technician: initialTemplate.technician,
        location: initialTemplate.location || "",
        dueDate: new Date(), // Always use current date
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

  const handleUpdateTimeEntries = (entries: TimeEntry[]) => {
    setLocalTimeEntries(entries);
    setTimeEntries(entries);
  };

  const handleSaveTemplate = (template: WorkOrderTemplate) => {
    // Add the template to the templates array
    workOrderTemplates.push(template);
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Customer Information */}
            <CustomerInfoSection form={form as any} customers={customers} isLoading={loadingCustomers} />
            
            {/* Status & Priority */}
            <WorkOrderStatusSection form={form as any} />
            
            {/* Assignment */}
            <AssignmentSection form={form as any} technicians={technicians} />
            
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
