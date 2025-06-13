
import React from 'react';
import { WorkOrderDetailsView } from '../WorkOrderDetailsView';
import { WorkOrder } from '@/types/workOrder';

interface WorkOrderDetailsTabsProps {
  workOrder: WorkOrder;
  [key: string]: any; // Accept any other props for backward compatibility
}

// This component now redirects to the consolidated WorkOrderDetailsView
export function WorkOrderDetailsTabs({ workOrder, ...props }: WorkOrderDetailsTabsProps) {
  return <WorkOrderDetailsView workOrderId={workOrder.id} />;
}
