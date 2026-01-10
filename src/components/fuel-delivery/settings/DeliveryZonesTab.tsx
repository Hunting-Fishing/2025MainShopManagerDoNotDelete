import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MapPin, Plus, Pencil, Trash2, Loader2 } from 'lucide-react';
import { useDeliveryZones, DeliveryZone } from '@/hooks/fuel-delivery/useDeliveryZones';

interface DeliveryZonesTabProps {
  shopId: string | null;
}

export function DeliveryZonesTab({ shopId }: DeliveryZonesTabProps) {
  const { zones, isLoading, createZone, updateZone, deleteZone, isCreating, isUpdating } = useDeliveryZones(shopId);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingZone, setEditingZone] = useState<DeliveryZone | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    min_distance_miles: '0',
    max_distance_miles: '',
    delivery_fee: '0',
    per_mile_rate: '0',
    minimum_order: '',
    is_active: true,
  });

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      min_distance_miles: '0',
      max_distance_miles: '',
      delivery_fee: '0',
      per_mile_rate: '0',
      minimum_order: '',
      is_active: true,
    });
    setEditingZone(null);
  };

  const openEditDialog = (zone: DeliveryZone) => {
    setEditingZone(zone);
    setFormData({
      name: zone.name,
      description: zone.description || '',
      min_distance_miles: String(zone.min_distance_miles),
      max_distance_miles: zone.max_distance_miles ? String(zone.max_distance_miles) : '',
      delivery_fee: String(zone.delivery_fee),
      per_mile_rate: String(zone.per_mile_rate),
      minimum_order: zone.minimum_order ? String(zone.minimum_order) : '',
      is_active: zone.is_active,
    });
    setDialogOpen(true);
  };

  const handleSubmit = () => {
    if (!shopId) return;

    const zoneData: Omit<DeliveryZone, 'id'> = {
      shop_id: shopId,
      name: formData.name,
      description: formData.description || undefined,
      min_distance_miles: parseFloat(formData.min_distance_miles) || 0,
      max_distance_miles: formData.max_distance_miles ? parseFloat(formData.max_distance_miles) : undefined,
      delivery_fee: parseFloat(formData.delivery_fee) || 0,
      per_mile_rate: parseFloat(formData.per_mile_rate) || 0,
      minimum_order: formData.minimum_order ? parseFloat(formData.minimum_order) : undefined,
      is_active: formData.is_active,
      display_order: zones.length,
    };

    if (editingZone?.id) {
      updateZone({ id: editingZone.id, ...zoneData });
    } else {
      createZone(zoneData);
    }
    
    setDialogOpen(false);
    resetForm();
  };

  const handleDelete = (id: string) => {
    if (confirm('Delete this delivery zone?')) {
      deleteZone(id);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-orange-500" />
            <CardTitle>Delivery Zones</CardTitle>
          </div>
          <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button size="sm" className="bg-orange-500 hover:bg-orange-600">
                <Plus className="h-4 w-4 mr-2" />
                Add Zone
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingZone ? 'Edit Zone' : 'Add Delivery Zone'}</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Zone Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Local, Extended, Rural"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description"
                    rows={2}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Min Distance (miles)</Label>
                    <Input
                      type="number"
                      value={formData.min_distance_miles}
                      onChange={(e) => setFormData(prev => ({ ...prev, min_distance_miles: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Max Distance (miles)</Label>
                    <Input
                      type="number"
                      value={formData.max_distance_miles}
                      onChange={(e) => setFormData(prev => ({ ...prev, max_distance_miles: e.target.value }))}
                      placeholder="No limit"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Base Delivery Fee ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.delivery_fee}
                      onChange={(e) => setFormData(prev => ({ ...prev, delivery_fee: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Per Mile Rate ($)</Label>
                    <Input
                      type="number"
                      step="0.01"
                      value={formData.per_mile_rate}
                      onChange={(e) => setFormData(prev => ({ ...prev, per_mile_rate: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Minimum Order ($)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={formData.minimum_order}
                    onChange={(e) => setFormData(prev => ({ ...prev, minimum_order: e.target.value }))}
                    placeholder="No minimum"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_active: checked }))}
                  />
                  <Label>Active</Label>
                </div>
                <Button 
                  onClick={handleSubmit} 
                  disabled={!formData.name || isCreating || isUpdating}
                  className="w-full bg-orange-500 hover:bg-orange-600"
                >
                  {(isCreating || isUpdating) && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  {editingZone ? 'Update Zone' : 'Create Zone'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Configure distance-based delivery pricing zones
        </CardDescription>
      </CardHeader>
      <CardContent>
        {zones.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <p>No delivery zones configured</p>
            <p className="text-sm">Add zones to set distance-based pricing</p>
          </div>
        ) : (
          <div className="space-y-3">
            {zones.map((zone) => (
              <div 
                key={zone.id} 
                className={`flex items-center justify-between p-4 rounded-lg border ${
                  zone.is_active ? 'bg-background' : 'bg-muted/50 opacity-60'
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{zone.name}</span>
                    {!zone.is_active && (
                      <span className="text-xs bg-muted px-2 py-0.5 rounded">Inactive</span>
                    )}
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    {zone.min_distance_miles} - {zone.max_distance_miles || '∞'} miles | 
                    ${zone.delivery_fee.toFixed(2)} base
                    {zone.per_mile_rate > 0 && ` + $${zone.per_mile_rate.toFixed(2)}/mile`}
                    {zone.minimum_order && ` | Min: $${zone.minimum_order.toFixed(2)}`}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="ghost" size="icon" onClick={() => openEditDialog(zone)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => zone.id && handleDelete(zone.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
