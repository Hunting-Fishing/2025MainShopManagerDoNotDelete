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
import { Plus, Search, Users, ArrowLeft, MapPin } from 'lucide-react';
import { useFuelDeliveryCustomers, useCreateFuelDeliveryCustomer } from '@/hooks/useFuelDelivery';
import { useNavigate } from 'react-router-dom';
import { Skeleton } from '@/components/ui/skeleton';
import { AddressAutocomplete, AddressResult } from '@/components/fuel-delivery/AddressAutocomplete';
import { FuelTypeSelect, CustomerVehicleForm, VehicleFormData } from '@/components/fuel-delivery';
import { supabase } from '@/integrations/supabase/client';

export default function FuelDeliveryCustomers() {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { data: customers, isLoading } = useFuelDeliveryCustomers();
  const createCustomer = useCreateFuelDeliveryCustomer();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    phone: '',
    email: '',
    billing_address: '',
    billing_latitude: null as number | null,
    billing_longitude: null as number | null,
    payment_terms: 'net30',
    credit_limit: '',
    tax_exempt: false,
    auto_delivery: false,
    preferred_fuel_type: '',
    delivery_instructions: '',
    notes: ''
  });

  const [vehicles, setVehicles] = useState<VehicleFormData[]>([]);

  const handleAddressSelect = (result: AddressResult) => {
    setFormData(prev => ({
      ...prev,
      billing_address: result.address,
      billing_longitude: result.coordinates[0],
      billing_latitude: result.coordinates[1],
    }));
  };

  const handleFuelTypeDetected = (fuelType: string) => {
    // Auto-set preferred fuel type if not already set
    if (!formData.preferred_fuel_type) {
      setFormData(prev => ({ ...prev, preferred_fuel_type: fuelType }));
    }
  };

  const filteredCustomers = customers?.filter(customer =>
    customer.company_name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.contact_name?.toLowerCase().includes(search.toLowerCase()) ||
    customer.email?.toLowerCase().includes(search.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      phone: '',
      email: '',
      billing_address: '',
      billing_latitude: null,
      billing_longitude: null,
      payment_terms: 'net30',
      credit_limit: '',
      tax_exempt: false,
      auto_delivery: false,
      preferred_fuel_type: '',
      delivery_instructions: '',
      notes: ''
    });
    setVehicles([]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      // Create customer first
      const newCustomer = await createCustomer.mutateAsync({
        ...formData,
        credit_limit: parseFloat(formData.credit_limit) || 0,
      });

      // If vehicles were added, save them linked to the customer
      if (vehicles.length > 0 && newCustomer?.id) {
        for (const vehicle of vehicles) {
          const { error } = await supabase.from('vehicles').insert({
            customer_id: newCustomer.id,
            owner_type: 'customer',
            vin: vehicle.vin || null,
            year: vehicle.year ? parseInt(vehicle.year) : null,
            make: vehicle.make || null,
            model: vehicle.model || null,
            fuel_type: vehicle.fuel_type || null,
            license_plate: vehicle.license_plate || null,
            color: vehicle.color || null,
            body_type: vehicle.body_style || null,
            notes: vehicle.tank_capacity ? `Tank Capacity: ${vehicle.tank_capacity} gal` : null,
          });
          if (error) throw error;
        }
      }

      setIsDialogOpen(false);
      resetForm();
    } catch (err) {
      // keep dialog open; the mutation already shows a toast
      console.error('Failed to create fuel delivery customer', err);
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
              <Users className="h-8 w-8 text-orange-600" />
              Fuel Delivery Customers
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage fuel delivery customers and accounts
            </p>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Customer
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Customer</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Company Name</Label>
                    <Input
                      value={formData.company_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                      placeholder="ABC Farms Inc."
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Contact Name *</Label>
                    <Input
                      value={formData.contact_name}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                      placeholder="John Smith"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Phone</Label>
                    <Input
                      value={formData.phone}
                      onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="john@example.com"
                    />
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-orange-500" />
                      Billing Address
                    </Label>
                    <AddressAutocomplete
                      value={formData.billing_address}
                      onChange={(address) => setFormData(prev => ({ ...prev, billing_address: address }))}
                      onSelect={handleAddressSelect}
                      placeholder="Start typing an address..."
                    />
                    {formData.billing_latitude && formData.billing_longitude && (
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <span className="inline-block w-2 h-2 rounded-full bg-green-500"></span>
                        Coordinates captured: {formData.billing_latitude.toFixed(4)}, {formData.billing_longitude.toFixed(4)}
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Terms</Label>
                    <Select value={formData.payment_terms} onValueChange={(v) => setFormData(prev => ({ ...prev, payment_terms: v }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cod">COD</SelectItem>
                        <SelectItem value="net15">Net 15</SelectItem>
                        <SelectItem value="net30">Net 30</SelectItem>
                        <SelectItem value="net45">Net 45</SelectItem>
                        <SelectItem value="net60">Net 60</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Credit Limit</Label>
                    <Input
                      type="number"
                      value={formData.credit_limit}
                      onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: e.target.value }))}
                      placeholder="10000"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Fuel Type</Label>
                    <FuelTypeSelect
                      value={formData.preferred_fuel_type}
                      onChange={(v) => setFormData(prev => ({ ...prev, preferred_fuel_type: v }))}
                      placeholder="Select fuel type"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label>Tax Exempt</Label>
                      <Switch
                        checked={formData.tax_exempt}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, tax_exempt: v }))}
                      />
                    </div>
                    <div className="flex items-center justify-between mt-4">
                      <Label>Auto Delivery</Label>
                      <Switch
                        checked={formData.auto_delivery}
                        onCheckedChange={(v) => setFormData(prev => ({ ...prev, auto_delivery: v }))}
                      />
                    </div>
                  </div>
                  <div className="space-y-2 col-span-2">
                    <Label>Delivery Instructions</Label>
                    <Textarea
                      value={formData.delivery_instructions}
                      onChange={(e) => setFormData(prev => ({ ...prev, delivery_instructions: e.target.value }))}
                      placeholder="Special instructions for deliveries..."
                    />
                  </div>

                  {/* Vehicle Section */}
                  <CustomerVehicleForm
                    vehicles={vehicles}
                    onVehiclesChange={setVehicles}
                    onFuelTypeDetected={handleFuelTypeDetected}
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={createCustomer.isPending}>
                    {createCustomer.isPending ? 'Creating...' : 'Create Customer'}
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
              placeholder="Search customers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Customers Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="p-6 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : filteredCustomers && filteredCustomers.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Company</TableHead>
                  <TableHead>Contact</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Terms</TableHead>
                  <TableHead>Balance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCustomers.map((customer) => (
                  <TableRow key={customer.id} className="cursor-pointer hover:bg-muted/50">
                    <TableCell className="font-medium">{customer.company_name || '-'}</TableCell>
                    <TableCell>{customer.contact_name}</TableCell>
                    <TableCell>{customer.phone || '-'}</TableCell>
                    <TableCell>{customer.email || '-'}</TableCell>
                    <TableCell className="uppercase">{customer.payment_terms}</TableCell>
                    <TableCell>${customer.current_balance?.toLocaleString() || '0'}</TableCell>
                    <TableCell>
                      {customer.is_active ? (
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
              <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
              <p>No customers found</p>
              <Button variant="link" onClick={() => setIsDialogOpen(true)}>
                Add your first customer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
