
import { useEffect, useState } from "react";
import { WorkOrderForm } from "@/components/work-orders/WorkOrderForm";
import { WorkOrderTemplateSelector } from "@/components/work-orders/templates/WorkOrderTemplateSelector";
import { WorkOrderTemplate } from "@/types/workOrder";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { WorkOrderPageLayout } from "@/components/work-orders/WorkOrderPageLayout";
import { getUniqueTechnicians } from "@/utils/workOrders/crud";

export default function WorkOrderCreate() {
  // State for templates and technicians
  const [workOrderTemplates, setWorkOrderTemplates] = useState<WorkOrderTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<WorkOrderTemplate | null>(null);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [isLoadingTechnicians, setIsLoadingTechnicians] = useState(true);
  
  // URL parameters
  const [searchParams] = useSearchParams();

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
    : "Create a new work order for your customer's vehicle";

  // Load technicians from database
  useEffect(() => {
    const loadTechnicians = async () => {
      setIsLoadingTechnicians(true);
      try {
        const technicianList = await getUniqueTechnicians();
        setTechnicians(technicianList);
      } catch (error) {
        console.error("Error loading technicians:", error);
        toast.error("Failed to load technicians");
      } finally {
        setIsLoadingTechnicians(false);
      }
    };

    loadTechnicians();
  }, []);

  // Handle template selection
  const handleSelectTemplate = (template: WorkOrderTemplate) => {
    setSelectedTemplate(template);
    // In a real app, update the usage count in the database
    toast.success(`Template "${template.name}" selected`);
  };

  // Load templates
  useEffect(() => {
    // Mock templates - in a real app, these would come from the database
    setWorkOrderTemplates([
      {
        id: "1",
        name: "Basic Service",
        description: "Regular maintenance service",
        status: "pending",
        priority: "medium",
        notes: "Perform oil change, filter replacement, and basic inspection",
      },
      {
        id: "2",
        name: "Major Repair",
        description: "Complex repair work",
        status: "pending",
        priority: "high",
        notes: "Detailed diagnosis required before proceeding with repairs",
      },
      {
        id: "3",
        name: "Diagnostic",
        description: "Diagnostic service",
        status: "pending",
        priority: "low",
        notes: "Perform comprehensive diagnostic scan and inspection",
      }
    ]);
  }, []);

  return (
    <WorkOrderPageLayout
      title={pageTitle}
      description={pageDescription}
      backLink="/work-orders"
      backLinkText="Back to Work Orders"
    >
      <div className="space-y-6">
        {/* Template selector */}
        {!hasPreFilledInfo && (
          <div className="flex justify-end mb-4">
            <WorkOrderTemplateSelector
              templates={workOrderTemplates}
              onSelectTemplate={handleSelectTemplate}
            />
          </div>
        )}

        {/* Work Order Form */}
        <div className="bg-slate-50 dark:bg-slate-800/50 p-1 rounded-lg">
          <WorkOrderForm 
            technicians={technicians} 
            isLoadingTechnicians={isLoadingTechnicians}
            initialTemplate={selectedTemplate}
          />
        </div>
      </div>
    </WorkOrderPageLayout>
  );
}
