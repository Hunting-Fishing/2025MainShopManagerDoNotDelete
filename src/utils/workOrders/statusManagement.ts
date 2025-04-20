import { WorkOrder } from "@/types/workOrder";
import { CheckCircle, Clock, Play, XCircle } from "lucide-react";

type NextStep = {
  status: WorkOrder["status"];
  label: string;
};

export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 hover:border-amber-300 focus:ring-amber-500",
    icon: Clock,
    description: "Work order has been created but work hasn't started",
    allowedTransitions: ["in-progress", "cancelled"] as WorkOrder["status"][],
    nextSteps: [
      { status: "in-progress" as WorkOrder["status"], label: "Start Work" },
      { status: "cancelled" as WorkOrder["status"], label: "Cancel Order" }
    ] as NextStep[]
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 hover:border-blue-300 focus:ring-blue-500",
    icon: Play,
    description: "Work is currently being performed",
    allowedTransitions: ["completed", "cancelled", "pending"] as WorkOrder["status"][],
    nextSteps: [
      { status: "completed" as WorkOrder["status"], label: "Complete Work" },
      { status: "cancelled" as WorkOrder["status"], label: "Cancel Work" },
      { status: "pending" as WorkOrder["status"], label: "Pause Work" }
    ] as NextStep[]
  },
  "completed": {
    label: "Completed",
    color: "bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 focus:ring-green-500",
    icon: CheckCircle,
    description: "All work has been completed",
    allowedTransitions: ["in-progress"] as WorkOrder["status"][],
    nextSteps: [
      { status: "in-progress" as WorkOrder["status"], label: "Reopen Work" }
    ] as NextStep[]
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 focus:ring-red-500",
    icon: XCircle,
    description: "Work order has been cancelled",
    allowedTransitions: ["pending", "in-progress"] as WorkOrder["status"][],
    nextSteps: [
      { status: "pending" as WorkOrder["status"], label: "Reactivate Order" },
      { status: "in-progress" as WorkOrder["status"], label: "Resume Work" }
    ] as NextStep[]
  }
};

export const getStatusIcon = (status: WorkOrder["status"]) => {
  return statusConfig[status].icon;
};

export const validateStatusTransition = (
  currentStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"]
): boolean => {
  if (currentStatus === newStatus) return false;
  return statusConfig[currentStatus].allowedTransitions.includes(newStatus);
};

export const isStatusTransitionAllowed = validateStatusTransition;

export const getNextStatusOptions = (
  currentStatus: WorkOrder["status"]
): Array<{ status: WorkOrder["status"]; label: string }> => {
  return statusConfig[currentStatus].nextSteps;
};

export const generateStatusChangeDescription = (
  oldStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"], 
  userName: string
): string => {
  const oldStatusLabel = statusConfig[oldStatus].label;
  const newStatusLabel = statusConfig[newStatus].label;
  return `Work order status changed from ${oldStatusLabel} to ${newStatusLabel} by ${userName}`;
};

export const generateStatusChangeMessage = generateStatusChangeDescription;

export const handleStatusTransition = (
  workOrder: WorkOrder, 
  newStatus: WorkOrder["status"]
): Partial<WorkOrder> => {
  if (!validateStatusTransition(workOrder.status, newStatus)) {
    throw new Error(`Invalid status transition from ${workOrder.status} to ${newStatus}`);
  }

  const updates: Partial<WorkOrder> = {
    status: newStatus
  };

  switch (newStatus) {
    case "in-progress":
      if (!workOrder.startTime) {
        updates.startTime = new Date().toISOString();
      }
      break;
    case "completed":
    case "cancelled":
      updates.endTime = new Date().toISOString();
      break;
  }

  return updates;
};
