import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export interface TruckCompartment {
  id: string;
  shop_id: string;
  truck_id: string;
  compartment_number: number;
  compartment_name: string | null;
  product_id: string | null;
  capacity_gallons: number;
  current_level_gallons: number;
  material: string | null;
  created_at: string;
  updated_at: string;
  product?: {
    id: string;
    product_name: string;
    product_code: string;
    fuel_type: string | null;
  } | null;
}

export function useTruckCompartments(truckId: string | undefined) {
  return useQuery({
    queryKey: ['truck-compartments', truckId],
    queryFn: async () => {
      if (!truckId) return [];
      
      const { data, error } = await supabase
        .from('fuel_delivery_truck_compartments')
        .select(`
          *,
          product:fuel_delivery_products(id, product_name, product_code, fuel_type)
        `)
        .eq('truck_id', truckId)
        .order('compartment_number');
      
      if (error) throw error;
      return data as TruckCompartment[];
    },
    enabled: !!truckId
  });
}

export function useUpdateCompartmentLevel() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ 
      compartmentId, 
      newLevel,
      truckId 
    }: { 
      compartmentId: string; 
      newLevel: number;
      truckId: string;
    }) => {
      const { data, error } = await supabase
        .from('fuel_delivery_truck_compartments')
        .update({ 
          current_level_gallons: newLevel,
          updated_at: new Date().toISOString()
        })
        .eq('id', compartmentId)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['truck-compartments', variables.truckId] });
    }
  });
}
