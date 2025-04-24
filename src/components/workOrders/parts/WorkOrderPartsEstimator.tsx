import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { PlusCircle } from 'lucide-react';
import { PartsTable } from './PartsTable';
import { AddPartsDialog } from './AddPartsDialog';

export interface WorkOrderPartsEstimatorProps {
  items?: WorkOrderInventoryItem[];  // Changed from initialItems to items
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
}

export function WorkOrderPartsEstimator({ 
  items = [], 
  onItemsChange, 
  readOnly = false 
}: WorkOrderPartsEstimatorProps) {
  const [selectedItems, setSelectedItems] = useState<WorkOrderInventoryItem[]>(items);
  const [showAddPartsDialog, setShowAddPartsDialog] = useState(false);

  // Update local state when props change
  useEffect(() => {
    setSelectedItems(items);
  }, [items]);

  const handleAddItems = (newItems: WorkOrderInventoryItem[]) => {
    const updatedItems = [...selectedItems];
    
    newItems.forEach(newItem => {
      const existingItemIndex = updatedItems.findIndex(item => 
        item.sku === newItem.sku && item.itemStatus === newItem.itemStatus
      );
      
      if (existingItemIndex >= 0) {
        // Update existing item quantity if it already exists
        updatedItems[existingItemIndex].quantity += newItem.quantity;
      } else {
        // Otherwise add as new item
        updatedItems.push(newItem);
      }
    });
    
    setSelectedItems(updatedItems);
    onItemsChange(updatedItems);
    setShowAddPartsDialog(false);
  };

  const handleRemoveItem = (index: number) => {
    const updatedItems = [...selectedItems];
    updatedItems.splice(index, 1);
    setSelectedItems(updatedItems);
    onItemsChange(updatedItems);
  };

  const handleUpdateQuantity = (index: number, newQuantity: number) => {
    if (newQuantity < 1) return;
    
    const updatedItems = [...selectedItems];
    updatedItems[index].quantity = newQuantity;
    setSelectedItems(updatedItems);
    onItemsChange(updatedItems);
  };

  return (
    <div className="space-y-4">
      <PartsTable 
        items={selectedItems} 
        onRemoveItem={handleRemoveItem}
        onUpdateQuantity={handleUpdateQuantity}
        readOnly={readOnly}
      />
      
      {!readOnly && (
        <>
          <Button 
            variant="outline" 
            onClick={() => setShowAddPartsDialog(true)} 
            className="w-full"
          >
            <PlusCircle className="h-4 w-4 mr-2" /> Add Parts
          </Button>
          
          <AddPartsDialog
            open={showAddPartsDialog}
            onOpenChange={setShowAddPartsDialog}
            onAddItems={handleAddItems}
          />
        </>
      )}
    </div>
  );
}
