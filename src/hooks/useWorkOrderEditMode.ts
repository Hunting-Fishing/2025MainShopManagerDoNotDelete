
import { WorkOrder } from '@/types/workOrder';

export function useWorkOrderEditMode(workOrder: WorkOrder | null | undefined) {
  // Work order is editable if it exists and status is not 'completed'
  const isEditMode = workOrder ? workOrder.status !== 'completed' : false;
  
  return {
    isEditMode,
    isReadOnly: !isEditMode,
    statusMessage: isEditMode ? 'Editable' : 'Read Only - Completed'
  };
}
