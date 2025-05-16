
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Save } from "lucide-react";
import { Link } from "react-router-dom";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrder, WorkOrderTemplate, WorkOrderStatusType } from "@/types/workOrder";
import { useWorkOrderForm } from "@/hooks/useWorkOrderForm";
import { WorkOrderSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";

const defaultWorkOrder: Partial<WorkOrder> = {
  status: "pending",
  description: "",
};

export default function WorkOrderCreate() {
  const navigate = useNavigate();
  const { form, isSubmitting, handleSubmit } = useWorkOrderForm(defaultWorkOrder);
  const [showTemplateSelector, setShowTemplateSelector] = useState(false);

  const workOrder = form.watch();
  
  const updateField = (field: any, value: any) => {
    form.setValue(field, value);
  };

  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    // Apply the selected template
    updateField("description", template.description || "");
    updateField("status", template.status || "pending");
    updateField("technician", template.technician || "");
    
    setShowTemplateSelector(false);
  };

  // Templates need to be converted to match the WorkOrderTemplate type
  const availableTemplates: WorkOrderTemplate[] = [
    {
      id: "template-1",
      name: "Oil Change",
      description: "Standard oil change service",
      status: "pending" as WorkOrderStatusType,
      technician: "John Smith",
      notes: "Check all fluid levels and tire pressure",
      usage_count: 45,
      last_used: "2023-10-10",
    },
    {
      id: "template-2",
      name: "Brake Inspection",
      description: "Complete brake system inspection",
      status: "pending" as WorkOrderStatusType,
      technician: "Jane Doe",
      notes: "Check brake pads, rotors, and fluid",
      usage_count: 28,
      last_used: "2023-09-25",
    },
    {
      id: "template-3",
      name: "Full Service",
      description: "Complete vehicle service",
      status: "pending" as WorkOrderStatusType,
      technician: "Mike Johnson",
      notes: "Full inspection and maintenance service",
      usage_count: 19,
      last_used: "2023-10-05",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" asChild>
            <Link to="/work-orders">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Create Work Order</h1>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={() => setShowTemplateSelector(true)}
          >
            Use Template
          </Button>
          <Button
            onClick={() => handleSubmit()}
            disabled={isSubmitting}
          >
            <Save className="mr-2 h-4 w-4" />
            Save Work Order
          </Button>
        </div>
      </div>

      <WorkOrderForm
        form={form}
        onSubmit={handleSubmit}
        isLoading={isSubmitting}
      />

      <WorkOrderSelector
        templates={availableTemplates} 
        onTemplateSelect={handleSelectTemplate}
        open={showTemplateSelector}
        onClose={() => setShowTemplateSelector(false)}
      />
    </div>
  );
}
