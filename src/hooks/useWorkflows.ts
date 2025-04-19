
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
      return (data || []).map(workflow => {
        let parsedNodes: WorkflowNode[];
        let parsedEdges: WorkflowEdge[];
        
        try {
          // Handle both array and JSON string formats
          parsedNodes = Array.isArray(workflow.nodes) 
            ? workflow.nodes 
            : JSON.parse(workflow.nodes as unknown as string);
            
          // Ensure each node has the required 'label' property
          parsedNodes = parsedNodes.map(node => ({
            ...node,
            data: {
              label: node.data?.label || 'No Label',
              ...node.data
            }
          }));
        } catch (e) {
          console.error('Error parsing nodes:', e);
          parsedNodes = [];
        }
        
        try {
          parsedEdges = Array.isArray(workflow.edges) 
            ? workflow.edges 
            : JSON.parse(workflow.edges as unknown as string);
        } catch (e) {
          console.error('Error parsing edges:', e);
          parsedEdges = [];
        }
        
        return {
          ...workflow,
          nodes: parsedNodes,
          edges: parsedEdges
        } as Workflow;
      });
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
