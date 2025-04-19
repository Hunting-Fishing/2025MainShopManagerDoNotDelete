
import React from 'react';
import { Button } from '@/components/ui/button';
import { PlusCircle, Save } from 'lucide-react';
import { WorkflowNode } from '@/types/workflow';
import { NodeToolbar } from '@xyflow/react';
import { useToast } from "@/hooks/use-toast";

interface WorkflowControlsProps {
  onAddNode: (type: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function WorkflowControls({ onAddNode, onSave, isSaving }: WorkflowControlsProps) {
  return (
    <div className="bg-white border rounded-lg p-4 mb-4 space-y-4">
      <h3 className="font-medium mb-2">Add Node</h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          variant="outline" 
          size="sm" 
          className="border-green-300 text-green-800 bg-green-100" 
          onClick={() => onAddNode('start')}
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Start
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => onAddNode('task')}
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Task
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-yellow-300 text-yellow-800 bg-yellow-100"
          onClick={() => onAddNode('decision')}
        >
          <PlusCircle className="w-4 h-4 mr-1" /> Decision
        </Button>
        <Button 
          variant="outline" 
          size="sm"
          className="border-red-300 text-red-800 bg-red-100"
          onClick={() => onAddNode('end')}
        >
          <PlusCircle className="w-4 h-4 mr-1" /> End
        </Button>
      </div>
      
      <div className="pt-2">
        <Button 
          onClick={onSave}
          disabled={isSaving}
          className="rounded-full text-sm px-4"
        >
          <Save className="w-4 h-4 mr-1" /> Save Workflow
        </Button>
      </div>
    </div>
  );
}

interface NodeToolbarProps {
  node: WorkflowNode;
  onNodeEdit: (id: string, data: any) => void;
  onNodeDelete: (id: string) => void;
}

export function WorkflowNodeToolbar({ node, onNodeEdit, onNodeDelete }: NodeToolbarProps) {
  const { toast } = useToast();

  const handleLabelEdit = () => {
    const newLabel = prompt("Enter new label:", node.data.label);
    if (newLabel !== null) {
      onNodeEdit(node.id, { ...node.data, label: newLabel });
      toast({
        title: "Node updated",
        description: "The node label has been updated",
      });
    }
  };

  const handleDelete = () => {
    if (confirm("Are you sure you want to delete this node?")) {
      onNodeDelete(node.id);
      toast({
        title: "Node deleted",
        description: "The node has been removed from the workflow",
      });
    }
  };

  return (
    <NodeToolbar>
      <div className="bg-background border rounded-md shadow-sm p-1 flex">
        <Button size="xs" variant="ghost" onClick={handleLabelEdit}>Edit</Button>
        <Button size="xs" variant="ghost" className="text-red-600" onClick={handleDelete}>Delete</Button>
      </div>
    </NodeToolbar>
  );
}
