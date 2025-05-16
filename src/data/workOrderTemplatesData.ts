
// For backwards compatibility with any code that imports directly
import { WorkOrderTemplate } from "@/types/workOrder";

export const workOrderTemplates: WorkOrderTemplate[] = [];
export const updateTemplateUsage = async (templateId: string) => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  // This is a no-op for compatibility
};
export const createTemplate = async () => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  // Return a valid WorkOrderTemplate object for backward compatibility
  return { 
    id: '', 
    name: '',
    status: 'active',
    created_at: '', 
    usage_count: 0 
  } as WorkOrderTemplate;
};
