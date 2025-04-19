
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from "@/integrations/supabase/client";
import { Workflow, WorkflowNode, WorkflowEdge, WorkflowUpdatePayload } from '@/types/workflow';

// Sample initial workflows for each type
const initialWorkflowTemplates: Record<string, { nodes: WorkflowNode[], edges: WorkflowEdge[] }> = {
  'customer-onboarding': {
    nodes: [
      { 
        id: 'start-1', 
        type: 'start', 
        position: { x: 250, y: 50 }, 
        data: { label: 'Start' } 
      },
      { 
        id: 'task-1', 
        type: 'task', 
        position: { x: 250, y: 150 }, 
        data: { label: 'Collect Customer Info' } 
      },
      { 
        id: 'end-1', 
        type: 'end', 
        position: { x: 250, y: 250 }, 
        data: { label: 'Complete' } 
      }
    ],
    edges: [
      { id: 'e-start-1', source: 'start-1', target: 'task-1' },
      { id: 'e-task-1', source: 'task-1', target: 'end-1' }
    ]
  },
  'service-request': {
    nodes: [
      { 
        id: 'start-1', 
        type: 'start', 
        position: { x: 250, y: 50 }, 
        data: { label: 'New Request' } 
      },
      { 
        id: 'task-1', 
        type: 'task', 
        position: { x: 250, y: 150 }, 
        data: { label: 'Assign Technician' } 
      },
      { 
        id: 'end-1', 
        type: 'end', 
        position: { x: 250, y: 250 }, 
        data: { label: 'Service Complete' } 
      }
    ],
    edges: [
      { id: 'e-start-1', source: 'start-1', target: 'task-1' },
      { id: 'e-task-1', source: 'task-1', target: 'end-1' }
    ]
  },
  'maintenance': {
    nodes: [
      { 
        id: 'start-1', 
        type: 'start', 
        position: { x: 250, y: 50 }, 
        data: { label: 'Schedule Maintenance' } 
      },
      { 
        id: 'task-1', 
        type: 'task', 
        position: { x: 250, y: 150 }, 
        data: { label: 'Perform Maintenance' } 
      },
      { 
        id: 'end-1', 
        type: 'end', 
        position: { x: 250, y: 250 }, 
        data: { label: 'Maintenance Complete' } 
      }
    ],
    edges: [
      { id: 'e-start-1', source: 'start-1', target: 'task-1' },
      { id: 'e-task-1', source: 'task-1', target: 'end-1' }
    ]
  }
};

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
      
      // If no workflow found for this type, create one with default template
      if (data.length === 0 && workflowType) {
        const newWorkflow = {
          name: workflowType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
          description: `Automation workflow for ${workflowType.replace('-', ' ')}`,
          workflow_type: workflowType,
          is_active: true,
          nodes: JSON.stringify(initialWorkflowTemplates[workflowType].nodes),
          edges: JSON.stringify(initialWorkflowTemplates[workflowType].edges)
        };
        
        const { data: insertedData, error: insertError } = await supabase
          .from('workflows')
          .insert(newWorkflow)
          .select();
          
        if (insertError) {
          throw insertError;
        }
        
        if (insertedData && insertedData.length > 0) {
          data.push(insertedData[0]);
        }
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
