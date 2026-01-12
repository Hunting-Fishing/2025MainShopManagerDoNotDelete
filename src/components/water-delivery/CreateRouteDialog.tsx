import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useShopId } from '@/hooks/useShopId';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';

interface CreateRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateRouteDialog({ open, onOpenChange }: CreateRouteDialogProps) {
  const { shopId } = useShopId();
  const queryClient = useQueryClient();
  
  const [routeName, setRouteName] = useState('');
  const [routeDate, setRouteDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [driverId, setDriverId] = useState('');
  const [truckId, setTruckId] = useState('');
  const [notes, setNotes] = useState('');

  // Fetch drivers
  const { data: drivers } = useQuery({
    queryKey: ['water-delivery-drivers', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('water_delivery_drivers')
        .select('id, first_name, last_name')
        .eq('shop_id', shopId)
        .eq('is_active', true);
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId && open,
  });

  // Fetch trucks
  const { data: trucks } = useQuery({
    queryKey: ['water-delivery-trucks', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      const { data, error } = await supabase
        .from('water_delivery_trucks')
        .select('id, truck_number, make, model')
        .eq('shop_id', shopId)
        .eq('status', 'active');
      if (error) throw error;
      return data || [];
    },
    enabled: !!shopId && open,
  });

  const createMutation = useMutation({
    mutationFn: async () => {
      if (!shopId) throw new Error('No shop ID');
      if (!routeName.trim()) throw new Error('Route name is required');
      if (!routeDate) throw new Error('Route date is required');

      const { data: user } = await supabase.auth.getUser();

      const { data, error } = await supabase
        .from('water_delivery_routes')
        .insert({
          shop_id: shopId,
          route_name: routeName.trim(),
          route_date: routeDate,
          driver_id: driverId || null,
          truck_id: truckId || null,
          notes: notes.trim() || null,
          status: 'planned',
          created_by: user.user?.id,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-routes'] });
      toast.success('Route created successfully');
      handleClose();
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create route');
    },
  });

  const handleClose = () => {
    setRouteName('');
    setRouteDate(format(new Date(), 'yyyy-MM-dd'));
    setDriverId('');
    setTruckId('');
    setNotes('');
    onOpenChange(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Create New Route</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="route-name">Route Name *</Label>
              <Input
                id="route-name"
                value={routeName}
                onChange={(e) => setRouteName(e.target.value)}
                placeholder="e.g., North Zone Morning Route"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="route-date">Route Date *</Label>
              <Input
                id="route-date"
                type="date"
                value={routeDate}
                onChange={(e) => setRouteDate(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="driver">Driver</Label>
                <Select value={driverId} onValueChange={setDriverId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select driver" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No driver assigned</SelectItem>
                    {drivers?.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.first_name} {driver.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="truck">Truck</Label>
                <Select value={truckId} onValueChange={setTruckId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select truck" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">No truck assigned</SelectItem>
                    {trucks?.map((truck) => (
                      <SelectItem key={truck.id} value={truck.id}>
                        {truck.truck_number} - {truck.make} {truck.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add any notes about this route..."
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-cyan-600 hover:bg-cyan-700"
              disabled={createMutation.isPending}
            >
              {createMutation.isPending && (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              )}
              Create Route
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
