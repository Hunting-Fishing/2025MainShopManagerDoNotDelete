
import React, { useState, useEffect } from 'react';
import { WorkOrderInventoryItem } from '@/types/workOrder';
import { WorkOrderPartsEstimator } from './WorkOrderPartsEstimator';

export interface PartsSelectorProps {
  workOrderId: string;
  onPartsChange: (parts: any[]) => void;
  readOnly?: boolean;
}

export function PartsSelector({
  workOrderId,
  onPartsChange,
  readOnly = false
}: PartsSelectorProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>([]);

  // Fetch items for the work order on initial load
  useEffect(() => {
    const fetchItems = async () => {
      try {
        // Fetch items from the API
        const response = await fetch(`/api/work-orders/${workOrderId}/inventory`);
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (error) {
        console.error("Error fetching inventory items:", error);
      }
    };

    if (workOrderId) {
      fetchItems();
    }
  }, [workOrderId]);

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
