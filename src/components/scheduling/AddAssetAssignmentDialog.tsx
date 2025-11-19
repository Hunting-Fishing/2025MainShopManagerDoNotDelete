import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAssetAssignments } from '@/hooks/useAssetAssignments';
import { supabase } from '@/lib/supabase';
import { useShopId } from '@/hooks/useShopId';
import type { AssetType } from '@/types/assetAssignment';

interface AddAssetAssignmentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddAssetAssignmentDialog({ open, onOpenChange }: AddAssetAssignmentDialogProps) {
  const { createAssignment } = useAssetAssignments();
  const { shopId } = useShopId();
  const [loading, setLoading] = useState(false);
  const [employees, setEmployees] = useState<any[]>([]);
  const [assets, setAssets] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    employee_id: '',
    asset_type: 'equipment' as AssetType,
    asset_id: '',
    assignment_start: '',
    assignment_end: '',
    purpose: '',
    notes: ''
  });

  useEffect(() => {
    if (open && shopId) {
      fetchEmployees();
    }
  }, [open, shopId]);

  useEffect(() => {
    if (formData.asset_type && shopId) {
      fetchAssets();
    }
  }, [formData.asset_type, shopId]);

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('id, first_name, last_name, email')
      .eq('shop_id', shopId)
      .order('first_name');
    
    setEmployees(data || []);
  };

  const fetchAssets = async () => {
    let tableName = '';
    let selectFields = 'id, name';
    let orderField = 'name';
    
    switch (formData.asset_type) {
      case 'equipment':
        tableName = 'equipment_assets';
        break;
      case 'vessel':
        tableName = 'boat_inspections';
        selectFields = 'id, vessel_name as name';
        orderField = 'vessel_name';
        break;
      case 'vehicle':
        tableName = 'vehicles';
        selectFields = 'id, make, model, year';
        orderField = 'make';
        break;
    }

    if (tableName) {
      const { data } = await supabase
        .from(tableName)
        .select(selectFields)
        .order(orderField);
      
      setAssets(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      await createAssignment(formData);
      onOpenChange(false);
      setFormData({
        employee_id: '',
        asset_type: 'equipment',
        asset_id: '',
        assignment_start: '',
        assignment_end: '',
        purpose: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error creating assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssetLabel = (asset: any) => {
    if (formData.asset_type === 'vehicle') {
      return `${asset.year} ${asset.make} ${asset.model}`;
    }
    return asset.name || asset.vessel_name;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Assign Asset to Employee</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employee_id">Employee *</Label>
              <Select
                value={formData.employee_id}
                onValueChange={(value) => setFormData({ ...formData, employee_id: value })}
                required
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select employee" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>
                      {emp.first_name} {emp.last_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="asset_type">Asset Type *</Label>
              <Select
                value={formData.asset_type}
                onValueChange={(value: AssetType) => setFormData({ ...formData, asset_type: value, asset_id: '' })}
                required
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="equipment">Equipment</SelectItem>
                  <SelectItem value="vessel">Vessel</SelectItem>
                  <SelectItem value="vehicle">Vehicle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset_id">Asset *</Label>
            <Select
              value={formData.asset_id}
              onValueChange={(value) => setFormData({ ...formData, asset_id: value })}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                {assets.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {getAssetLabel(asset)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="assignment_start">Start Date *</Label>
              <Input
                id="assignment_start"
                type="datetime-local"
                value={formData.assignment_start}
                onChange={(e) => setFormData({ ...formData, assignment_start: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="assignment_end">End Date *</Label>
              <Input
                id="assignment_end"
                type="datetime-local"
                value={formData.assignment_end}
                onChange={(e) => setFormData({ ...formData, assignment_end: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g., Field service, Training, Inspection"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes or instructions"
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Creating...' : 'Create Assignment'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
