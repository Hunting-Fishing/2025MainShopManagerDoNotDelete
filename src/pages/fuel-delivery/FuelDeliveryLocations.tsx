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
import { Switch } from '@/components/ui/switch';
import { Plus, Search, MapPin, ArrowLeft } from 'lucide-react';
import { useFuelDeliveryLocations, useCreateFuelDeliveryLocation, useFuelDeliveryCustomers } from '@/hooks/useFuelDelivery';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function FuelDeliveryLocations() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: locations, isLoading } = useFuelDeliveryLocations();
  const { data: customers } = useFuelDeliveryCustomers();
  const createLocation = useCreateFuelDeliveryLocation();

  const [formData, setFormData] = useState({
    customer_id: '',
    location_name: '',
    address: '',
    city: '',
    state: '',
    zip_code: '',
    tank_capacity_gallons: '',
    current_level_gallons: '',
    tank_type: '',
    fuel_type: '',
    access_instructions: '',
    contact_on_site: '',
    contact_phone: '',
    requires_appointment: false
  });

  const filteredLocations = locations?.filter(location =>
    location.location_name?.toLowerCase().includes(search.toLowerCase()) ||
    location.address?.toLowerCase().includes(search.toLowerCase()) ||
    location.fuel_delivery_customers?.company_name?.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createLocation.mutateAsync({
      ...formData,
      customer_id: formData.customer_id || undefined,
      tank_capacity_gallons: parseFloat(formData.tank_capacity_gallons) || undefined,
      current_level_gallons: parseFloat(formData.current_level_gallons) || undefined
    });
    setIsDialogOpen(false);
    setFormData({
      customer_id: '',
      location_name: '',
      address: '',
      city: '',
      state: '',
      zip_code: '',
      tank_capacity_gallons: '',
      current_level_gallons: '',
      tank_type: '',
      fuel_type: '',
      access_instructions: '',
      contact_on_site: '',
      contact_phone: '',
      requires_appointment: false
    });
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
              <MapPin className="h-8 w-8 text-orange-600" />
              Delivery Locations
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage customer tank locations and delivery sites
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Location
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add Delivery Location</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2 col-span-2">
                    <Label>Customer</Label>
                    <Select value={formData.customer_id} onValueChange={(v) => setFormData(prev => ({ ...prev, customer_id: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select customer" />
                      </SelectTrigger>
                      <SelectContent>
                        {customers?.map(customer => (
                          <SelectItem key={customer.id} value={customer.id}>
                            {customer.company_name || customer.contact_name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Location Name *</Label>
                    <Input
                      value={formData.location_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, location_name: e.target.value }))}
                      placeholder="Main Farm Tank"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Fuel Type *</Label>
                    <Select value={formData.fuel_type} onValueChange={(v) => setFormData(prev => ({ ...prev, fuel_type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select fuel type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="diesel">Diesel</SelectItem>
                        <SelectItem value="gasoline">Gasoline</SelectItem>
                        <SelectItem value="heating_oil">Heating Oil</SelectItem>
                        <SelectItem value="propane">Propane</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Address *</Label>
                    <Input
                      value={formData.address}
                      onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                      placeholder="123 Farm Road"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>City</Label>
                    <Input
                      value={formData.city}
                      onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                      placeholder="Springfield"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-2">
                      <Label>State</Label>
                      <Input
                        value={formData.state}
                        onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                        placeholder="TX"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>ZIP</Label>
                      <Input
                        value={formData.zip_code}
                        onChange={(e) => setFormData(prev => ({ ...prev, zip_code: e.target.value }))}
                        placeholder="12345"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Tank Capacity (gal)</Label>
                    <Input
                      type="number"
                      value={formData.tank_capacity_gallons}
                      onChange={(e) => setFormData(prev => ({ ...prev, tank_capacity_gallons: e.target.value }))}
                      placeholder="500"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Tank Type</Label>
                    <Select value={formData.tank_type} onValueChange={(v) => setFormData(prev => ({ ...prev, tank_type: v }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="above_ground">Above Ground</SelectItem>
                        <SelectItem value="underground">Underground</SelectItem>
                        <SelectItem value="portable">Portable</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>On-Site Contact</Label>
                    <Input
                      value={formData.contact_on_site}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_on_site: e.target.value }))}
                      placeholder="John Smith"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Phone</Label>
                    <Input
                      value={formData.contact_phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <div className="flex items-center justify-between">
                      <Label>Requires Appointment</Label>
                      <Switch
                        checked={formData.requires_appointment}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, requires_appointment: v }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Access Instructions</Label>
                    <Textarea
                      value={formData.access_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, access_instructions: e.target.value }))}
                      placeholder="Gate code, directions, etc..."
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createLocation.isPending}>
                    {createLocation.isPending ? 'Creating...' : 'Add Location'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Search */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search locations..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Locations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredLocations && filteredLocations.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Location</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead>Address</TableHead>
                  <TableHead>Fuel Type</TableHead>
                  <TableHead>Tank Capacity</TableHead>
                  <TableHead>Last Delivery</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLocations.map((location) => (
                  <TableRow key={location.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{location.location_name}</TableCell>
                    <TableCell>
                      {location.fuel_delivery_customers?.company_name || location.fuel_delivery_customers?.contact_name || '-'}
                    </TableCell>
                    <TableCell>
                      {location.address}, {location.city} {location.state}
                    </TableCell>
                    <TableCell className="capitalize">{location.fuel_type?.replace('_', ' ')}</TableCell>
                    <TableCell>{location.tank_capacity_gallons?.toLocaleString() || '-'} gal</TableCell>
                    <TableCell>
                      {location.last_delivery_date 
                        ? format(new Date(location.last_delivery_date), 'MMM d, yyyy') 
                        : 'Never'}
                    </TableCell>
                    <TableCell>
                      {location.is_active ? (
                        <Badge className="bg-green-500">Active</Badge>
                      ) : (
                        <Badge variant="outline">Inactive</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <MapPin className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No locations found</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                Add your first location
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
