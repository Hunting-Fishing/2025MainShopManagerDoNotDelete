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
import { useCallback, useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Grid3X3, Save, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [showGrid, setShowGrid] = useState(true);
  
  // Track if workflow has been modified
  const [isModified, setIsModified] = useState(false);

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
    setIsModified(true);
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
    setIsModified(true);
  }, [reactFlowInstance]);

  const handleNodeDelete = useCallback((id: string) => {
    reactFlowInstance.setNodes(nds => nds.filter(node => node.id !== id));
    reactFlowInstance.setEdges(eds => eds.filter(edge => edge.source !== id && edge.target !== id));
    setIsModified(true);
  }, [reactFlowInstance]);

  // Custom node change handler to track modifications
  const handleNodesChange = useCallback((changes: any) => {
    onNodesChange(changes);
    if (changes.length > 0) {
      setIsModified(true);
    }
  }, [onNodesChange]);

  // Custom edge change handler to track modifications
  const handleEdgesChange = useCallback((changes: any) => {
    onEdgesChange(changes);
    if (changes.length > 0) {
      setIsModified(true);
    }
  }, [onEdgesChange]);

  // Custom connect handler to track new connections
  const handleConnect = useCallback((params: any) => {
    onConnect(params);
    setIsModified(true);
  }, [onConnect]);

  // Handle zoom controls
  const zoomIn = () => {
    reactFlowInstance.zoomIn();
  };

  const zoomOut = () => {
    reactFlowInstance.zoomOut();
  };

  const fitView = () => {
    reactFlowInstance.fitView();
  };

  // Handle saving with modification tracking
  const handleSave = () => {
    onSave();
    setIsModified(false);
  };

  return (
    <div className="flex flex-col w-full">
      <div className="flex justify-between items-center mb-3 p-2 bg-gradient-to-r from-indigo-50 to-blue-50 border rounded-lg">
        <div className="flex space-x-2">
          <Button
            onClick={zoomIn}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-slate-100"
          >
            <ZoomIn className="h-4 w-4 mr-1" /> Zoom In
          </Button>
          <Button
            onClick={zoomOut}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-slate-100"
          >
            <ZoomOut className="h-4 w-4 mr-1" /> Zoom Out
          </Button>
          <Button
            onClick={fitView}
            size="sm"
            variant="outline"
            className="bg-white hover:bg-slate-100"
          >
            Fit View
          </Button>
          <Button
            onClick={() => setShowGrid(!showGrid)}
            size="sm"
            variant="outline"
            className={cn(
              "bg-white hover:bg-slate-100",
              showGrid && "border-indigo-300 bg-indigo-50"
            )}
          >
            <Grid3X3 className="h-4 w-4 mr-1" /> 
            {showGrid ? "Hide Grid" : "Show Grid"}
          </Button>
        </div>
        <Button 
          onClick={handleSave}
          size="sm"
          variant={isModified ? "default" : "outline"}
          className={cn(
            isModified ? "bg-indigo-600 hover:bg-indigo-700" : "bg-white hover:bg-slate-100"
          )}
          disabled={isSaving}
        >
          <Save className="h-4 w-4 mr-1" />
          {isSaving ? "Saving..." : isModified ? "Save Changes" : "Saved"}
        </Button>
      </div>

      <div className="w-full h-[650px] border rounded-xl bg-background shadow-sm overflow-hidden">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={handleEdgesChange}
          onConnect={handleConnect}
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
              onSave={handleSave}
              isSaving={isSaving}
            />
          </Panel>
          
          {showGrid && <Background variant={BackgroundVariant.Dots} color="#ddd" gap={16} />}
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
    </div>
  );
}
