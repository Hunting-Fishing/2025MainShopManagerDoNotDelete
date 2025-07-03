
import React from 'react';
import { Badge } from '@/components/ui/badge';

interface WorkOrderStatusBadgeProps {
  status: string;
}

const statusConfig: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-warning/20 text-warning border-warning/30 hover:bg-warning/30' },
  'in_progress': { label: 'In Progress', classes: 'bg-primary/20 text-primary border-primary/30 hover:bg-primary/30' },
  'completed': { label: 'Completed', classes: 'bg-success/20 text-success border-success/30 hover:bg-success/30' },
  'cancelled': { label: 'Cancelled', classes: 'bg-destructive/20 text-destructive border-destructive/30 hover:bg-destructive/30' },
  'on_hold': { label: 'On Hold', classes: 'bg-accent/20 text-accent-foreground border-accent/30 hover:bg-accent/30' },
  'ready_for_pickup': { label: 'Ready for Pickup', classes: 'bg-info/20 text-info border-info/30 hover:bg-info/30' },
  'picked_up': { label: 'Picked Up', classes: 'bg-success/20 text-success border-success/30 hover:bg-success/30' }
};

export function WorkOrderStatusBadge({ status }: WorkOrderStatusBadgeProps) {
  const config = statusConfig[status] || { label: status, classes: 'bg-muted/20 text-muted-foreground border-muted/30' };
  
  return (
    <Badge className={`font-medium px-3 py-1 rounded-full border transition-all duration-200 ${config.classes}`}>
      {config.label}
    </Badge>
  );
}
