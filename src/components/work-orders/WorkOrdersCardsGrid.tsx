import React from 'react';
import type { WorkOrder } from '@/types/workOrder';
import { WorkOrderCard } from './WorkOrderCard';
import { Button } from '@/components/ui/button';
import { ClipboardList } from 'lucide-react';
import { Link } from 'react-router-dom';

interface WorkOrdersCardsGridProps {
  workOrders: WorkOrder[];
}

export function WorkOrdersCardsGrid({ workOrders }: WorkOrdersCardsGridProps) {
  if (!workOrders || workOrders.length === 0) {
    return (
      <div className="p-10 text-center border rounded-xl bg-card shadow-sm">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
          <ClipboardList className="h-6 w-6 text-muted-foreground" aria-hidden />
        </div>
        <p className="text-foreground font-medium">No work orders found</p>
        <p className="text-sm text-muted-foreground mt-1">Create your first work order to get started.</p>
        <Button asChild className="mt-4">
          <Link to="/work-orders/create">Create Work Order</Link>
        </Button>
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
