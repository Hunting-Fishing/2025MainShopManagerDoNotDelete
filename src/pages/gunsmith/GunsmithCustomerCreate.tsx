import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, Users, Save, Loader2, CheckCircle, Crosshair } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';

export default function GunsmithCustomerCreate() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();
  const [createdCustomerId, setCreatedCustomerId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    preferred_contact: 'phone',
    notes: ''
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!shopId) {
        throw new Error('Shop ID not available');
      }
      
      const fullAddress = [formData.address, formData.city, formData.state, formData.zip]
        .filter(Boolean)
        .join(', ');
      
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          shop_id: shopId,
          first_name: formData.first_name,
          last_name: formData.last_name,
          email: formData.email || null,
          phone: formData.phone || null,
          address: fullAddress || null,
          notes: formData.notes || null
        })
        .select()
        .single();
      
      if (error) throw error;
      return customer;
    },
    onSuccess: (customer) => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-customers'] });
      queryClient.invalidateQueries({ queryKey: ['customers'] });
      toast.success('Customer created successfully!');
      setCreatedCustomerId(customer.id);
    },
    onError: (error) => {
      console.error('Error creating customer:', error);
      toast.error('Failed to create customer');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.first_name.trim() || !formData.last_name.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    
    createMutation.mutate();
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Success state - customer created
  if (createdCustomerId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto">
          <Card className="border-amber-500/30">
            <CardContent className="pt-8 pb-8 text-center">
              <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="h-8 w-8 text-green-500" />
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">Customer Created!</h2>
              <p className="text-muted-foreground mb-6">
                {formData.first_name} {formData.last_name} has been added to your customer list.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button 
                  onClick={() => navigate(`/gunsmith/firearms/new?customerId=${createdCustomerId}`)}
                  className="bg-amber-600 hover:bg-amber-700"
                >
                  <Crosshair className="h-4 w-4 mr-2" />
                  Add a Firearm
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => navigate(`/gunsmith/customers/${createdCustomerId}`)}
                  className="border-amber-600/30 text-amber-600 hover:bg-amber-600/10"
                >
                  View Customer Profile
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => navigate('/gunsmith/customers')}
                >
                  Back to Customers
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith/customers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Users className="h-8 w-8 text-amber-600" />
              New Customer
            </h1>
            <p className="text-muted-foreground mt-1">Add a new customer to your gunsmith records</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <Card className="border-amber-500/20">
            <CardHeader>
              <CardTitle>Customer Information</CardTitle>
              <CardDescription>Enter the customer's basic contact information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Name Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="first_name">First Name *</Label>
                  <Input
                    id="first_name"
                    value={formData.first_name}
                    onChange={(e) => handleInputChange('first_name', e.target.value)}
                    placeholder="John"
                    required
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="last_name">Last Name *</Label>
                  <Input
                    id="last_name"
                    value={formData.last_name}
                    onChange={(e) => handleInputChange('last_name', e.target.value)}
                    placeholder="Smith"
                    required
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Contact Row */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    placeholder="(555) 123-4567"
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    placeholder="john@example.com"
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Preferred Contact */}
              <div className="space-y-2">
                <Label htmlFor="preferred_contact">Preferred Contact Method</Label>
                <Select 
                  value={formData.preferred_contact} 
                  onValueChange={(value) => handleInputChange('preferred_contact', value)}
                >
                  <SelectTrigger className="border-amber-500/20 focus:border-amber-500">
                    <SelectValue placeholder="Select contact method" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="phone">Phone</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="text">Text Message</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Address */}
              <div className="space-y-4">
                <Label>Address</Label>
                <Input
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Street Address"
                  className="border-amber-500/20 focus:border-amber-500"
                />
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="col-span-2">
                    <Input
                      value={formData.city}
                      onChange={(e) => handleInputChange('city', e.target.value)}
                      placeholder="City"
                      className="border-amber-500/20 focus:border-amber-500"
                    />
                  </div>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="State"
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                  <Input
                    value={formData.zip}
                    onChange={(e) => handleInputChange('zip', e.target.value)}
                    placeholder="ZIP"
                    className="border-amber-500/20 focus:border-amber-500"
                  />
                </div>
              </div>

              {/* Notes */}
              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => handleInputChange('notes', e.target.value)}
                  placeholder="Any additional notes about this customer..."
                  rows={3}
                  className="border-amber-500/20 focus:border-amber-500"
                />
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end gap-3 mt-6">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => navigate('/gunsmith/customers')}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-amber-600 hover:bg-amber-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Create Customer
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
