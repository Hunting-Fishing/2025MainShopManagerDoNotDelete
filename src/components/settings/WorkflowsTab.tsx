
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useState } from 'react';
import { useNodesState, useEdgesState, addEdge, Node, Edge } from '@xyflow/react';
import { FlowTypeSelector } from "./workflow/FlowTypeSelector";
import { WorkflowEditor } from "./workflow/WorkflowEditor";

const workflowInitialNodes: Node[] = [
  {
    id: 'customer-created',
    type: 'input',
    data: { label: 'New Customer Created' },
    position: { x: 250, y: 0 },
  },
  {
    id: 'send-welcome',
    data: { label: 'Send Welcome Email' },
    position: { x: 250, y: 100 },
  },
  {
    id: 'create-workorder',
    data: { label: 'Create Work Order' },
    position: { x: 100, y: 200 },
  },
  {
    id: 'schedule-followup',
    data: { label: 'Schedule Follow-up' },
    position: { x: 400, y: 200 },
  },
];

const workflowInitialEdges: Edge[] = [
  { id: 'e1-2', source: 'customer-created', target: 'send-welcome' },
  { id: 'e2-3', source: 'send-welcome', target: 'create-workorder' },
  { id: 'e2-4', source: 'send-welcome', target: 'schedule-followup' },
];

export function WorkflowsTab() {
  const [nodes, setNodes, onNodesChange] = useNodesState(workflowInitialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(workflowInitialEdges);
  const [selectedWorkflow, setSelectedWorkflow] = useState('customer-onboarding');

  const onConnect = (params: any) => setEdges((eds) => addEdge(params, eds));

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
            onSelect={setSelectedWorkflow}
          />
          <WorkflowEditor
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
          />
        </CardContent>
      </Card>
    </div>
  );
}
