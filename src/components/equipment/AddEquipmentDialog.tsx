import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface AddEquipmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddEquipmentDialog({ open, onOpenChange }: AddEquipmentDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    model: '',
    manufacturer: '',
    serial_number: '',
    equipment_type: '',
    location: '',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    maintenance_interval_days: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get current user's shop_id from profile
      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .single();

      if (!profile?.shop_id) {
        throw new Error('No shop associated with user');
      }

      const equipmentId = crypto.randomUUID();
      
      const { error } = await supabase
        .from('equipment')
        .insert({
          id: equipmentId,
          name: formData.name,
          model: formData.model || 'Unknown',
          manufacturer: formData.manufacturer || 'Unknown',
          serial_number: formData.serial_number || '',
          category: formData.equipment_type,
          status: 'operational',
          location: formData.location || '',
          customer: 'Internal',
          purchase_date: formData.purchase_date || new Date().toISOString().split('T')[0],
          install_date: formData.purchase_date || new Date().toISOString().split('T')[0],
          warranty_expiry_date: formData.warranty_expiry || new Date().toISOString().split('T')[0],
          warranty_status: 'active',
          last_maintenance_date: new Date().toISOString().split('T')[0],
          next_maintenance_date: formData.warranty_expiry || new Date().toISOString().split('T')[0],
          maintenance_frequency: formData.maintenance_interval_days ? `${formData.maintenance_interval_days} days` : '90 days',
          notes: formData.notes || null
        });

      if (error) throw error;

      toast({
        title: "Equipment added",
        description: "Equipment has been successfully added to your inventory.",
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        model: '',
        manufacturer: '',
        serial_number: '',
        equipment_type: '',
        location: '',
        purchase_date: '',
        purchase_price: '',
        warranty_expiry: '',
        maintenance_interval_days: '',
        notes: ''
      });
      onOpenChange(false);

    } catch (error) {
      console.error('Error adding equipment:', error);
      toast({
        title: "Error",
        description: "Failed to add equipment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Equipment</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="equipment_type">Type *</Label>
              <Select 
                value={formData.equipment_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="diagnostic">Diagnostic Equipment</SelectItem>
                  <SelectItem value="lifting">Lifting Equipment</SelectItem>
                  <SelectItem value="air_tools">Air Tools</SelectItem>
                  <SelectItem value="hand_tools">Hand Tools</SelectItem>
                  <SelectItem value="electrical">Electrical Equipment</SelectItem>
                  <SelectItem value="generator">Generator</SelectItem>
                  <SelectItem value="forklift">Forklift</SelectItem>
                  <SelectItem value="excavator">Excavator</SelectItem>
                  <SelectItem value="loader">Loader</SelectItem>
                  <SelectItem value="dozer">Dozer</SelectItem>
                  <SelectItem value="heavy_truck">Heavy Truck</SelectItem>
                  <SelectItem value="vessel">Vessel</SelectItem>
                  <SelectItem value="outboard">Outboard Motor</SelectItem>
                  <SelectItem value="fleet_vehicle">Fleet Vehicle</SelectItem>
                  <SelectItem value="courtesy_car">Courtesy Car</SelectItem>
                  <SelectItem value="rental_vehicle">Rental Vehicle</SelectItem>
                  <SelectItem value="service_vehicle">Service Vehicle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="manufacturer">Manufacturer</Label>
              <Input
                id="manufacturer"
                value={formData.manufacturer}
                onChange={(e) => setFormData(prev => ({ ...prev, manufacturer: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="serial_number">Serial Number</Label>
              <Input
                id="serial_number"
                value={formData.serial_number}
                onChange={(e) => setFormData(prev => ({ ...prev, serial_number: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location">Location</Label>
              <Input
                id="location"
                value={formData.location}
                onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                placeholder="e.g., Bay 1, Storage Room"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_date">Purchase Date</Label>
              <Input
                id="purchase_date"
                type="date"
                value={formData.purchase_date}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_date: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="purchase_price">Purchase Price</Label>
              <Input
                id="purchase_price"
                type="number"
                step="0.01"
                value={formData.purchase_price}
                onChange={(e) => setFormData(prev => ({ ...prev, purchase_price: e.target.value }))}
                placeholder="0.00"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="warranty_expiry">Warranty Expiry</Label>
              <Input
                id="warranty_expiry"
                type="date"
                value={formData.warranty_expiry}
                onChange={(e) => setFormData(prev => ({ ...prev, warranty_expiry: e.target.value }))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="maintenance_interval_days">Maintenance Interval (Days)</Label>
              <Input
                id="maintenance_interval_days"
                type="number"
                value={formData.maintenance_interval_days}
                onChange={(e) => setFormData(prev => ({ ...prev, maintenance_interval_days: e.target.value }))}
                placeholder="e.g., 90, 180, 365"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Additional notes about this equipment..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting || !formData.name || !formData.equipment_type}>
              {isSubmitting ? 'Adding...' : 'Add Equipment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}