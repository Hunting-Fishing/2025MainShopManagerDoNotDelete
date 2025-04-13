
import { useEffect, useState } from "react";
import { WorkOrderFormHeader } from "@/components/work-orders/WorkOrderFormHeader";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { WorkOrderTemplate } from "@/types/workOrder";
import { supabase } from '@/lib/supabase';
import { useSearchParams } from "react-router-dom";
import { ResponsiveContainer } from "@/components/ui/responsive-container";
import { toast } from "@/hooks/use-toast";

export default function WorkOrderCreate() {
  const { templates: workOrderTemplates, updateTemplateUsage } = useWorkOrderTemplates();
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [searchParams] = useSearchParams();
  const [technicians, setTechnicians] = useState<string[]>([]);

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

  // Fetch technicians from Supabase
  useEffect(() => {
    const fetchTechnicians = async () => {
      try {
        // Try to fetch staff members from profiles table
        const { data, error } = await supabase
          .from('profiles')
          .select('id, first_name, last_name')
          .order('first_name', { ascending: true });
          
        if (error) {
          console.error("Error fetching technicians:", error);
          return; // Keep using default technicians
        }
        
        if (data && data.length > 0) {
          // Format technician names
          const techniciansList = data.map(tech => 
            `${tech.first_name || ''} ${tech.last_name || ''}`.trim()
          ).filter(name => name.length > 0);
          
          // Add "Unassigned" option
          if (!techniciansList.includes("Unassigned")) {
            techniciansList.push("Unassigned");
          }
          
          setTechnicians(techniciansList);
        }
      } catch (error) {
        console.error("Error in fetchTechnicians:", error);
        toast({
          title: "Error",
          description: "Failed to load technicians. Please try again.",
          variant: "destructive"
        });
      }
    };
    
    fetchTechnicians();
  }, []);

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
        />
      </div>
    </ResponsiveContainer>
  );
}

// Import the hook for workorder templates
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";
