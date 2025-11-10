import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus } from 'lucide-react';
import { CreateVehicleInput } from '@/lib/database/repositories/VehicleRepository';
import { toast } from 'sonner';
import { EQUIPMENT_TYPES } from '@/components/customers/form/vehicle/fields/EquipmentTypeField';

interface AddAssetDialogProps {
  onAdd: (assetData: CreateVehicleInput) => Promise<any>;
}

export function AddAssetDialog({ onAdd }: AddAssetDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<Partial<CreateVehicleInput>>({
    owner_type: 'company',
    equipment_type: 'vehicle',
    asset_status: 'available',
    year: undefined,
    make: '',
    model: '',
    vin: '',
    license_plate: '',
    color: '',
    current_location: '',
    notes: ''
  });
  const [unitNumber, setUnitNumber] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.equipment_type) {
      toast.error('Please select an equipment type');
      return;
    }

    if (!unitNumber) {
      toast.error('Please provide a unit number');
      return;
    }

    try {
      setLoading(true);
      
      // Add unit number to VIN field
      const assetData = {
        ...formData,
        vin: unitNumber
      };
      
      await onAdd(assetData as CreateVehicleInput);
      toast.success('Company asset added successfully');
      setOpen(false);
      setFormData({
        owner_type: 'company',
        equipment_type: 'vehicle',
        asset_status: 'available',
        year: undefined,
        make: '',
        model: '',
        vin: '',
        license_plate: '',
        color: '',
        current_location: '',
        notes: ''
      });
      setUnitNumber('');
    } catch (error) {
      toast.error('Failed to add company asset');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          Add Company Asset
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Company Asset</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="unit_number">Unit # *</Label>
            <Input
              id="unit_number"
              placeholder="e.g., FT-1, PU-20, CV-5"
              value={unitNumber}
              onChange={(e) => setUnitNumber(e.target.value)}
              required
            />
            <p className="text-xs text-muted-foreground mt-1">
              Unique identifier for this asset (e.g., FT-1 for Forklift #1)
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="equipment_type">Equipment Type *</Label>
              <Select 
                value={formData.equipment_type} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, equipment_type: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select equipment type" />
                </SelectTrigger>
                <SelectContent>
                  {EQUIPMENT_TYPES.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground mt-1">
                Select the type of equipment or asset
              </p>
            </div>

            <div>
              <Label htmlFor="asset_status">Status</Label>
              <Select 
                value={formData.asset_status} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, asset_status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="in_use">In Use</SelectItem>
                  <SelectItem value="maintenance">Maintenance</SelectItem>
                  <SelectItem value="out_of_service">Out of Service</SelectItem>
                  <SelectItem value="retired">Retired</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                placeholder="2024"
                value={formData.year || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, year: parseInt(e.target.value) || undefined }))}
              />
            </div>
            <div>
              <Label htmlFor="make">Make/Brand</Label>
              <Input
                id="make"
                placeholder="e.g., Toyota, CAT, Honda"
                value={formData.make || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, make: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                placeholder="e.g., Camry, 320D, 5000W"
                value={formData.model || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, model: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, vin: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                value={formData.license_plate || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, license_plate: e.target.value }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                value={formData.color || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="current_location">Current Location</Label>
              <Input
                id="current_location"
                value={formData.current_location || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, current_location: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Adding...' : 'Add Asset'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}