import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Search, ArrowLeft, Truck, Droplets } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { useShopId } from '@/hooks/useShopId';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { useWaterUnits } from '@/hooks/water-delivery/useWaterUnits';

export default function WaterDeliveryTrucks() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const { shopId } = useShopId();
  const { formatVolume, getVolumeLabel } = useWaterUnits();

  const { data: trucks, isLoading } = useQuery({
    queryKey: ['water-delivery-trucks', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('water_delivery_trucks')
        .select('*')
        .eq('shop_id', shopId)
        .order('truck_number', { ascending: true });
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId,
  });

  const filteredTrucks = trucks?.filter(truck => 
    truck.truck_number?.toLowerCase().includes(search.toLowerCase()) ||
    truck.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
    truck.make?.toLowerCase().includes(search.toLowerCase())
  );

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
              <Truck className="h-8 w-8 text-cyan-600" />
              Water Tanker Trucks
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage water delivery fleet
            </p>
          </div>
          <Button className="bg-cyan-600 hover:bg-cyan-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Truck
          </Button>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search trucks..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Trucks Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredTrucks && filteredTrucks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Truck #</TableHead>
                  <TableHead>Make/Model</TableHead>
                  <TableHead>License Plate</TableHead>
                  <TableHead>Capacity ({getVolumeLabel()})</TableHead>
                  <TableHead>Tank Material</TableHead>
                  <TableHead>Potable Certified</TableHead>
                  <TableHead>Last Sanitized</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrucks.map((truck) => (
                  <TableRow key={truck.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{truck.truck_number}</TableCell>
                    <TableCell>{truck.make} {truck.model}</TableCell>
                    <TableCell>{truck.license_plate}</TableCell>
                    <TableCell>{formatVolume(truck.tank_capacity_gallons || 0, 0)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{truck.tank_material || 'Steel'}</Badge>
                    </TableCell>
                    <TableCell>
                      {truck.is_potable_certified ? (
                        <Badge className="bg-green-500">Certified</Badge>
                      ) : (
                        <Badge variant="secondary">Not Certified</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {truck.last_sanitized_date 
                        ? format(new Date(truck.last_sanitized_date), 'MMM d, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      <Badge variant={truck.status === 'active' ? 'default' : 'secondary'}>
                        {truck.status || 'Active'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Truck className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No trucks found</p>
              <Button variant="link">Add your first truck</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
