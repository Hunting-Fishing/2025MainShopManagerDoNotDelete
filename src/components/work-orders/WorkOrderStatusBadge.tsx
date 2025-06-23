
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WorkOrderStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'pending': { label: 'Pending', variant: 'secondary' },
  'in_progress': { label: 'In Progress', variant: 'default' },
  'completed': { label: 'Completed', variant: 'outline' },
  'cancelled': { label: 'Cancelled', variant: 'destructive' },
  'on_hold': { label: 'On Hold', variant: 'secondary' },
  'ready_for_pickup': { label: 'Ready for Pickup', variant: 'outline' },
  'picked_up': { label: 'Picked Up', variant: 'outline' }
};

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, variant: 'secondary' as const };
  
  return (
    <Badge variant={config.variant}>
      {config.label}
    </Badge>
  );
}
