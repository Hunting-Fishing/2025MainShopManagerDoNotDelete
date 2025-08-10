import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { CalendarClock, Car, DollarSign, Hash, User2 } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import type { WorkOrder } from '@/types/workOrder';

interface WorkOrderCardProps {
  wo: WorkOrder;
}

function getStatusVariant(status?: string) {
  const s = (status ?? '').toLowerCase();
  if (s.includes('open') || s.includes('in-progress') || s.includes('progress')) return 'default' as const;
  if (s.includes('pending') || s.includes('waiting')) return 'secondary' as const;
  if (s.includes('completed') || s.includes('closed')) return 'outline' as const;
  if (s.includes('cancel')) return 'destructive' as const;
  return 'secondary' as const;
}

export function WorkOrderCard({ wo }: WorkOrderCardProps) {
  const createdAt = wo.created_at ? new Date(wo.created_at) : undefined;
  const vehicle = wo.vehicle_make || wo.vehicle_model || wo.vehicle_year ?
    `${wo.vehicle_year ?? ''} ${wo.vehicle_make ?? ''} ${wo.vehicle_model ?? ''}`.trim() :
    typeof wo.vehicle === 'string' ? wo.vehicle : '';
  const customer = wo.customer_name || [wo.customer_first_name, wo.customer_last_name].filter(Boolean).join(' ') || wo.customer || 'Customer';
  const number = wo.work_order_number || wo.id;

  return (
    <Card className="h-full hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Hash className="h-4 w-4" />
            <span className="font-medium">{number}</span>
          </div>
          <Badge variant={getStatusVariant(String(wo.status))} className="capitalize">
            {String(wo.status).replace(/_/g, ' ')}
          </Badge>
        </div>
        <CardTitle className="text-base leading-snug mt-2">
          {wo.description || 'Work order'}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <User2 className="h-4 w-4" />
          <span className="line-clamp-1">{customer}</span>
        </div>
        {vehicle && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <Car className="h-4 w-4" />
            <span className="line-clamp-1">{vehicle}</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-muted-foreground">
          <CalendarClock className="h-4 w-4" />
          <span>
            {createdAt
              ? `${format(createdAt, 'PP')} • ${formatDistanceToNow(createdAt, { addSuffix: true })}`
              : '—'}
          </span>
        </div>
        {typeof wo.total_cost === 'number' && (
          <div className="flex items-center gap-2 text-muted-foreground">
            <DollarSign className="h-4 w-4" />
            <span className="font-medium">${wo.total_cost.toFixed(2)}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-0">
        <Button asChild className="w-full" variant="secondary">
          <Link to={`/work-orders/${wo.id}`}>View</Link>
        </Button>
      </CardFooter>
    </Card>
  );
}
