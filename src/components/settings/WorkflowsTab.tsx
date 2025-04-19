
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ReactFlow, Background, Controls, MiniMap, useNodesState, useEdgesState, addEdge, Node, Edge } from '@xyflow/react';
import { useState } from 'react';
import '@xyflow/react/dist/style.css';

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

  const workflowTypes = [
    { id: 'customer-onboarding', name: 'Customer Onboarding' },
    { id: 'service-request', name: 'Service Request' },
    { id: 'maintenance', name: 'Maintenance Schedule' },
  ];

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
          <div className="flex gap-4 mb-4">
            {workflowTypes.map((workflow) => (
              <Button
                key={workflow.id}
                variant={selectedWorkflow === workflow.id ? "default" : "outline"}
                onClick={() => setSelectedWorkflow(workflow.id)}
              >
                {workflow.name}
              </Button>
            ))}
          </div>
          
          <div className="w-full h-[600px] border rounded-lg">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              fitView
              className="bg-background"
            >
              <Background />
              <Controls />
              <MiniMap className="bg-background border rounded-lg" />
            </ReactFlow>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
