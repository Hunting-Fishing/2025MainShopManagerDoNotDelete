
import { useEffect, useState } from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { workOrderTemplates, updateTemplateUsage } from "@/data/workOrderTemplatesData";
import { WorkOrderTemplate } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";
import { useSearchParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export default function WorkOrderCreate() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [searchParams] = useSearchParams();
  const [technicians, setTechnicians] = useState<string[]>([
    "Michael Brown",
    "Sarah Johnson",
    "David Lee",
    "Emily Chen",
    "Unassigned",
  ]);

  // Check if coming from vehicle details with pre-filled info
  const hasPreFilledInfo = searchParams.has('customerId') && searchParams.has('vehicleId');
  const vehicleInfo = searchParams.get('vehicleInfo');
  const customerName = searchParams.get('customerName');

  // Set a more descriptive title when coming from a vehicle page
  const pageTitle = hasPreFilledInfo 
    ? `Create Work Order for ${customerName || 'Customer'}`
    : "Create Work Order";
    
  const pageDescription = hasPreFilledInfo && vehicleInfo
    ? `Creating a new work order for ${vehicleInfo}`
    : "Create a new work order for your team to complete.";

  // Fetch technicians (in a real app, this would fetch from a users/employees table)
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // This is a placeholder for fetching technicians from Supabase
        // In a real implementation, this would query a staff or users table
        const { data, error } = await supabase
          .from('work_orders')
          .select('*');
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          // Since we don't have a 'technician' field but rather 'technician_id',
          // we'll need to handle this differently
          
          // For now, let's use the default technicians list
          // In a real implementation, we would fetch names from a technicians/staff table
          // using the technician_id values
          
          // We could potentially do a join query or a separate query to get technician names
          
          // As a fallback, we'll keep the default list and just ensure "Unassigned" is included
          const defaultTechnicians = [
            "Michael Brown",
            "Sarah Johnson",
            "David Lee",
            "Emily Chen",
            "Unassigned"
          ];
          
          setTechnicians(defaultTechnicians);
        }
      } catch (error) {
        console.error("Error fetching technicians:", error);
      }
    };
    
    fetchTechnicians();
  }, []);

  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    setSelectedTemplate(template);
    updateTemplateUsage(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <WorkOrderFormHeader 
          title={pageTitle}
          description={pageDescription}
        />
        {!hasPreFilledInfo && (
          <WorkOrderTemplateSelector
            templates={workOrderTemplates}
            onSelectTemplate={handleSelectTemplate}
          />
        )}
      </div>

      {/* Form */}
      <WorkOrderForm 
        technicians={technicians} 
        initialTemplate={selectedTemplate}
      />
    </div>
  );
}
