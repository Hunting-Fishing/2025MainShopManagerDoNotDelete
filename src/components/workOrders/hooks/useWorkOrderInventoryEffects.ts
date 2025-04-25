
import { useEffect } from 'react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { updateWorkOrderInventoryItems } from '@/services/inventoryService';

export function useWorkOrderInventoryEffects(workOrderId: string, items: WorkOrderInventoryItem[]) {
  useEffect(() => {
    const updateInventory = async () => {
      if (workOrderId) {
        await updateWorkOrderInventoryItems(workOrderId, items);
      }
    };
    
    updateInventory();
  }, [workOrderId, items]);
}
