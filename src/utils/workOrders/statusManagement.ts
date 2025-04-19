
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { recordWorkOrderActivity } from "./activity";

// Define valid status transitions
const validTransitions: Record<WorkOrderStatusType, WorkOrderStatusType[]> = {
  "pending": ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  "completed": ["in-progress"], // Allow reopening if needed
  "cancelled": ["pending"] // Allow reactivating cancelled orders
};

// Check if a status transition is valid
export const isValidStatusTransition = (
  currentStatus: WorkOrderStatusType,
  newStatus: WorkOrderStatusType
): boolean => {
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

// Function to update work order status with validation
export const updateWorkOrderStatus = async (
  workOrder: WorkOrder,
  newStatus: WorkOrderStatusType,
  userId: string,
  userName: string
): Promise<boolean> => {
  if (!isValidStatusTransition(workOrder.status, newStatus)) {
    throw new Error(`Invalid status transition from ${workOrder.status} to ${newStatus}`);
  }

  try {
    // Record the activity
    await recordWorkOrderActivity(
      "Status Changed",
      workOrder.id,
      userId,
      userName
    );

    return true;
  } catch (error) {
    console.error("Error updating work order status:", error);
    return false;
  }
};
