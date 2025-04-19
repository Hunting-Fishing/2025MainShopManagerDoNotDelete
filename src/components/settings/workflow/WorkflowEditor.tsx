import { 
  ReactFlow, 
  Background, 
  BackgroundVariant, 
  Controls, 
  MiniMap, 
  useReactFlow, 
  Panel, 
  applyEdgeChanges, 
  applyNodeChanges 
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { WorkflowNode, WorkflowEdge } from "@/types/workflow";
import { nodeTypes } from './CustomNodes';
import { WorkflowControls, WorkflowNodeToolbar } from './WorkflowControls';
import { useCallback } from 'react';

interface WorkflowEditorProps {
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  onNodesChange: (changes: any) => void;
  onEdgesChange: (changes: any) => void;
  onConnect: (params: any) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function WorkflowEditor({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onConnect,
  onSave,
  isSaving
}: WorkflowEditorProps) {
  const reactFlowInstance = useReactFlow();

  const onAddNode = useCallback((type: string) => {
    const position = {
      x: Math.random() * 300 + 100,
      y: Math.random() * 300 + 100
    };
    
    const newNode: WorkflowNode = {
      id: `node_${Date.now()}`,
      type,
      position,
      data: {
        label: type === 'start' ? 'Start' : 
               type === 'end' ? 'End' : 
               type === 'decision' ? 'Decision' : 'Task',
      }
    };
    
    reactFlowInstance.addNodes(newNode);
  }, [reactFlowInstance]);

  const handleNodeEdit = useCallback((id: string, data: any) => {
    reactFlowInstance.setNodes(nds => 
      nds.map(node => {
        if (node.id === id) {
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      })
    );
  }, [reactFlowInstance]);

  const handleNodeDelete = useCallback((id: string) => {
    reactFlowInstance.setNodes(nds => nds.filter(node => node.id !== id));
    reactFlowInstance.setEdges(eds => eds.filter(edge => edge.source !== id && edge.target !== id));
  }, [reactFlowInstance]);

  return (
    <div className="w-full h-[650px] border rounded-xl bg-background shadow-sm">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#999', strokeWidth: 2 }
        }}
        fitView
        attributionPosition="bottom-right"
        className="bg-slate-50"
      >
        {nodes.map((node) => (
          <WorkflowNodeToolbar 
            key={node.id} 
            node={node} 
            onNodeEdit={handleNodeEdit} 
            onNodeDelete={handleNodeDelete} 
          />
        ))}
        
        <Panel position="top-left">
          <WorkflowControls 
            onAddNode={onAddNode}
            onSave={onSave}
            isSaving={isSaving}
          />
        </Panel>
        
        <Background variant={BackgroundVariant.Dots} color="#ddd" gap={16} />
        <Controls className="bg-white rounded-lg border shadow-sm" />
        <MiniMap 
          className="bg-white border rounded-lg shadow-sm" 
          nodeColor={(n) => {
            if (n.type === 'start') return '#10b981';
            if (n.type === 'end') return '#ef4444'; 
            if (n.type === 'decision') return '#eab308';
            return '#3b82f6';
          }}
        />
      </ReactFlow>
    </div>
  );
}
