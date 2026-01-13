import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { Loader2 } from 'lucide-react';
import { AddressAutocomplete } from '@/components/ui/address-autocomplete';

interface AddWaterDeliveryCustomerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddWaterDeliveryCustomerDialog({
  open,
  onOpenChange,
  onSuccess,
}: AddWaterDeliveryCustomerDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  const [formData, setFormData] = useState({
    company_name: '',
    contact_name: '',
    email: '',
    phone: '',
    billing_address: '',
    billing_city: '',
    billing_state: '',
    billing_zip: '',
    is_commercial: false,
    payment_terms: 'COD',
    credit_limit: 0,
    requires_po: false,
    tax_exempt: false,
    tax_exempt_number: '',
    portal_enabled: false,
    portal_pin: '',
    notes: '',
  });

  const createMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!shopId) throw new Error('Shop ID required');
      
      const { data: customer, error } = await supabase
        .from('water_delivery_customers')
        .insert({
          shop_id: shopId,
          company_name: data.company_name || null,
          contact_name: data.contact_name,
          name: data.contact_name,
          email: data.email || null,
          phone: data.phone || null,
          billing_address: data.billing_address || null,
          billing_city: data.billing_city || null,
          billing_state: data.billing_state || null,
          billing_zip: data.billing_zip || null,
          is_commercial: data.is_commercial,
          payment_terms: data.payment_terms,
          credit_limit: data.credit_limit,
          requires_po: data.requires_po,
          tax_exempt: data.tax_exempt,
          tax_exempt_number: data.tax_exempt_number || null,
          portal_enabled: data.portal_enabled,
          portal_pin: data.portal_pin || null,
          notes: data.notes || null,
          is_active: true,
        })
        .select()
        .single();

      if (error) throw error;
      return customer;
    },
    onSuccess: () => {
      toast({ title: 'Customer created successfully' });
      queryClient.invalidateQueries({ queryKey: ['water-delivery-customers'] });
      onSuccess?.();
      onOpenChange(false);
      resetForm();
    },
    onError: (error) => {
      toast({
        title: 'Error creating customer',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const resetForm = () => {
    setFormData({
      company_name: '',
      contact_name: '',
      email: '',
      phone: '',
      billing_address: '',
      billing_city: '',
      billing_state: '',
      billing_zip: '',
      is_commercial: false,
      payment_terms: 'COD',
      credit_limit: 0,
      requires_po: false,
      tax_exempt: false,
      tax_exempt_number: '',
      portal_enabled: false,
      portal_pin: '',
      notes: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.contact_name.trim()) {
      toast({ title: 'Contact name is required', variant: 'destructive' });
      return;
    }
    createMutation.mutate(formData);
  };

  const generatePin = () => {
    const pin = Math.floor(1000 + Math.random() * 9000).toString();
    setFormData(prev => ({ ...prev, portal_pin: pin }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Customer</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Basic Info</TabsTrigger>
              <TabsTrigger value="billing">Billing</TabsTrigger>
              <TabsTrigger value="account">Account</TabsTrigger>
              <TabsTrigger value="portal">Portal</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contact_name">Contact Name *</Label>
                  <Input
                    id="contact_name"
                    value={formData.contact_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, contact_name: e.target.value }))}
                    placeholder="John Smith"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company_name">Company Name</Label>
                  <Input
                    id="company_name"
                    value={formData.company_name}
                    onChange={(e) => setFormData(prev => ({ ...prev, company_name: e.target.value }))}
                    placeholder="ABC Company"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="john@example.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="(555) 123-4567"
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="is_commercial"
                  checked={formData.is_commercial}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_commercial: checked }))}
                />
                <Label htmlFor="is_commercial">Commercial Account</Label>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="Additional notes..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="billing" className="space-y-4 mt-4">
              <div className="space-y-2">
                <Label htmlFor="billing_address">Street Address</Label>
                <AddressAutocomplete
                  id="billing_address"
                  value={formData.billing_address}
                  onChange={(value) => setFormData(prev => ({ ...prev, billing_address: value }))}
                  onAddressSelect={(addr) => {
                    setFormData(prev => ({
                      ...prev,
                      billing_address: addr.street,
                      billing_city: addr.city,
                      billing_state: addr.state,
                      billing_zip: addr.zip,
                    }));
                  }}
                  placeholder="Start typing an address..."
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="billing_city">City</Label>
                  <Input
                    id="billing_city"
                    value={formData.billing_city}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_city: e.target.value }))}
                    placeholder="Anytown"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_state">State</Label>
                  <Input
                    id="billing_state"
                    value={formData.billing_state}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_state: e.target.value }))}
                    placeholder="TX"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="billing_zip">ZIP Code</Label>
                  <Input
                    id="billing_zip"
                    value={formData.billing_zip}
                    onChange={(e) => setFormData(prev => ({ ...prev, billing_zip: e.target.value }))}
                    placeholder="12345"
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="account" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="payment_terms">Payment Terms</Label>
                  <Select
                    value={formData.payment_terms}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, payment_terms: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="COD">COD (Cash on Delivery)</SelectItem>
                      <SelectItem value="Net 15">Net 15</SelectItem>
                      <SelectItem value="Net 30">Net 30</SelectItem>
                      <SelectItem value="Net 45">Net 45</SelectItem>
                      <SelectItem value="Net 60">Net 60</SelectItem>
                      <SelectItem value="Prepaid">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="credit_limit">Credit Limit ($)</Label>
                  <Input
                    id="credit_limit"
                    type="number"
                    min="0"
                    value={formData.credit_limit}
                    onChange={(e) => setFormData(prev => ({ ...prev, credit_limit: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="requires_po"
                  checked={formData.requires_po}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, requires_po: checked }))}
                />
                <Label htmlFor="requires_po">Requires Purchase Order</Label>
              </div>

              <div className="space-y-4">
                <div className="flex items-center space-x-2">
                  <Switch
                    id="tax_exempt"
                    checked={formData.tax_exempt}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, tax_exempt: checked }))}
                  />
                  <Label htmlFor="tax_exempt">Tax Exempt</Label>
                </div>
                {formData.tax_exempt && (
                  <div className="space-y-2">
                    <Label htmlFor="tax_exempt_number">Tax Exempt Number</Label>
                    <Input
                      id="tax_exempt_number"
                      value={formData.tax_exempt_number}
                      onChange={(e) => setFormData(prev => ({ ...prev, tax_exempt_number: e.target.value }))}
                      placeholder="Certificate number"
                    />
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="portal" className="space-y-4 mt-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="portal_enabled"
                  checked={formData.portal_enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, portal_enabled: checked }))}
                />
                <Label htmlFor="portal_enabled">Enable Customer Portal Access</Label>
              </div>

              {formData.portal_enabled && (
                <div className="space-y-2">
                  <Label htmlFor="portal_pin">Portal PIN</Label>
                  <div className="flex gap-2">
                    <Input
                      id="portal_pin"
                      value={formData.portal_pin}
                      onChange={(e) => setFormData(prev => ({ ...prev, portal_pin: e.target.value }))}
                      placeholder="4-digit PIN"
                      maxLength={4}
                    />
                    <Button type="button" variant="outline" onClick={generatePin}>
                      Generate
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Customer will use this PIN along with their email to access the portal.
                  </p>
                </div>
              )}
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Customer
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
