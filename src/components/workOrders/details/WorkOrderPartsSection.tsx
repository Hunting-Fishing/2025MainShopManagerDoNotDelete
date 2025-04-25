
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Package } from 'lucide-react';
import { PartsSelector } from '../parts/PartsSelector';
import { WorkOrder } from '@/types/workOrder';
import { usePartsInventory } from '@/hooks/inventory/usePartsInventory';

interface WorkOrderPartsSectionProps {
  workOrder: WorkOrder;
  onPartsChange?: (parts: any[]) => void;
  readOnly?: boolean;
}

export function WorkOrderPartsSection({ 
  workOrder, 
  onPartsChange,
  readOnly = false 
}: WorkOrderPartsSectionProps) {
  const handlePartsChange = (parts: any[]) => {
    if (onPartsChange) {
      onPartsChange(parts);
    }
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
        <PartsSelector
          workOrderId={workOrder.id}
          items={workOrder.inventoryItems}  // Changed from initialItems to items
          onPartsChange={handlePartsChange}
          readOnly={readOnly}
        />
      </CardContent>
    </Card>
  );
}
