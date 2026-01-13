import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { Container } from 'lucide-react';

interface CustomerTanksTabProps {
  customerId: string;
}

export function CustomerTanksTab({ customerId }: CustomerTanksTabProps) {
  const { data: tanks, isLoading } = useQuery({
    queryKey: ['water-delivery-customer-tanks', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_delivery_tanks')
        .select('*, water_delivery_locations(name)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!customerId,
  });

  if (isLoading) {
    return <div className="space-y-4">{[1,2,3].map(i => <Skeleton key={i} className="h-24 w-full" />)}</div>;
  }

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Tanks</h3>
      {tanks && tanks.length > 0 ? (
        <div className="grid gap-4 md:grid-cols-2">
          {tanks.map((tank) => (
            <Card key={tank.id}>
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  <Container className="h-5 w-5 text-cyan-600 mt-1" />
                  <div className="flex-1">
                    <p className="font-medium">{tank.tank_name || `Tank ${tank.id.slice(0, 8)}`}</p>
                    <p className="text-sm text-muted-foreground">Capacity: {tank.capacity_gallons?.toLocaleString()} gal</p>
                    {tank.water_delivery_locations && (
                      <p className="text-xs text-muted-foreground">{(tank.water_delivery_locations as any).name}</p>
                    )}
                  </div>
                  <Badge variant="outline">{tank.tank_type || 'Standard'}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No tanks registered</CardContent></Card>
      )}
    </div>
  );
}
