import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Loader2, MapPin, Clock, CheckCircle2, Navigation } from 'lucide-react';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function SepticDriverApp() {
  const { shopId } = useShopId();
  const today = format(new Date(), 'yyyy-MM-dd');

  const { data: todayOrders = [], isLoading } = useQuery({
    queryKey: ['septic-driver-today', shopId, today],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('septic_service_orders')
        .select('id, order_number, service_type, status, scheduled_date, scheduled_time, location_address, customer_id, customers(first_name, last_name)')
        .eq('shop_id', shopId)
        .eq('scheduled_date', today)
        .in('status', ['scheduled', 'in_progress'])
        .order('scheduled_time');
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const statusColors: Record<string, string> = {
    scheduled: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
    in_progress: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
  };

  return (
    <div className="p-4 md:p-6 space-y-6 max-w-lg mx-auto">
      <div>
        <h1 className="text-2xl font-bold">Today's Jobs</h1>
        <p className="text-muted-foreground text-sm">{format(new Date(), 'EEEE, MMMM d, yyyy')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-muted-foreground" /></div>
      ) : todayOrders.length === 0 ? (
        <Card><CardContent className="p-12 text-center"><CheckCircle2 className="h-12 w-12 mx-auto mb-4 text-green-500 opacity-50" /><p className="text-muted-foreground">No jobs scheduled for today.</p></CardContent></Card>
      ) : (
        <div className="space-y-4">
          {todayOrders.map((order: any, idx: number) => {
            const cust = order.customers as any;
            return (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-lg">#{idx + 1}</span>
                        <Badge className={statusColors[order.status] || ''}>{order.status?.replace('_', ' ')}</Badge>
                      </div>
                      {cust && <p className="font-medium mt-1">{cust.first_name} {cust.last_name}</p>}
                      <p className="text-xs text-muted-foreground capitalize mt-1">{order.service_type?.replace('_', ' ')}</p>
                    </div>
                    {order.scheduled_time && (
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />{order.scheduled_time}
                      </div>
                    )}
                  </div>
                  {order.location_address && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span className="text-muted-foreground">{order.location_address}</span>
                    </div>
                  )}
                  <div className="flex gap-2">
                    {order.location_address && (
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(order.location_address)}`, '_blank')}>
                        <Navigation className="h-4 w-4 mr-1" />Navigate
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
