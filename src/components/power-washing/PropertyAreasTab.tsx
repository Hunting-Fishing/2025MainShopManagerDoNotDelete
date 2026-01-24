import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, Ruler } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { PropertyAreaCard } from './PropertyAreaCard';
import { AddPropertyAreaDialog } from './AddPropertyAreaDialog';
import { toast } from 'sonner';

interface PropertyAreasTabProps {
  customerId: string;
  shopId: string;
}

export interface PropertyArea {
  id: string;
  customer_id: string;
  shop_id: string;
  area_type: string;
  label: string | null;
  square_footage: number;
  length_ft: number | null;
  width_ft: number | null;
  height_ft: number | null;
  notes: string | null;
  last_serviced_at: string | null;
  service_count: number;
  created_at: string;
  updated_at: string;
}

export const AREA_TYPES = [
  { value: 'driveway', label: 'Driveway', icon: '🚗' },
  { value: 'roof', label: 'Roof', icon: '🏠' },
  { value: 'deck', label: 'Deck/Patio', icon: '🪵' },
  { value: 'fence', label: 'Fence', icon: '🪴' },
  { value: 'exterior', label: 'Exterior Walls', icon: '🏢' },
  { value: 'sidewalk', label: 'Sidewalk', icon: '🚶' },
  { value: 'shop', label: 'Shop/Warehouse', icon: '🏭' },
  { value: 'garage', label: 'Garage', icon: '🚙' },
  { value: 'pool_deck', label: 'Pool Deck', icon: '🏊' },
  { value: 'other', label: 'Other', icon: '📐' },
];

export function PropertyAreasTab({ customerId, shopId }: PropertyAreasTabProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingArea, setEditingArea] = useState<PropertyArea | null>(null);
  const queryClient = useQueryClient();

  const { data: areas, isLoading } = useQuery({
    queryKey: ['customer-property-areas', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_property_areas')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as PropertyArea[];
    },
    enabled: !!customerId
  });

  const deleteMutation = useMutation({
    mutationFn: async (areaId: string) => {
      const { error } = await supabase
        .from('customer_property_areas')
        .delete()
        .eq('id', areaId);
      
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success('Property area deleted');
      queryClient.invalidateQueries({ queryKey: ['customer-property-areas', customerId] });
    },
    onError: (error) => {
      console.error('Failed to delete area:', error);
      toast.error('Failed to delete property area');
    }
  });

  const handleEdit = (area: PropertyArea) => {
    setEditingArea(area);
    setIsDialogOpen(true);
  };

  const handleDelete = (areaId: string) => {
    if (confirm('Are you sure you want to delete this property area?')) {
      deleteMutation.mutate(areaId);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
    setEditingArea(null);
  };

  return (
    <Card>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 md:p-6">
        <CardTitle className="text-base md:text-lg flex items-center gap-2">
          <Ruler className="h-5 w-5 text-cyan-600" />
          Property Areas
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => setIsDialogOpen(true)}
          className="bg-cyan-600 hover:bg-cyan-700 w-full sm:w-auto"
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Area
        </Button>
      </CardHeader>
      <CardContent className="p-3 pt-0 md:p-6 md:pt-0">
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : areas?.length === 0 ? (
          <div className="text-center py-8">
            <Ruler className="h-10 w-10 mx-auto mb-3 text-muted-foreground" />
            <p className="text-muted-foreground text-sm md:text-base">No property areas saved</p>
            <p className="text-xs text-muted-foreground mt-1">
              Add areas to save measurements for quick job creation
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {areas?.map((area) => (
              <PropertyAreaCard
                key={area.id}
                area={area}
                onEdit={() => handleEdit(area)}
                onDelete={() => handleDelete(area.id)}
              />
            ))}
          </div>
        )}
      </CardContent>

      <AddPropertyAreaDialog
        open={isDialogOpen}
        onOpenChange={handleDialogClose}
        customerId={customerId}
        shopId={shopId}
        editingArea={editingArea}
      />
    </Card>
  );
}
