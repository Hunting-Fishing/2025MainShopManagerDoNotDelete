
import { useEffect, useState } from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { WorkOrderTemplate } from "@/types/workOrder";
import { useSearchParams } from "react-router-dom";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { toast } from "@/hooks/use-toast";
import { useTechnicians } from "@/hooks/useTechnicians";
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";

export default function WorkOrderCreate() {
  const { templates: workOrderTemplates, updateTemplateUsage } = useWorkOrderTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [searchParams] = useSearchParams();
  const { technicians, isLoading: loadingTechnicians } = useTechnicians();

  // Check if coming from vehicle details with pre-filled info
  const hasPreFilledInfo = searchParams.has('customerId') && searchParams.has('vehicleId');
  const vehicleInfo = searchParams.get('vehicleInfo');
  const customerName = searchParams.get('customerName');
  const customerId = searchParams.get('customerId');

  // Set a more descriptive title when coming from a vehicle page
  const pageTitle = hasPreFilledInfo 
    ? `Create Work Order for ${customerName || 'Customer'}`
    : "Create Work Order";
    
  const pageDescription = hasPreFilledInfo && vehicleInfo
    ? `Creating a new work order for ${vehicleInfo}`
    : "Create a new work order for your team to complete.";

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
          isLoadingTechnicians={loadingTechnicians}
          initialTemplate={selectedTemplate}
        />
      </div>
    </ResponsiveContainer>
  );
}
