
import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { WorkOrderTemplate, WorkOrderInventoryItem } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";
import { Customer, adaptCustomerForUI } from "@/types/customer";
import { toast } from "@/hooks/use-toast";
import { useWorkOrderInitialization } from "@/hooks/workOrders/useWorkOrderInitialization";
import { WorkOrderFormLayout } from "./sections/WorkOrderFormLayout";

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
  const [timeEntries, setLocalTimeEntries] = useState([]);
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [selectedVehicleId, setSelectedVehicleId] = useState<string | null>(null);
  const [isFleetCustomer, setIsFleetCustomer] = useState<boolean>(false);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const customerId = searchParams.get('customerId');
  const vehicleId = searchParams.get('vehicleId');
  const customerName = searchParams.get('customerName');
  const vehicleInfo = searchParams.get('vehicleInfo');

  // Use the initialization hook
  useWorkOrderInitialization({
    form,
    initialTemplate,
    customerId,
    customerName,
    vehicleId,
    vehicleInfo
  });

  useEffect(() => {
    const fetchCustomers = async () => {
      setLoadingCustomers(true);
      setFetchError(null);
      
      try {
        console.log("Starting customer fetch...");
        const { data, error, status } = await supabase
          .from('customers')
          .select('*')
          .order('last_name', { ascending: true });
        
        if (error) {
          console.error("Supabase error fetching customers:", error);
          setFetchError(`Error code: ${error.code}, message: ${error.message}`);
          throw error;
        }
        
        if (data) {
          console.log("Fetched customers successfully:", data.length);
          const adaptedCustomers = data.map(customer => adaptCustomerForUI(customer));
          setCustomers(adaptedCustomers);

          if (customerId) {
            const selectedCustomer = adaptedCustomers.find(c => c.id === customerId);
            if (selectedCustomer) {
              console.log("Found selected customer:", selectedCustomer.id);
              setIsFleetCustomer(selectedCustomer.is_fleet === true);
            } else {
              console.log("Selected customer not found in results, ID:", customerId);
            }
          }
        } else {
          console.log("No customer data returned, status:", status);
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

  const handleUpdateTimeEntries = (entries: any[]) => {
    console.log("Updating time entries:", entries.length);
    setLocalTimeEntries(entries);
    setTimeEntries(entries);
  };

  const handleSaveTemplate = (template: WorkOrderTemplate) => {
    console.log("Saving template:", template.name);
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
    <>
      {fetchError && (
        <div className="bg-red-50 p-4 mb-4 rounded-md border border-red-200 text-red-800">
          <h4 className="font-semibold mb-2">Connection Error</h4>
          <p className="text-sm">{fetchError}</p>
          <p className="text-sm mt-2">Please check your Supabase connection and permissions.</p>
        </div>
      )}
      
      <WorkOrderFormLayout
        form={form}
        error={error}
        isSubmitting={isSubmitting}
        onSubmit={onSubmit}
        onCancel={() => navigate("/work-orders")}
        customers={customers}
        loadingCustomers={loadingCustomers}
        technicians={technicians}
        loadingTechnicians={loadingTechnicians}
        selectedVehicleId={selectedVehicleId}
        customerId={customerId}
        vehicleId={vehicleId}
        vehicleInfo={vehicleInfo}
        isFleetCustomer={isFleetCustomer}
        timeEntries={timeEntries}
        onUpdateTimeEntries={handleUpdateTimeEntries}
        onSaveTemplate={handleSaveTemplate}
        onServiceChecked={handleServiceChecked}
      />
    </>
  );
};
