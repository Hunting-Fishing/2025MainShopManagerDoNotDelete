
import { useState } from 'react';
import { toast } from 'sonner';
import { InventoryItemExtended } from '@/types/inventory';
import { WorkOrderInventoryItem } from '@/components/work-orders/inventory/WorkOrderInventoryItem';
import { 
  addInventoryToWorkOrder, 
  removeInventoryFromWorkOrder,
  updateWorkOrderInventoryQuantity
} from '@/services/workOrderService';

export const useInventoryItemOperations = (workOrderId: string) => {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  
  const addInventoryItem = async (item: InventoryItemExtended, quantity = 1) => {
    setIsAdding(true);
    try {
      // Check if we have enough stock
      if (item.quantity && item.quantity < quantity) {
        toast.warning(`Not enough stock available. Only ${item.quantity} items in inventory.`);
        return false;
      }
      
      // Check if item already exists in work order
      const existingItem = items.find(i => i.id === item.id);
      if (existingItem) {
        // Update quantity instead of adding new
        const newQuantity = existingItem.quantity + quantity;
        await updateInventoryQuantity(existingItem.id, newQuantity);
        return true;
      }
      
      // Create new work order inventory item
      const newItem: WorkOrderInventoryItem = {
        id: crypto.randomUUID(),
        work_order_id: workOrderId,
        name: item.name,
        sku: item.sku,
        category: item.category || '',
        quantity,
        unit_price: item.unit_price || 0,
      };
      
      const addedItem = await addInventoryToWorkOrder(workOrderId, newItem);
      
      setItems(current => [...current, addedItem]);
      toast.success(`Added ${item.name} to work order`);
      return true;
    } catch (error) {
      console.error('Error adding inventory to work order:', error);
      toast.error('Failed to add inventory item');
      return false;
    } finally {
      setIsAdding(false);
    }
  };
  
  const addSpecialOrderItem = async (specialOrderItem: Partial<WorkOrderInventoryItem>) => {
    setIsAdding(true);
    try {
      const newItem: WorkOrderInventoryItem = {
        id: crypto.randomUUID(),
        work_order_id: workOrderId,
        name: specialOrderItem.name || 'Special Order Item',
        sku: specialOrderItem.sku || 'SPECIAL-ORDER',
        category: specialOrderItem.category || 'Special Order',
        quantity: specialOrderItem.quantity || 1,
        unit_price: specialOrderItem.unit_price || 0,
      };
      
      const addedItem = await addInventoryToWorkOrder(workOrderId, newItem);
      
      setItems(current => [...current, addedItem]);
      toast.success(`Added special order item to work order`);
      return true;
    } catch (error) {
      console.error('Error adding special order item:', error);
      toast.error('Failed to add special order item');
      return false;
    } finally {
      setIsAdding(false);
    }
  };
  
  const removeInventoryItem = async (itemId: string) => {
    setIsRemoving(true);
    try {
      await removeInventoryFromWorkOrder(workOrderId, itemId);
      setItems(current => current.filter(item => item.id !== itemId));
      toast.success('Item removed from work order');
      return true;
    } catch (error) {
      console.error('Error removing inventory item:', error);
      toast.error('Failed to remove item');
      return false;
    } finally {
      setIsRemoving(false);
    }
  };
  
  const updateInventoryQuantity = async (itemId: string, newQuantity: number) => {
    try {
      if (newQuantity <= 0) {
        await removeInventoryItem(itemId);
        return true;
      }
      
      await updateWorkOrderInventoryQuantity(workOrderId, itemId, newQuantity);
      
      setItems(current => 
        current.map(item => 
          item.id === itemId 
            ? { ...item, quantity: newQuantity }
            : item
        )
      );
      
      toast.success('Quantity updated');
      return true;
    } catch (error) {
      console.error('Error updating inventory quantity:', error);
      toast.error('Failed to update quantity');
      return false;
    }
  };
  
  return {
    items,
    setItems,
    isAdding,
    isRemoving,
    addInventoryItem,
    addSpecialOrderItem,
    removeInventoryItem,
    updateInventoryQuantity
  };
};
