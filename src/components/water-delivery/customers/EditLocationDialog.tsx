import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Location {
  id: string;
  location_name: string;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  contact_name: string | null;
  contact_phone: string | null;
  access_instructions: string | null;
  gate_code: string | null;
  delivery_window_start: string | null;
  delivery_window_end: string | null;
  special_equipment_needed: string | null;
  notes: string | null;
  is_primary: boolean | null;
  is_active: boolean | null;
  customer_id: string;
}

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
}

export function EditLocationDialog({ open, onOpenChange, location }: EditLocationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    location_name: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    contact_name: '',
    contact_phone: '',
    access_instructions: '',
    gate_code: '',
    delivery_window_start: '',
    delivery_window_end: '',
    special_equipment_needed: '',
    notes: '',
    is_primary: false,
    is_active: true,
  });

  useEffect(() => {
    if (location) {
      setFormData({
        location_name: location.location_name || '',
        address: location.address || '',
        city: location.city || '',
        state: location.state || '',
        zip: location.zip || '',
        contact_name: location.contact_name || '',
        contact_phone: location.contact_phone || '',
        access_instructions: location.access_instructions || '',
        gate_code: location.gate_code || '',
        delivery_window_start: location.delivery_window_start || '',
        delivery_window_end: location.delivery_window_end || '',
        special_equipment_needed: location.special_equipment_needed || '',
        notes: location.notes || '',
        is_primary: location.is_primary || false,
        is_active: location.is_active ?? true,
      });
    }
  }, [location]);

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!location) return;

      const { error } = await supabase
        .from('water_delivery_locations')
        .update({
          location_name: formData.location_name,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          zip: formData.zip,
          contact_name: formData.contact_name || null,
          contact_phone: formData.contact_phone || null,
          access_instructions: formData.access_instructions || null,
          gate_code: formData.gate_code || null,
          delivery_window_start: formData.delivery_window_start || null,
          delivery_window_end: formData.delivery_window_end || null,
          special_equipment_needed: formData.special_equipment_needed || null,
          notes: formData.notes || null,
          is_primary: formData.is_primary,
          is_active: formData.is_active,
        })
        .eq('id', location.id);

      if (error) throw error;
    },
    onSuccess: () => {
      if (location) {
        queryClient.invalidateQueries({ queryKey: ['water-delivery-customer-locations', location.customer_id] });
      }
      toast.success('Location updated successfully');
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast.error('Failed to update location: ' + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.location_name || !formData.address) {
      toast.error('Location name and address are required');
      return;
    }
    updateMutation.mutate();
  };

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_name">Location Name *</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g., Main Office, Warehouse"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <div className="col-span-2 space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Input
                id="state"
                value={formData.state}
                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="zip">ZIP</Label>
              <Input
                id="zip"
                value={formData.zip}
                onChange={(e) => setFormData({ ...formData, zip: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="contact_name">Site Contact Name</Label>
              <Input
                id="contact_name"
                value={formData.contact_name}
                onChange={(e) => setFormData({ ...formData, contact_name: e.target.value })}
                placeholder="Contact at this location"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contact_phone">Site Contact Phone</Label>
              <Input
                id="contact_phone"
                value={formData.contact_phone}
                onChange={(e) => setFormData({ ...formData, contact_phone: e.target.value })}
                placeholder="(555) 123-4567"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gate_code">Gate Code</Label>
              <Input
                id="gate_code"
                value={formData.gate_code}
                onChange={(e) => setFormData({ ...formData, gate_code: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="special_equipment">Special Equipment</Label>
              <Input
                id="special_equipment"
                value={formData.special_equipment_needed}
                onChange={(e) => setFormData({ ...formData, special_equipment_needed: e.target.value })}
                placeholder="e.g., Long hose, Pump"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="delivery_window_start">Delivery Window Start</Label>
              <Input
                id="delivery_window_start"
                type="time"
                value={formData.delivery_window_start}
                onChange={(e) => setFormData({ ...formData, delivery_window_start: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="delivery_window_end">Delivery Window End</Label>
              <Input
                id="delivery_window_end"
                type="time"
                value={formData.delivery_window_end}
                onChange={(e) => setFormData({ ...formData, delivery_window_end: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="access_instructions">Access Instructions</Label>
            <Textarea
              id="access_instructions"
              value={formData.access_instructions}
              onChange={(e) => setFormData({ ...formData, access_instructions: e.target.value })}
              placeholder="Instructions for drivers to access the location"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Any additional notes"
              rows={2}
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="is_primary"
                checked={formData.is_primary}
                onCheckedChange={(checked) => setFormData({ ...formData, is_primary: checked })}
              />
              <Label htmlFor="is_primary">Primary Location</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
