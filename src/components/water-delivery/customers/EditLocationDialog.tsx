import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface Location {
  id: string;
  location_name: string;
  address: string | null;
  notes: string | null;
  is_active: boolean | null;
  customer_id: string;
}

interface EditLocationDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  location: Location | null;
}

const LOCATION_TYPES = [
  { value: 'residence', label: 'Residence' },
  { value: 'cistern', label: 'Cistern' },
  { value: 'well', label: 'Well' },
];

// Helper to detect location type from name
function detectLocationType(name: string): string {
  const lowerName = name.toLowerCase();
  if (lowerName.includes('cistern')) return 'cistern';
  if (lowerName.includes('well')) return 'well';
  if (lowerName.includes('residence') || lowerName.includes('house') || lowerName.includes('home')) return 'residence';
  return 'residence'; // default
}

export function EditLocationDialog({ open, onOpenChange, location }: EditLocationDialogProps) {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    location_type: '',
    location_name: '',
    address: '',
    notes: '',
    is_active: true,
  });

  useEffect(() => {
    if (location) {
      setFormData({
        location_type: detectLocationType(location.location_name),
        location_name: location.location_name || '',
        address: location.address || '',
        notes: location.notes || '',
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
          location_name: formData.location_name || 
            LOCATION_TYPES.find(t => t.value === formData.location_type)?.label || 
            formData.location_type,
          address: formData.address || null,
          notes: formData.notes || null,
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
    if (!formData.location_type) {
      toast.error('Please select a location type');
      return;
    }
    updateMutation.mutate();
  };

  if (!location) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Location</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="location_type">Location Type *</Label>
            <Select
              value={formData.location_type}
              onValueChange={(value) => setFormData({ ...formData, location_type: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type..." />
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
            <Label htmlFor="location_name">Location Name</Label>
            <Input
              id="location_name"
              value={formData.location_name}
              onChange={(e) => setFormData({ ...formData, location_name: e.target.value })}
              placeholder="e.g., Main House, Back Cistern"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address</Label>
            <Input
              id="address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              placeholder="Street address (if different from customer)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Access instructions, gate code, etc."
              rows={2}
            />
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="is_active"
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active">Active</Label>
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
