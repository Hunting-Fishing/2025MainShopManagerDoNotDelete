
import React from 'react';
import { WorkOrder } from '@/types/workOrder';
import { WorkOrderCommunications } from '../communications/WorkOrderCommunications';

interface WorkOrderCommunicationsTabProps {
  workOrder: WorkOrder;
  isEditMode: boolean;
}

export function WorkOrderCommunicationsTab({
  workOrder,
  isEditMode
}: WorkOrderCommunicationsTabProps) {
  return <WorkOrderCommunications workOrder={workOrder} />;
}
