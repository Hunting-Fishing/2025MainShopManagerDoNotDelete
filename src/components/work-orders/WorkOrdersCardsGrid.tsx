import React from 'react';
import type { WorkOrder } from '@/types/workOrder';
import { WorkOrderCard } from './WorkOrderCard';

interface WorkOrdersCardsGridProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersCardsGrid({ workOrders }: WorkOrdersCardsGridProps) {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="p-8 text-center text-muted-foreground border rounded-md bg-background">
        No work orders found.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
      {workOrders.map((wo) => (
        <WorkOrderCard key={wo.id} wo={wo} />
      ))}
    </div>
  );
}
