import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, Search, Route, ArrowLeft, MapPin, Map } from 'lucide-react';
import { useFuelDeliveryRoutes, useCreateFuelDeliveryRoute, useFuelDeliveryDrivers, useFuelDeliveryTrucks, useFuelDeliveryLocations } from '@/hooks/useFuelDelivery';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';
import { RouteMap } from '@/components/fuel-delivery/RouteMap';
import { Location } from '@/hooks/useMapbox';

export default function FuelDeliveryRoutes() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('list');
  const { data: routes, isLoading } = useFuelDeliveryRoutes();
  const { data: drivers } = useFuelDeliveryDrivers();
  const { data: trucks } = useFuelDeliveryTrucks();
  const { data: locations } = useFuelDeliveryLocations();
  const createRoute = useCreateFuelDeliveryRoute();

  // Convert locations to map format
  const mapDestinations: Location[] = (locations || [])
    .filter(loc => loc.latitude && loc.longitude)
    .slice(0, 12) // Mapbox optimization supports up to 12 waypoints
    .map(loc => ({
      id: loc.id,
      address: loc.address || '',
      coordinates: [loc.longitude!, loc.latitude!] as [number, number],
      name: loc.location_name || loc.address || 'Unknown',
      priority: 'normal' as const,
    }));

  // Default origin - first location or center of US
  const mapOrigin: [number, number] = mapDestinations.length > 0 
    ? mapDestinations[0].coordinates 
    : [-98.5795, 39.8283];

  const [formData, setFormData] = useState({
    route_name: '',
    route_date: '',
    driver_id: '',
    truck_id: '',
    notes: ''
  });

  const filteredRoutes = routes?.filter(route =>
    route.route_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createRoute.mutateAsync({
      ...formData,
      driver_id: formData.driver_id || undefined,
      truck_id: formData.truck_id || undefined
    });
    setIsDialogOpen(false);
    setFormData({
      route_name: '',
      route_date: '',
      driver_id: '',
      truck_id: '',
      notes: ''
    });
  };

  const getStatusBadge = (status?: string) => {
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
        <Button variant="ghost" onClick={() => navigate('/fuel-delivery')} className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Route className="h-8 w-8 text-purple-600" />
              Delivery Routes
            </h1>
            <p className="text-muted-foreground mt-1">
              Plan and manage delivery routes
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Route
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-lg">
              <DialogHeader>
                <DialogTitle>Create New Route</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Route Name *</Label>
                    <Input
                      value={formData.route_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, route_name: e.target.value }))}
                      placeholder="North County Route"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Route Date *</Label>
                    <Input
                      type="date"
                      value={formData.route_date}
                      onChange={(e) => setFormData(prev => ({ ...prev, route_date: e.target.value }))}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Driver</Label>
                    <Select value={formData.driver_id} onValueChange={(v) => setFormData(prev => ({ ...prev, driver_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select driver" />
                      </SelectTrigger>
                      <SelectContent>
                        {drivers?.filter(d => d.status === 'active').map(driver => (
                          <SelectItem key={driver.id} value={driver.id}>
                            {driver.first_name} {driver.last_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Assign Truck</Label>
                    <Select value={formData.truck_id} onValueChange={(v) => setFormData(prev => ({ ...prev, truck_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select truck" />
                      </SelectTrigger>
                      <SelectContent>
                        {trucks?.filter(t => t.status === 'available').map(truck => (
                          <SelectItem key={truck.id} value={truck.id}>
                            {truck.truck_number} - {truck.make} {truck.model}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Notes</Label>
                    <Textarea
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Route notes..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createRoute.isPending}>
                    {createRoute.isPending ? 'Creating...' : 'Create Route'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Tabs for List/Map view */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="list" className="flex items-center gap-2">
            <Route className="h-4 w-4" />
            Routes List
          </TabsTrigger>
          <TabsTrigger value="map" className="flex items-center gap-2">
            <Map className="h-4 w-4" />
            Route Planner
          </TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {/* Search */}
          <Card>
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
                      <TableHead>Gallons</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredRoutes.map((route) => (
                      <TableRow key={route.id} className="cursor-pointer hover:bg-muted/50">
                        <TableCell className="font-medium">{route.route_name}</TableCell>
                        <TableCell>{format(new Date(route.route_date), 'MMM d, yyyy')}</TableCell>
                        <TableCell>
                          {route.fuel_delivery_drivers 
                            ? `${route.fuel_delivery_drivers.first_name} ${route.fuel_delivery_drivers.last_name}`
                            : '-'}
                        </TableCell>
                        <TableCell>{route.fuel_delivery_trucks?.truck_number || '-'}</TableCell>
                        <TableCell>
                          {route.completed_stops || 0}/{route.total_stops || 0}
                        </TableCell>
                        <TableCell>
                          {route.total_gallons_delivered?.toLocaleString() || 0}/{route.total_gallons_planned?.toLocaleString() || 0}
                        </TableCell>
                        <TableCell>{getStatusBadge(route.status)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Route className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No routes found</p>
                  <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                    Create your first route
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="map" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Map className="h-5 w-5 text-orange-500" />
                Route Optimization Planner
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Optimize delivery routes for multiple stops. Click "Optimize Route" to find the fastest path.
              </p>
            </CardHeader>
            <CardContent>
              {mapDestinations.length > 0 ? (
                <RouteMap
                  origin={mapOrigin}
                  destinations={mapDestinations.slice(1)} // Skip first as it's the origin
                  showOptimizeButton={true}
                  onOptimizedRoute={(result) => {
                    console.log('Route optimized:', result);
                  }}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
                  <MapPin className="h-12 w-12 mb-3 opacity-50" />
                  <p className="font-medium">No Locations with Coordinates</p>
                  <p className="text-sm text-center mt-1">
                    Add locations with latitude/longitude to use route optimization
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => navigate('/fuel-delivery/locations')}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Manage Locations
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
