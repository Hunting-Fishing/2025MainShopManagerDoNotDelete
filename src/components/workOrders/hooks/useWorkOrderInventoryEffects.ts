
import { useEffect } from 'react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { updateWorkOrderInventoryItems } from '@/services/workOrderService';

export function useWorkOrderInventoryEffects(workOrderId: string, items: WorkOrderInventoryItem[]) {
  useEffect(() => {
    const updateInventory = async () => {
      await updateWorkOrderInventoryItems(workOrderId, items);
    };
    
    updateInventory();
  }, [workOrderId, items]);
}
