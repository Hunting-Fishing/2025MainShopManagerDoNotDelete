import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useShopId } from '@/hooks/useShopId';
import { toast } from 'sonner';

export interface WaterInventoryItem {
  id: string;
  product_id: string;
  location_type: string;
  location_id: string | null;
  quantity_gallons: number;
  max_capacity: number | null;
  reorder_point: number | null;
  notes: string | null;
  shop_id: string;
  created_at: string;
  updated_at: string;
  water_delivery_products?: {
    product_name: string;
    water_type: string;
    product_code?: string | null;
  } | null;
}

export interface CreateWaterInventoryInput {
  product_id: string;
  location_type: string;
  location_id?: string | null;
  quantity_gallons: number;
  max_capacity?: number | null;
  reorder_point?: number | null;
  notes?: string | null;
}

export interface UpdateWaterInventoryInput {
  id: string;
  product_id?: string;
  location_type?: string;
  location_id?: string | null;
  quantity_gallons?: number;
  max_capacity?: number | null;
  reorder_point?: number | null;
  notes?: string | null;
}

export function useWaterInventory(locationType?: string) {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ['water-delivery-inventory', shopId, locationType],
    queryFn: async () => {
      if (!shopId) return [];
      
      let query = supabase
        .from('water_delivery_inventory')
        .select(`
          *,
          water_delivery_products (product_name, water_type, product_code)
        `)
        .eq('shop_id', shopId)
        .order('location_type', { ascending: true });

      if (locationType && locationType !== 'all') {
        query = query.eq('location_type', locationType);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as WaterInventoryItem[];
    },
    enabled: !!shopId,
  });
}

export function useWaterProducts() {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ['water-delivery-products', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('water_delivery_products')
        .select('id, product_name, water_type, product_code')
        .eq('shop_id', shopId)
        .eq('is_active', true)
        .order('product_name');

      if (error) throw error;
      return data;
    },
    enabled: !!shopId,
  });
}

export function useLowStockInventory() {
  const { shopId } = useShopId();

  return useQuery({
    queryKey: ['water-inventory-low-stock', shopId],
    queryFn: async () => {
      if (!shopId) return [];
      
      const { data, error } = await supabase
        .from('water_delivery_inventory')
        .select(`
          *,
          water_delivery_products (product_name, water_type)
        `)
        .eq('shop_id', shopId)
        .not('reorder_point', 'is', null);

      if (error) throw error;
      
      // Filter items where quantity is at or below reorder point
      return (data || []).filter(item => 
        item.reorder_point && item.quantity_gallons <= item.reorder_point
      ) as WaterInventoryItem[];
    },
    enabled: !!shopId,
  });
}

export function useCreateWaterInventory() {
  const queryClient = useQueryClient();
  const { shopId } = useShopId();

  return useMutation({
    mutationFn: async (input: CreateWaterInventoryInput) => {
      if (!shopId) throw new Error('No shop selected');
      
      const { data, error } = await supabase
        .from('water_delivery_inventory')
        .insert({
          ...input,
          shop_id: shopId,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['water-inventory-low-stock'] });
      toast.success('Inventory item added successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to add inventory: ${error.message}`);
    },
  });
}

export function useUpdateWaterInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateWaterInventoryInput) => {
      const { id, ...updates } = input;
      
      const { data, error } = await supabase
        .from('water_delivery_inventory')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['water-inventory-low-stock'] });
      toast.success('Inventory updated successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to update inventory: ${error.message}`);
    },
  });
}

export function useDeleteWaterInventory() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('water_delivery_inventory')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['water-inventory-low-stock'] });
      toast.success('Inventory item deleted');
    },
    onError: (error: Error) => {
      toast.error(`Failed to delete inventory: ${error.message}`);
    },
  });
}

export function useAdjustInventoryQuantity() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, adjustment }: { id: string; adjustment: number }) => {
      // First get current quantity
      const { data: current, error: fetchError } = await supabase
        .from('water_delivery_inventory')
        .select('quantity_gallons')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      const newQuantity = Math.max(0, (current.quantity_gallons || 0) + adjustment);
      
      const { data, error } = await supabase
        .from('water_delivery_inventory')
        .update({ 
          quantity_gallons: newQuantity,
          last_updated: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['water-delivery-inventory'] });
      queryClient.invalidateQueries({ queryKey: ['water-inventory-low-stock'] });
      toast.success('Quantity adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to adjust quantity: ${error.message}`);
    },
  });
}
