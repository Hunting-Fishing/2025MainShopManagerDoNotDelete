
import React, { useState, useEffect } from 'react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderPartsEstimator } from './WorkOrderPartsEstimator';

export interface PartsSelectorProps {
  workOrderId: string;
  initialItems?: WorkOrderInventoryItem[];
  onPartsChange: (parts: any[]) => void;
  readOnly?: boolean;
}

export function PartsSelector({
  workOrderId,
  initialItems = [],
  onPartsChange,
  readOnly = false
}: PartsSelectorProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(initialItems);

  useEffect(() => {
    setItems(initialItems || []);
  }, [initialItems]);

  const handleItemsChange = (updatedItems: WorkOrderInventoryItem[]) => {
    setItems(updatedItems);
    onPartsChange(updatedItems);
  };

  return (
    <WorkOrderPartsEstimator
      items={items}
      onItemsChange={handleItemsChange}
      readOnly={readOnly}
    />
  );
}
