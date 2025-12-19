import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface Equipment {
  id: string;
  name: string;
  equipment_type: string;
  inspection_template_id: string | null;
}

export function useEquipmentForTemplateAssignment() {
  return useQuery({
    queryKey: ['equipment-for-template-assignment'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_assets')
        .select('id, name, equipment_type, inspection_template_id')
        .order('name');
      
      if (error) throw error;
      return data as Equipment[];
    },
  });
}

export function useAssignTemplateToEquipment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      templateId, 
      equipmentIds, 
      previousEquipmentIds 
    }: { 
      templateId: string; 
      equipmentIds: string[]; 
      previousEquipmentIds: string[];
    }) => {
      // Remove template from equipment that was deselected
      const toRemove = previousEquipmentIds.filter(id => !equipmentIds.includes(id));
      if (toRemove.length > 0) {
        const { error: removeError } = await supabase
          .from('equipment_assets')
          .update({ inspection_template_id: null })
          .in('id', toRemove);
        
        if (removeError) throw removeError;
      }

      // Assign template to selected equipment
      if (equipmentIds.length > 0) {
        const { error: assignError } = await supabase
          .from('equipment_assets')
          .update({ inspection_template_id: templateId })
          .in('id', equipmentIds);
        
        if (assignError) throw assignError;
      }

      return { assigned: equipmentIds.length, removed: toRemove.length };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['equipment-for-template-assignment'] });
      queryClient.invalidateQueries({ queryKey: ['equipment'] });
    },
  });
}
