
import { ReactFlow, Background, Controls, MiniMap, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';

interface WorkflowEditorProps {
  nodes: Node[];
  edges: Edge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
}

export function WorkflowEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect
}: WorkflowEditorProps) {
  return (
    <div className="w-full h-[600px] border rounded-lg bg-background">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        fitView
      >
        <Background />
        <Controls />
        <MiniMap className="bg-background border rounded-lg" />
      </ReactFlow>
    </div>
  );
}
