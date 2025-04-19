
import { WorkOrder } from "@/types/workOrder";

// Define configurations for each status
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    description: "Work has not yet been started"
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border border-blue-300",
    description: "Work is currently being performed"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border border-green-300",
    description: "Work has been completed"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border border-red-300",
    description: "Work has been cancelled"
  }
};

// Define status transitions
interface StatusTransition {
  status: WorkOrder["status"];
  label: string;
  color: string;
  buttonVariant: "outline" | "secondary" | "destructive" | "default";
  icon: string;
}

// Define what status can be transitioned to from current status
export const getNextStatusOptions = (currentStatus: WorkOrder["status"]): StatusTransition[] => {
  switch (currentStatus) {
    case "pending":
      return [
        { 
          status: "in-progress", 
          label: "Start Work", 
          color: "bg-blue-100", 
          buttonVariant: "default",
          icon: "play" 
        },
        { 
          status: "cancelled", 
          label: "Cancel", 
          color: "bg-red-100", 
          buttonVariant: "destructive",
          icon: "x" 
        }
      ];
    case "in-progress":
      return [
        { 
          status: "completed", 
          label: "Complete", 
          color: "bg-green-100", 
          buttonVariant: "default",
          icon: "check" 
        },
        { 
          status: "cancelled", 
          label: "Cancel", 
          color: "bg-red-100", 
          buttonVariant: "destructive",
          icon: "x" 
        }
      ];
    case "completed":
      return [
        { 
          status: "in-progress", 
          label: "Reopen", 
          color: "bg-blue-100", 
          buttonVariant: "outline",
          icon: "refresh-ccw" 
        }
      ];
    case "cancelled":
      return [
        { 
          status: "pending", 
          label: "Reopen", 
          color: "bg-yellow-100", 
          buttonVariant: "outline",
          icon: "refresh-ccw" 
        }
      ];
    default:
      return [];
  }
};
