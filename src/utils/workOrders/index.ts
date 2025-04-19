
// Re-export all work order utility functions
export * from './queries/findWorkOrder';
export * from './mutations/createWorkOrder';
export * from './mutations/updateWorkOrder';
export * from './mutations/deleteWorkOrder';
export * from './queries/getTechnicians';
export * from './generators';
export * from './formatters';
export * from './mappers';
export * from './activity';
export * from './statusManagement';

// Define standard status and priority maps as the single source of truth
export const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Also export with legacy name for backward compatibility
export const WorkOrderStatus = statusMap;

export const priorityMap = {
  "low": {
    label: "Low",
    classes: "bg-green-100 text-green-800 border border-green-200"
  },
  "medium": {
    label: "Medium",
    classes: "bg-yellow-100 text-yellow-800 border border-yellow-200"
  },
  "high": {
    label: "High",
    classes: "bg-red-100 text-red-800 border border-red-200"
  }
};

// Helper function to determine priority based on criteria
export const determinePriority = (dueDate: string, status: string): "low" | "medium" | "high" => {
  // Implementation logic here
  return "medium";
};
