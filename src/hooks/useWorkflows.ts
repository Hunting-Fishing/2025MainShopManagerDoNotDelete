
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowUpdatePayload } from '@/types/workflow';

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
      
      // Parse nodes and edges from JSON to proper objects with proper types
      return (data || []).map(workflow => ({
        ...workflow,
        nodes: Array.isArray(workflow.nodes) 
          ? workflow.nodes 
          : JSON.parse(workflow.nodes as unknown as string),
        edges: Array.isArray(workflow.edges) 
          ? workflow.edges 
          : JSON.parse(workflow.edges as unknown as string)
      })) as Workflow[];
    }
  });

  const updateWorkflow = useMutation({
    mutationFn: async ({ id, nodes, edges }: WorkflowUpdatePayload) => {
      const { error } = await supabase
        .from('workflows')
        .update({
          nodes: JSON.stringify(nodes),
          edges: JSON.stringify(edges)
        })
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
