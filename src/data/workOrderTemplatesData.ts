
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";
import { WorkOrderTemplate, WorkOrderStatusType } from "@/types/workOrder";

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
  // Cast the return value to WorkOrderTemplate to ensure it's properly typed
  const status: WorkOrderStatusType = 'pending'; // Using a valid status from WorkOrderStatusType
  return {
    id: '',
    name: '',
    description: '',
    status: status,
    createdAt: new Date().toISOString(),
    usageCount: 0
  } as WorkOrderTemplate;
};
