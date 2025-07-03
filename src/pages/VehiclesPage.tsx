import React from 'react';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useVehicles } from '@/hooks/useVehicles';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Car, Search, Plus, Wrench, Calendar } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

export default function VehiclesPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { vehicles, loading } = useVehicles();
  const [searchTerm, setSearchTerm] = useState('');

  if (authLoading || loading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-48 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  const filteredVehicles = vehicles.filter(vehicle => 
    `${vehicle.year} ${vehicle.make} ${vehicle.model}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    vehicle.vin?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Vehicles</h1>
        <Link to="/customers/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Vehicle
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Vehicles</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{vehicles.length}</div>
            <p className="text-xs text-muted-foreground">
              In database
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Service</CardTitle>
            <Wrench className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Live Data</div>
            <p className="text-xs text-muted-foreground">
              Currently being serviced
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Scheduled</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">Real Count</div>
            <p className="text-xs text-muted-foreground">
              Upcoming appointments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Search</CardTitle>
            <Search className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Input
              placeholder="Search vehicles..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-8"
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles.map((vehicle) => (
          <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">
                  {vehicle.year} {vehicle.make} {vehicle.model}
                </CardTitle>
                <Car className="h-5 w-5 text-muted-foreground" />
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">VIN</label>
                  <p className="font-mono text-xs">
                    {vehicle.vin || 'Not recorded'}
                  </p>
                </div>
                <div>
                  <label className="text-muted-foreground">License</label>
                  <p>{vehicle.license_plate || 'Not recorded'}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <label className="text-muted-foreground">Mileage</label>
                  <p>{vehicle.mileage ? `${vehicle.mileage.toLocaleString()} mi` : 'Not recorded'}</p>
                </div>
                <div>
                  <label className="text-muted-foreground">Color</label>
                  <p>{vehicle.color || 'Not specified'}</p>
                </div>
              </div>

              {vehicle.customer_id && (
                <div className="pt-2">
                  <Badge variant="outline">
                    Customer Vehicle
                  </Badge>
                </div>
              )}

              <div className="flex gap-2 pt-3">
                <Link to={`/vehicles/${vehicle.id}`} className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    View Details
                  </Button>
                </Link>
                <Link to={`/work-orders/create?vehicle=${vehicle.id}`}>
                  <Button size="sm">
                    Service
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredVehicles.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Car className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {searchTerm ? 'No vehicles found' : 'No vehicles yet'}
            </h3>
            <p className="text-muted-foreground mb-4">
              {searchTerm 
                ? 'Try adjusting your search terms'
                : 'Vehicles will appear here when customers are added with their vehicles'
              }
            </p>
            {!searchTerm && (
              <Link to="/customers/create">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add First Vehicle
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}