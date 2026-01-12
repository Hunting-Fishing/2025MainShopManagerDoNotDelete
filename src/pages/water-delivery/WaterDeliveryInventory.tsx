import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Droplets, TrendingUp, TrendingDown, BarChart3 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

export default function WaterDeliveryInventory() {
  const navigate = useNavigate();
  const { shopId } = useShopId();

  const { data: inventory, isLoading } = useQuery({
    queryKey: ['water-delivery-inventory', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('water_delivery_inventory')
        .select(`
          *,
          water_delivery_products (product_name, water_type)
        `)
        .eq('shop_id', shopId);
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const totalCapacity = inventory?.reduce((sum, item) => sum + (item.max_capacity || 0), 0) || 0;
  const totalCurrent = inventory?.reduce((sum, item) => sum + (item.quantity_gallons || 0), 0) || 0;
  const utilizationPercent = totalCapacity > 0 ? (totalCurrent / totalCapacity) * 100 : 0;

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/water-delivery')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <BarChart3 className="h-8 w-8 text-cyan-600" />
            Water Inventory
          </h1>
          <p className="text-muted-foreground mt-1">
            Track water stock levels and storage
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Capacity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCapacity.toLocaleString()} gal</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Current Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-cyan-600">{totalCurrent.toLocaleString()} gal</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {(totalCapacity - totalCurrent).toLocaleString()} gal
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Inventory by Location */}
      <Card>
        <CardHeader>
          <CardTitle>Inventory by Location</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : inventory && inventory.length > 0 ? (
            <div className="space-y-4">
              {inventory.map((item) => {
                const itemUtil = item.max_capacity > 0 
                  ? (item.quantity_gallons / item.max_capacity) * 100 
                  : 0;
                return (
                  <div key={item.id} className="border rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-semibold">{item.location_type || 'Storage'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {item.water_delivery_products?.product_name} ({item.water_delivery_products?.water_type})
                        </p>
                      </div>
                      <Badge variant={itemUtil > 20 ? 'default' : 'destructive'}>
                        {itemUtil > 20 ? 'Good' : 'Low Stock'}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Stock Level</span>
                        <span>{item.quantity_gallons?.toLocaleString()} / {item.max_capacity?.toLocaleString()} gal</span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${itemUtil > 50 ? 'bg-cyan-500' : itemUtil > 20 ? 'bg-amber-500' : 'bg-red-500'}`}
                          style={{ width: `${Math.min(itemUtil, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Droplets className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No inventory data found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
