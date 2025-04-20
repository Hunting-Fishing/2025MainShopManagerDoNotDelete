
import React, { useEffect, useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderPartsEstimator } from "../parts/WorkOrderPartsEstimator";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface WorkOrderInventoryFieldProps {
  form: UseFormReturn<any>;
  readOnly?: boolean;
}

export function WorkOrderInventoryField({ form, readOnly = false }: WorkOrderInventoryFieldProps) {
  const [inventoryItems, setInventoryItems] = useState<WorkOrderInventoryItem[]>(
    form.getValues('inventoryItems') || []
  );

  const handleInventoryItemsChange = (items: WorkOrderInventoryItem[]) => {
    setInventoryItems(items);
    form.setValue('inventoryItems', items);
  };

  return (
    <WorkOrderPartsEstimator
      initialItems={inventoryItems}
      onItemsChange={handleInventoryItemsChange}
      readOnly={readOnly}
    />
  );
}
