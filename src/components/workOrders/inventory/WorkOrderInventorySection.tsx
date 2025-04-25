import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { WorkOrderInventoryField } from './WorkOrderInventoryField';
import { useForm } from 'react-hook-form';
import { useInventoryStatus } from '@/hooks/inventory/useInventoryStatus';
import { WorkOrderInventoryItem } from '@/types/workOrder';

interface WorkOrderInventorySectionProps {
  items: WorkOrderInventoryItem[];
  onItemsChange: (items: WorkOrderInventoryItem[]) => void;
  readOnly?: boolean;
}

export function WorkOrderInventorySection({
  items,
  onItemsChange,
  readOnly = false
}: WorkOrderInventorySectionProps) {
  const form = useForm({
    defaultValues: {
      inventoryItems: items || []
    }
  });
  
  // Update useInventoryStatus call to pass an empty object
  const inventoryStatus = useInventoryStatus({});
  
  const handleInventoryChange = (updatedItems: WorkOrderInventoryItem[]) => {
    onItemsChange(updatedItems);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-medium flex items-center gap-2">
          <Package className="h-5 w-5 text-muted-foreground" />
          Parts & Materials
        </CardTitle>
      </CardHeader>
      <CardContent>
        <WorkOrderInventoryField
          form={form}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}
