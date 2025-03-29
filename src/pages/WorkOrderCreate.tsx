
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { workOrderTemplates, updateTemplateUsage } from "@/data/workOrderTemplatesData";
import { WorkOrderTemplate } from "@/types/workOrder";
import { useState } from "react";

// Mock data for technicians
const technicians = [
  "Michael Brown",
  "Sarah Johnson",
  "David Lee",
  "Emily Chen",
  "Unassigned",
];

export default function WorkOrderCreate() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);

  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    setSelectedTemplate(template);
    updateTemplateUsage(template.id);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <WorkOrderFormHeader 
          title="Create Work Order" 
          description="Create a new work order for your team to complete."
        />
        <WorkOrderTemplateSelector
          templates={workOrderTemplates}
          onSelectTemplate={handleSelectTemplate}
        />
      </div>

      {/* Form */}
      <WorkOrderForm 
        technicians={technicians} 
        initialTemplate={selectedTemplate}
      />
    </div>
  );
}
