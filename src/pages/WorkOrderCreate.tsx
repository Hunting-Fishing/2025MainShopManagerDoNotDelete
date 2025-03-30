
import { useEffect, useState } from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { workOrderTemplates, updateTemplateUsage } from "@/data/workOrderTemplatesData";
import { WorkOrderTemplate } from "@/types/workOrder";
import { supabase } from "@/integrations/supabase/client";

export default function WorkOrderCreate() {
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [technicians, setTechnicians] = useState<string[]>([
    "Michael Brown",
    "Sarah Johnson",
    "David Lee",
    "Emily Chen",
    "Unassigned",
  ]);

  // Fetch technicians (in a real app, this would fetch from a users/employees table)
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // This is a placeholder for fetching technicians from Supabase
        // In a real implementation, this would query a staff or users table
        const { data, error } = await supabase
          .from('work_orders')
          .select('technician')
          .not('technician', 'is', null);
          
        if (error) throw error;
        
        if (data && data.length > 0) {
          const uniqueTechnicians = Array.from(
            new Set(data.map(item => item.technician))
          ).sort();
          
          if (uniqueTechnicians.length > 0) {
            // Add "Unassigned" if not already in the list
            if (!uniqueTechnicians.includes("Unassigned")) {
              uniqueTechnicians.push("Unassigned");
            }
            
            setTechnicians(uniqueTechnicians);
          }
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
