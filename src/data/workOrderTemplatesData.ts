
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";
import { WorkOrderTemplate, WorkOrderStatusType } from "@/types/workOrder";
import { normalizeWorkOrderStatus } from "@/utils/typeAdapters";

// This file now re-exports the hook that fetches data from the database
export { useWorkOrderTemplates };

// For backwards compatibility with any code that imports directly
export const workOrderTemplates: WorkOrderTemplate[] = [];

// Update this function to return a properly typed WorkOrderTemplate
export const updateTemplateUsage = async (templateId: string) => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  // This is a no-op for compatibility
};

// Update this function to return a properly typed WorkOrderTemplate
export const createTemplate = async () => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  
  // Return a valid WorkOrderTemplate
  const status = normalizeWorkOrderStatus("pending");
  
  return {
    id: '',
    name: '',
    description: '',
    status: status,
    priority: 'medium',
    technician: '',
    notes: '',
    location: '',
    created_at: new Date().toISOString(), // Use snake_case for API compatibility
    usage_count: 0,
    inventory_items: []
  } as WorkOrderTemplate;
};
