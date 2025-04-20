
import { useEffect, useState } from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm"; // Verify this import
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { WorkOrderTemplate } from "@/types/workOrder";
import { useSearchParams } from "react-router-dom";
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { useStaffMembers } from "@/hooks/useStaffMembers";
import { useToast } from "@/hooks/use-toast";

export default function WorkOrderCreate() {
  const { templates: workOrderTemplates, updateTemplateUsage } = useWorkOrderTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  
  // Use the new hook to fetch technicians with role filter
  const { staffMembers, isLoading: loadingTechnicians, error: techError } = useStaffMembers('technician');
  
  // Map staff members to technician names for the dropdown
  const technicians = staffMembers.map(tech => tech.name);

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

  // Show error toast if technician fetch fails
  useEffect(() => {
    if (techError) {
      toast({
        title: "Error loading technicians",
        description: "Could not load technicians from the database",
        variant: "destructive"
      });
    }
  }, [techError, toast]);

  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    setSelectedTemplate(template);
    updateTemplateUsage(template.id);
  };

  return (
    <ResponsiveContainer>
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
          loadingTechnicians={loadingTechnicians}
        />
      </div>
    </ResponsiveContainer>
  );
};
