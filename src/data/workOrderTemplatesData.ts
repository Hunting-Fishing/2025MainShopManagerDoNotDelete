
import { useWorkOrderTemplates } from "@/hooks/useWorkOrderTemplates";

// This file now re-exports the hook that fetches data from the database
export { useWorkOrderTemplates };

// For backwards compatibility with any code that imports directly
import { WorkOrderTemplate } from "@/types/workOrder";
export const workOrderTemplates: WorkOrderTemplate[] = [];
export const updateTemplateUsage = async (templateId: string) => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  // This is a no-op for compatibility
};
export const createTemplate = async () => {
  console.warn('Using deprecated function. Please use useWorkOrderTemplates hook instead.');
  return { id: '', createdAt: '', usageCount: 0 } as WorkOrderTemplate;
};
