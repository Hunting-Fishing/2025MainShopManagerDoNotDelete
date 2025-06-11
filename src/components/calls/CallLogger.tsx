
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderCommunications } from '@/components/work-orders/communications/WorkOrderCommunications';
import { WorkOrder } from '@/types/workOrder';

interface CallLoggerProps {
  workOrder: WorkOrder;
}

export function CallLogger({ workOrder }: CallLoggerProps) {
  // Use the new integrated communications component
  return <WorkOrderCommunications workOrder={workOrder} />;
}
