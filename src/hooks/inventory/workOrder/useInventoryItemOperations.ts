
import { useState, useEffect } from 'react';
import { UseFormReturn } from 'react-hook-form';
import { WorkOrderFormFieldValues } from '@/components/work-orders/WorkOrderFormFields';
import { InventoryItemExtended } from '@/types/inventory';
import { getAllInventoryItems } from '@/services/inventoryService';

export function useInventoryItemOperations(form: UseFormReturn<WorkOrderFormFieldValues>) {
  const [isLoading, setIsLoading] = useState(false);
  const [inventoryItems, setInventoryItems] = useState<InventoryItemExtended[]>([]);
  const [selectedItems, setSelectedItems] = useState<{ item: InventoryItemExtended, quantity: number }[]>([]);

  // Fetch inventory items
  const fetchInventoryItems = async () => {
    setIsLoading(true);
    try {
      const items = await getAllInventoryItems();
      setInventoryItems(items);
    } catch (error) {
      console.error("Error fetching inventory items:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize from form data
  useEffect(() => {
    const existingItems = form.getValues('inventoryItems') || [];
    if (existingItems.length > 0) {
      // Convert form items to selected items structure
      fetchInventoryItems().then(() => {
        const itemsWithDetails = existingItems.map((item: any) => {
          const matchingItem = inventoryItems.find(i => i.id === item.id) || {
            id: item.id,
            name: item.name,
            sku: item.sku,
            category: item.category,
            supplier: '',
            quantity: 0,
            unit_price: item.unitPrice,
            reorder_point: 0,
            status: 'Unknown',
            created_at: '',
            updated_at: ''
          };
          
          return {
            item: matchingItem,
            quantity: item.quantity || 1
          };
        });
        
        setSelectedItems(itemsWithDetails);
      });
    }
  }, [form, inventoryItems.length]);

  // Add item to selection
  const addItemToSelection = (item: InventoryItemExtended) => {
    // Check if item already exists
    const existingItemIndex = selectedItems.findIndex(i => i.item.id === item.id);
    
    if (existingItemIndex !== -1) {
      // Update quantity if item already exists
      const updatedItems = [...selectedItems];
      updatedItems[existingItemIndex].quantity += 1;
      setSelectedItems(updatedItems);
    } else {
      // Add new item
      setSelectedItems([...selectedItems, { item, quantity: 1 }]);
    }
    
    // Update form value
    updateFormValue();
  };

  // Update item quantity
  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    
    const updatedItems = selectedItems.map(i => 
      i.item.id === itemId ? { ...i, quantity } : i
    );
    
    setSelectedItems(updatedItems);
    updateFormValue(updatedItems);
  };

  // Remove item from selection
  const removeItem = (itemId: string) => {
    const updatedItems = selectedItems.filter(i => i.item.id !== itemId);
    setSelectedItems(updatedItems);
    updateFormValue(updatedItems);
  };

  // Update form value based on selected items
  const updateFormValue = (items = selectedItems) => {
    const formItems = items.map(i => ({
      id: i.item.id,
      name: i.item.name,
      sku: i.item.sku,
      category: i.item.category,
      quantity: i.quantity,
      unitPrice: i.item.unit_price
    }));
    
    form.setValue('inventoryItems', formItems, { shouldDirty: true });
  };

  return {
    isLoading,
    inventoryItems,
    selectedItems,
    fetchInventoryItems,
    addItemToSelection,
    updateItemQuantity,
    removeItem
  };
}
