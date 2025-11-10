import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useCompanyAssets } from '@/hooks/useCompanyAssets';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface AddAssetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetDialog({ open, onOpenChange }: AddAssetDialogProps) {
  const { createAsset } = useCompanyAssets();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    vin: '',
    license_plate: '',
    asset_category: 'equipment' as const,
    asset_status: 'available' as const,
    current_location: '',
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await createAsset({
        ...formData,
        owner_type: 'company'
      });

      toast({
        title: 'Success',
        description: 'Asset added successfully'
      });

      // Reset form
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        vin: '',
        license_plate: '',
        asset_category: 'equipment',
        asset_status: 'available',
        current_location: '',
        notes: ''
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error creating asset:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to add asset',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Company Asset</DialogTitle>
          <DialogDescription>
            Add a new company vehicle, equipment, or tool to your inventory
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={formData.make}
                onChange={(e) => setFormData({ ...formData, make: e.target.value })}
                placeholder="e.g., Toyota, Caterpillar"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="e.g., Camry, 950H"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={formData.year}
                onChange={(e) => setFormData({ ...formData, year: parseInt(e.target.value) })}
                min={1900}
                max={new Date().getFullYear() + 1}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_category">Category</Label>
              <Select
                value={formData.asset_category}
                onValueChange={(value: any) => setFormData({ ...formData, asset_category: value })}
              >
                <SelectTrigger id="asset_category">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="courtesy">Courtesy Vehicle</SelectItem>
                  <SelectItem value="rental">Rental</SelectItem>
                  <SelectItem value="fleet">Fleet</SelectItem>
                  <SelectItem value="service">Service Vehicle</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={formData.vin}
                onChange={(e) => setFormData({ ...formData, vin: e.target.value.toUpperCase() })}
                placeholder="17-character VIN"
                maxLength={17}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="license_plate">License Plate</Label>
              <Input
                id="license_plate"
                value={formData.license_plate}
                onChange={(e) => setFormData({ ...formData, license_plate: e.target.value.toUpperCase() })}
                placeholder="ABC123"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="current_location">Location</Label>
              <Input
                id="current_location"
                value={formData.current_location}
                onChange={(e) => setFormData({ ...formData, current_location: e.target.value })}
                placeholder="Bay 1, Yard, etc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_status">Status</Label>
              <Select
                value={formData.asset_status}
                onValueChange={(value: any) => setFormData({ ...formData, asset_status: value })}
              >
                <SelectTrigger id="asset_status">
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Input
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional details..."
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Asset
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
