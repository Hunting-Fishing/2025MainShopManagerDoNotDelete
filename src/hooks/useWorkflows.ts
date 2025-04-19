
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  workflow_type: string;
  is_active: boolean;
  nodes: Node[];
  edges: Edge[];
  created_at: string;
  updated_at: string;
}

export function useWorkflows(workflowType?: string) {
  const queryClient = useQueryClient();

  const { data: workflows, isLoading } = useQuery({
    queryKey: ['workflows', workflowType],
    queryFn: async () => {
      let query = supabase.from('workflows').select('*');
      
      if (workflowType) {
        query = query.eq('workflow_type', workflowType);
      }
      
      const { data, error } = await query;
      
      if (error) {
        throw error;
      }
      
      return data as Workflow[];
    }
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, nodes, edges }: { id: string; nodes: Node[]; edges: Edge[] }) => {
      const { error } = await supabase
        .from('workflows')
        .update({ nodes, edges })
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    }
  });

  return {
    workflows,
    isLoading,
    updateWorkflow
  };
}
