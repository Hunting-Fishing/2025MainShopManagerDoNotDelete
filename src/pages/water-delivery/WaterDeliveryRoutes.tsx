import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ArrowLeft, Route, MapPin, Calendar } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

export default function WaterDeliveryRoutes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { shopId } = useShopId();

  const { data: routes, isLoading } = useQuery({
    queryKey: ['water-delivery-routes', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('water_delivery_routes')
        .select(`
          *,
          water_delivery_drivers (first_name, last_name),
          water_delivery_trucks (truck_number)
        `)
        .eq('shop_id', shopId)
        .order('route_date', { ascending: false });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const filteredRoutes = routes?.filter(route => 
    route.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'planned': return <Badge variant="outline">Planned</Badge>;
      case 'cancelled': return <Badge variant="destructive">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-6">
        <Button variant="ghost" onClick={() => navigate('/water-delivery')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Route className="h-8 w-8 text-cyan-600" />
              Delivery Routes
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan and optimize delivery routes
            </p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            New Route
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search routes..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Routes Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredRoutes && filteredRoutes.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Route Name</TableHead>
                  <TableHead>Date</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Truck</TableHead>
                  <TableHead>Stops</TableHead>
                  <TableHead>Est. Distance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredRoutes.map((route) => (
                  <TableRow key={route.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{route.route_name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-muted-foreground" />
                        {route.route_date 
                          ? format(new Date(route.route_date), 'MMM d, yyyy')
                          : '-'}
                      </div>
                    </TableCell>
                    <TableCell>
                      {route.water_delivery_drivers 
                        ? `${route.water_delivery_drivers.first_name} ${route.water_delivery_drivers.last_name}`
                        : '-'}
                    </TableCell>
                    <TableCell>{route.water_delivery_trucks?.truck_number || '-'}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-muted-foreground" />
                        {route.total_stops || 0}
                      </div>
                    </TableCell>
                    <TableCell>{route.total_distance_miles || '-'} mi</TableCell>
                    <TableCell>{getStatusBadge(route.status)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Route className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No routes found</p>
              <Button variant="link">Create your first route</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
