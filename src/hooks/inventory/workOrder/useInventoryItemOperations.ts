
import { useState, useCallback } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormFieldValues, WorkOrderInventoryItem } from '@/types/workOrder';
import { useInventoryManager } from '@/hooks/inventory/useInventoryManager';
import { InventoryItemExtended } from '@/types/inventory';

/**
 * Hook to manage inventory item operations for work order forms
 */
export const useInventoryItemOperations = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const inventoryManager = useInventoryManager();
  
  // Get selected items from form
  const selectedItems = form.watch('inventoryItems') || [];
  
  const handleAddItem = useCallback(async (item: InventoryItemExtended, quantity: number) => {
    // Check if the item is available in the requested quantity
    const isAvailable = await inventoryManager.checkItemAvailability(item.id, quantity);
    
    if (!isAvailable) {
      return false;
    }
    
    const newItem: WorkOrderInventoryItem = {
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      quantity: quantity,
      unitPrice: item.unitPrice,
      itemStatus: 'in-stock',
    };
    
    const currentItems = form.getValues('inventoryItems') || [];
    form.setValue('inventoryItems', [...currentItems, newItem]);
    
    return true;
  }, [form, inventoryManager]);
  
  const handleRemoveItem = useCallback((index: number) => {
    const currentItems = [...(form.getValues('inventoryItems') || [])];
    currentItems.splice(index, 1);
    form.setValue('inventoryItems', currentItems);
  }, [form]);
  
  const handleUpdateQuantity = useCallback((index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const currentItems = [...(form.getValues('inventoryItems') || [])];
    currentItems[index].quantity = newQuantity;
    form.setValue('inventoryItems', currentItems);
  }, [form]);
  
  return {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  };
};
