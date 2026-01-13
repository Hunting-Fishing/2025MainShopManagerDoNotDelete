import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateWaterInventory, useWaterProducts } from '@/hooks/water-delivery/useWaterInventory';

const LOCATION_TYPES = [
  { value: 'storage_tank', label: 'Storage Tank' },
  { value: 'tanker_truck', label: 'Tanker Truck' },
  { value: 'customer_site', label: 'Customer Site' },
  { value: 'hydrant', label: 'Hydrant' },
  { value: 'other', label: 'Other' },
];

interface AddInventoryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddInventoryDialog({ open, onOpenChange }: AddInventoryDialogProps) {
  const [formData, setFormData] = React.useState({
    product_id: '',
    location_type: '',
    location_id: '',
    quantity_gallons: '',
    max_capacity: '',
    reorder_point: '',
    notes: '',
  });

  const { data: products = [] } = useWaterProducts();
  const createMutation = useCreateWaterInventory();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    createMutation.mutate({
      product_id: formData.product_id,
      location_type: formData.location_type,
      location_id: formData.location_id || null,
      quantity_gallons: parseFloat(formData.quantity_gallons) || 0,
      max_capacity: formData.max_capacity ? parseFloat(formData.max_capacity) : null,
      reorder_point: formData.reorder_point ? parseFloat(formData.reorder_point) : null,
      notes: formData.notes || null,
    }, {
      onSuccess: () => {
        onOpenChange(false);
        setFormData({
          product_id: '',
          location_type: '',
          location_id: '',
          quantity_gallons: '',
          max_capacity: '',
          reorder_point: '',
          notes: '',
        });
      },
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Inventory</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="product">Product *</Label>
            <Select
              value={formData.product_id}
              onValueChange={(value) => setFormData(prev => ({ ...prev, product_id: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.product_name} ({product.water_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_type">Location Type *</Label>
            <Select
              value={formData.location_type}
              onValueChange={(value) => setFormData(prev => ({ ...prev, location_type: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select location type" />
              </SelectTrigger>
              <SelectContent>
                {LOCATION_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_id">Location Name/ID</Label>
            <Input
              id="location_id"
              placeholder="e.g., Tank A, Truck #1"
              value={formData.location_id}
              onChange={(e) => setFormData(prev => ({ ...prev, location_id: e.target.value }))}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="quantity">Current Quantity (gal) *</Label>
              <Input
                id="quantity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.quantity_gallons}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity_gallons: e.target.value }))}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_capacity">Max Capacity (gal)</Label>
              <Input
                id="max_capacity"
                type="number"
                min="0"
                step="0.01"
                placeholder="0"
                value={formData.max_capacity}
                onChange={(e) => setFormData(prev => ({ ...prev, max_capacity: e.target.value }))}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reorder_point">Reorder Point (gal)</Label>
            <Input
              id="reorder_point"
              type="number"
              min="0"
              step="0.01"
              placeholder="Alert when stock falls below"
              value={formData.reorder_point}
              onChange={(e) => setFormData(prev => ({ ...prev, reorder_point: e.target.value }))}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              placeholder="Optional notes..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={!formData.product_id || !formData.location_type || createMutation.isPending}
              className="bg-cyan-600 hover:bg-cyan-700"
            >
              {createMutation.isPending ? 'Adding...' : 'Add Inventory'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
