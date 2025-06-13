
import React from 'react';
import { WorkOrderDetailsView } from '../WorkOrderDetailsView';

interface WorkOrderDetailsTabsProps {
  workOrderId: string;
}

// This component now redirects to the consolidated WorkOrderDetailsView
export function WorkOrderDetailsTabs({ workOrderId }: WorkOrderDetailsTabsProps) {
  return <WorkOrderDetailsView workOrderId={workOrderId} />;
}
