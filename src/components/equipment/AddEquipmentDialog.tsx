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
    unit_number: '',
    location: '',
    purchase_date: '',
    purchase_price: '',
    warranty_expiry: '',
    maintenance_interval_days: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate required fields
    if (!formData.name || !formData.equipment_type) {
      toast({
        title: "Validation Error",
        description: "Equipment Name and Type are required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);

    try {
      console.log('Starting equipment submission...', { name: formData.name, type: formData.equipment_type });
      
      // Get current user
      const { data: userData, error: userError } = await supabase.auth.getUser();
      if (userError) {
        console.error('User auth error:', userError);
        throw new Error(`Authentication error: ${userError.message}`);
      }
      
      if (!userData.user) {
        throw new Error('You must be logged in to add equipment');
      }
      
      console.log('User authenticated:', userData.user.id);

      // Get current user's shop_id from profile
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('id', userData.user.id)
        .maybeSingle();

      if (profileError) {
        console.error('Profile fetch error:', profileError);
        throw new Error(`Failed to fetch user profile: ${profileError.message}`);
      }

      if (!profile?.shop_id) {
        console.error('No shop_id found in profile:', profile);
        throw new Error('No shop associated with your account. Please contact support.');
      }
      
      console.log('Shop ID found:', profile.shop_id);

      // Generate asset number
      const assetNumber = `AST-${Date.now()}`;
      
      const equipmentData = {
        shop_id: profile.shop_id,
        equipment_type: formData.equipment_type as any,
        asset_number: assetNumber,
        unit_number: formData.unit_number || null,
        name: formData.name,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        location: formData.location || null,
        purchase_date: formData.purchase_date || null,
        purchase_cost: formData.purchase_price ? parseFloat(formData.purchase_price) : null,
        status: 'operational' as any,
        current_hours: 0,
        current_mileage: 0,
        maintenance_intervals: [],
        notes: formData.notes || null,
        created_by: userData.user.id
      };
      
      console.log('Inserting equipment data:', equipmentData);
      
      const { data: insertedData, error: insertError } = await supabase
        .from('equipment_assets')
        .insert([equipmentData])
        .select();

      if (insertError) {
        console.error('Database insert error:', insertError);
        throw new Error(`Database error: ${insertError.message}`);
      }
      
      console.log('Equipment inserted successfully:', insertedData);

      toast({
        title: "Success!",
        description: `${formData.name} has been added to your equipment inventory.`,
      });

      // Reset form and close dialog
      setFormData({
        name: '',
        model: '',
        manufacturer: '',
        serial_number: '',
        equipment_type: '',
        unit_number: '',
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
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast({
        title: "Failed to Add Equipment",
        description: errorMessage,
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
                  <SelectItem value="crane">Crane</SelectItem>
                  <SelectItem value="heavy_truck">Heavy Truck</SelectItem>
                  <SelectItem value="vessel">Vessel</SelectItem>
                  <SelectItem value="outboard">Outboard Motor</SelectItem>
                  <SelectItem value="marine">Marine</SelectItem>
                  <SelectItem value="semi">Semi</SelectItem>
                  <SelectItem value="small_engine">Small Engine</SelectItem>
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
              <Label htmlFor="unit_number">Unit #</Label>
              <Input
                id="unit_number"
                value={formData.unit_number}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_number: e.target.value }))}
                placeholder="e.g., UNIT-001"
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
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isSubmitting}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting || !formData.name || !formData.equipment_type}>
                {isSubmitting ? (
                  <>
                    <span className="mr-2">Adding...</span>
                    <span className="animate-spin">⏳</span>
                  </>
                ) : (
                  'Add Equipment'
                )}
              </Button>
            </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}