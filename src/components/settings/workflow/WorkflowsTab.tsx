
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState, useCallback } from 'react';
import { useNodesState, useEdgesState, addEdge, ReactFlowProvider, ReactFlow } from '@xyflow/react';
import { FlowTypeSelector } from "./FlowTypeSelector";
import { WorkflowEditor } from "./WorkflowEditor";
import { useWorkflows } from "@/hooks/useWorkflows";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";

export function WorkflowsTab() {
  const [selectedWorkflow, setSelectedWorkflow] = useState('customer-onboarding');
  const { workflows, isLoading, updateWorkflow } = useWorkflows(selectedWorkflow);
  const { toast } = useToast();
  
  const currentWorkflow = workflows?.[0];
  
  // Initialize with empty arrays if no workflow data is available
  const initialNodes = currentWorkflow?.nodes || [];
  const initialEdges = currentWorkflow?.edges || [];

  const [nodes, setNodes, onNodesChange] = useNodesState(
    initialNodes as WorkflowNode[]
  );
  
  const [edges, setEdges, onEdgesChange] = useEdgesState(
    initialEdges as WorkflowEdge[]
  );

  const onConnect = useCallback((params: any) => {
    setEdges((eds) => addEdge(
      { 
        ...params, 
        animated: true, 
        style: { stroke: '#999', strokeWidth: 2 } 
      }, 
      eds
    ));
  }, [setEdges]);

  const handleSaveWorkflow = useCallback(async () => {
    if (!currentWorkflow) {
      toast({
        title: "Error",
        description: "No workflow selected to save",
        variant: "destructive",
      });
      return;
    }

    try {
      await updateWorkflow.mutateAsync({
        id: currentWorkflow.id,
        nodes: nodes as WorkflowNode[],
        edges: edges as WorkflowEdge[]
      });
      toast({
        title: "Success",
        description: "Workflow saved successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save workflow",
        variant: "destructive",
      });
      console.error("Error saving workflow:", error);
    }
  }, [currentWorkflow, nodes, edges, updateWorkflow, toast]);

  const handleWorkflowSelect = async (type: string) => {
    // Save current workflow before switching if it exists
    if (currentWorkflow && (
      JSON.stringify(nodes) !== JSON.stringify(currentWorkflow.nodes) || 
      JSON.stringify(edges) !== JSON.stringify(currentWorkflow.edges)
    )) {
      try {
        await updateWorkflow.mutateAsync({
          id: currentWorkflow.id,
          nodes: nodes as WorkflowNode[],
          edges: edges as WorkflowEdge[]
        });
        toast({
          title: "Success",
          description: "Workflow saved before switching",
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save workflow before switching",
          variant: "destructive",
        });
        console.error("Error saving workflow before switching:", error);
      }
    }
    setSelectedWorkflow(type);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Workflow Automation</CardTitle>
          <CardDescription>
            Configure and manage automated workflows for your business processes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <FlowTypeSelector 
            selectedWorkflow={selectedWorkflow} 
            onSelect={handleWorkflowSelect}
          />
          
          <div className="mt-4">
            <ReactFlowProvider>
              <WorkflowEditor
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                onSave={handleSaveWorkflow}
                isSaving={updateWorkflow.isPending}
              />
            </ReactFlowProvider>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
