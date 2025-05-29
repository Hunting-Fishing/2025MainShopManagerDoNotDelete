
import { WorkOrderTemplate } from "@/types/workOrder";

// All work order templates should come from the database - no mock data
export const workOrderTemplates: WorkOrderTemplate[] = [];

export const updateTemplateUsage = async (templateId: string) => {
  console.warn('Template usage tracking should be implemented with real database calls.');
  // This is a no-op for compatibility - implement with real database calls
};

export const createTemplate = async (): Promise<WorkOrderTemplate | null> => {
  console.warn('Template creation should be implemented with real database calls.');
  // Return null instead of mock data - implement with real database calls
  return null;
};
