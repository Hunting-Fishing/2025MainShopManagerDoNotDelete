
import { WorkOrder, WorkOrderStatusType, WorkOrderTemplate } from "@/types/workOrder";

// All work order templates should come from the database
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
    status: 'pending' as WorkOrderStatusType,
    created_at: '', 
    usage_count: 0 
  } as WorkOrderTemplate;
};
