import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Vehicle } from '@/lib/database/repositories/VehicleRepository';
import { Car, MapPin, Calendar } from 'lucide-react';
import { format } from 'date-fns';

interface FleetListProps {
  assets: Vehicle[];
  loading: boolean;
  onUpdate: () => void;
}

export function FleetList({ assets, loading }: FleetListProps) {
  if (loading) {
    return <div className="text-center py-8">Loading fleet...</div>;
  }

  if (assets.length === 0) {
    return (
      <Card>
        <CardContent className="py-8">
          <div className="text-center text-muted-foreground">
            <Car className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>No fleet vehicles yet</p>
            <p className="text-sm">Add your first company vehicle to get started</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'available': return 'bg-green-500';
      case 'in_use': return 'bg-blue-500';
      case 'maintenance': return 'bg-orange-500';
      case 'out_of_service': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {assets.map((asset) => (
        <Card key={asset.id}>
          <CardHeader>
            <CardTitle className="text-lg flex items-center justify-between">
              <span>{asset.year} {asset.make} {asset.model}</span>
              <Badge className={getStatusColor(asset.asset_status || 'available')}>
                {asset.asset_status?.replace('_', ' ')}
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {asset.vin && (
              <div className="text-sm">
                <span className="font-medium">VIN:</span> {asset.vin}
              </div>
            )}
            {asset.license_plate && (
              <div className="text-sm">
                <span className="font-medium">License:</span> {asset.license_plate}
              </div>
            )}
            {asset.asset_category && (
              <div className="flex items-center gap-2 text-sm">
                <Car className="h-4 w-4" />
                <span className="capitalize">{asset.asset_category}</span>
              </div>
            )}
            {asset.current_location && (
              <div className="flex items-center gap-2 text-sm">
                <MapPin className="h-4 w-4" />
                <span>{asset.current_location}</span>
              </div>
            )}
            {asset.checked_out_to && (
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4" />
                <span>Checked out</span>
              </div>
            )}
            {asset.expected_return_date && (
              <div className="text-sm text-muted-foreground">
                Expected return: {format(new Date(asset.expected_return_date), 'MMM d, yyyy')}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
