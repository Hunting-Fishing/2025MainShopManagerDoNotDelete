import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { useToast } from '@/hooks/use-toast';
import { History } from 'lucide-react';
import { EquipmentAuditTrail } from './EquipmentAuditTrail';

interface EquipmentDialogProps {
  open: boolean;
  onClose: () => void;
  equipment?: any;
}

export function EquipmentDialog({ open, onClose, equipment }: EquipmentDialogProps) {
  const { shopId } = useShopId();
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    equipment_type: '',
    asset_number: '',
    name: '',
    manufacturer: '',
    model: '',
    serial_number: '',
    year: '',
    location: '',
    status: 'operational',
    current_hours: '',
    current_mileage: '',
    notes: '',
  });

  useEffect(() => {
    if (equipment) {
      setFormData({
        equipment_type: equipment.equipment_type || '',
        asset_number: equipment.asset_number || '',
        name: equipment.name || '',
        manufacturer: equipment.manufacturer || '',
        model: equipment.model || '',
        serial_number: equipment.serial_number || '',
        year: equipment.year?.toString() || '',
        location: equipment.location || '',
        status: equipment.status || 'operational',
        current_hours: equipment.current_hours?.toString() || '',
        current_mileage: equipment.current_mileage?.toString() || '',
        notes: equipment.notes || '',
      });
    } else {
      setFormData({
        equipment_type: '',
        asset_number: '',
        name: '',
        manufacturer: '',
        model: '',
        serial_number: '',
        year: '',
        location: '',
        status: 'operational',
        current_hours: '',
        current_mileage: '',
        notes: '',
      });
    }
  }, [equipment]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!shopId) {
      toast({ title: 'Error', description: 'Shop ID not found', variant: 'destructive' });
      return;
    }

    setSaving(true);

    try {
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error('Not authenticated');

      const payload = {
        shop_id: shopId,
        equipment_type: formData.equipment_type as any,
        asset_number: formData.asset_number,
        name: formData.name,
        manufacturer: formData.manufacturer || null,
        model: formData.model || null,
        serial_number: formData.serial_number || null,
        year: formData.year ? parseInt(formData.year) : null,
        location: formData.location || null,
        status: formData.status as any,
        current_hours: formData.current_hours ? parseFloat(formData.current_hours) : 0,
        current_mileage: formData.current_mileage ? parseFloat(formData.current_mileage) : 0,
        notes: formData.notes || null,
        created_by: userData.user.id,
      };

      if (equipment) {
        const { error } = await supabase
          .from('equipment_assets')
          .update(payload)
          .eq('id', equipment.id);

        if (error) throw error;

        toast({ title: 'Success', description: 'Equipment updated successfully' });
      } else {
        const { error } = await supabase
          .from('equipment_assets')
          .insert([payload]);

        if (error) throw error;

        toast({ title: 'Success', description: 'Equipment added successfully' });
      }

      onClose();
    } catch (error: any) {
      console.error('Error saving equipment:', error);
      toast({
        title: 'Error',
        description: error.message || 'Failed to save equipment',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {equipment ? 'Edit Equipment' : 'Add New Equipment'}
          </DialogTitle>
        </DialogHeader>

        {equipment ? (
          <Tabs defaultValue="details" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="details">Details</TabsTrigger>
              <TabsTrigger value="history">
                <History className="h-4 w-4 mr-2" />
                History
              </TabsTrigger>
            </TabsList>

            <TabsContent value="details">
              <form onSubmit={handleSubmit} className="space-y-4 pt-4">
                {/* ... form content ... */}
              </form>
            </TabsContent>

            <TabsContent value="history">
              <EquipmentAuditTrail entityType="equipment_assets" entityId={equipment.id} />
            </TabsContent>
          </Tabs>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="equipment_type">Equipment Type *</Label>
                <Select
                  value={formData.equipment_type}
                  onValueChange={(value) => setFormData({ ...formData, equipment_type: value })}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="marine">Marine</SelectItem>
                    <SelectItem value="forklift">Forklift</SelectItem>
                    <SelectItem value="semi">Semi</SelectItem>
                    <SelectItem value="small_engine">Small Engine</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="asset_number">Asset Number *</Label>
                <Input
                  id="asset_number"
                  value={formData.asset_number}
                  onChange={(e) => setFormData({ ...formData, asset_number: e.target.value })}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="name">Equipment Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="manufacturer">Manufacturer</Label>
                <Input
                  id="manufacturer"
                  value={formData.manufacturer}
                  onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="model">Model</Label>
                <Input
                  id="model"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="serial_number">Serial Number</Label>
                <Input
                  id="serial_number"
                  value={formData.serial_number}
                  onChange={(e) => setFormData({ ...formData, serial_number: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="year">Year</Label>
                <Input
                  id="year"
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="operational">Operational</SelectItem>
                    <SelectItem value="maintenance">Maintenance</SelectItem>
                    <SelectItem value="down">Down</SelectItem>
                    <SelectItem value="retired">Retired</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="current_hours">Current Hours</Label>
                <Input
                  id="current_hours"
                  type="number"
                  step="0.01"
                  value={formData.current_hours}
                  onChange={(e) => setFormData({ ...formData, current_hours: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="current_mileage">Current Mileage</Label>
                <Input
                  id="current_mileage"
                  type="number"
                  step="0.01"
                  value={formData.current_mileage}
                  onChange={(e) => setFormData({ ...formData, current_mileage: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? 'Saving...' : equipment ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
