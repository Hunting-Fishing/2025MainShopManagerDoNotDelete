import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { MapPin, Plus } from 'lucide-react';

interface CustomerLocationsTabProps {
  customerId: string;
}

export function CustomerLocationsTab({ customerId }: CustomerLocationsTabProps) {
  const { data: locations, isLoading } = useQuery({
    queryKey: ['water-delivery-customer-locations', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_delivery_locations')
        .select('*')
        .eq('customer_id', customerId)
        .order('location_name');
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
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Delivery Locations</h3>
        <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Location</Button>
      </div>
      {locations && locations.length > 0 ? (
        <div className="grid gap-4">
          {locations.map((loc) => (
            <Card key={loc.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-cyan-600 mt-1" />
                    <div>
                      <p className="font-medium">{loc.location_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {[loc.address, loc.city, loc.state, loc.zip].filter(Boolean).join(', ')}
                      </p>
                    </div>
                  </div>
                  <Badge variant={loc.is_active ? 'default' : 'secondary'}>
                    {loc.is_active ? 'Active' : 'Inactive'}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card><CardContent className="p-8 text-center text-muted-foreground">No locations found</CardContent></Card>
      )}
    </div>
  );
}
