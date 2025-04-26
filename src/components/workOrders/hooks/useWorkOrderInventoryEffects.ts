
import { useEffect } from 'react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { updateWorkOrderInventoryItems } from '@/services/inventoryService';

export function useWorkOrderInventoryEffects(workOrderId: string, items: WorkOrderInventoryItem[]) {
  useEffect(() => {
    const updateInventory = async () => {
      if (workOrderId && items.length > 0) {
        // Format items to match the expected interface
        const formattedItems = items.map(item => ({
          inventoryId: item.id,
          quantity: item.quantity
        }));
        
        await updateWorkOrderInventoryItems(workOrderId, formattedItems);
      }
    };
    
    updateInventory();
  }, [workOrderId, items]);
}
