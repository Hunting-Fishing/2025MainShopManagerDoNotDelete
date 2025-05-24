
// Single source of truth for work order status and priority mappings
export const statusMap = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "on-hold": "On Hold",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Legacy export for backward compatibility
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
