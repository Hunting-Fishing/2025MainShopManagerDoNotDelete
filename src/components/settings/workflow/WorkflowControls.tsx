
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlayCircle, Save, Plus, GitBranch, PlusSquare, CircleHelp, CircleOff, Flag } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { Card } from '@/components/ui/card';
import { WorkflowNode } from '@/types/workflow';
import { cn } from '@/lib/utils';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { NodeToolbar, Position } from '@xyflow/react';

interface WorkflowControlsProps {
  onAddNode: (type: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

interface WorkflowNodeToolbarProps {
  node: WorkflowNode;
  onNodeEdit: (id: string, data: any) => void;
  onNodeDelete: (id: string) => void;
}

export function WorkflowControls({ onAddNode, onSave, isSaving }: WorkflowControlsProps) {
  return (
    <Card className="p-3 w-auto space-y-3 shadow-md border-gray-200 bg-white bg-opacity-95">
      <div className="font-medium text-sm text-gray-700 mb-2 flex items-center">
        <GitBranch className="h-4 w-4 mr-1.5 text-indigo-600" /> Add Node
      </div>
      <div className="grid grid-cols-2 gap-2">
        <NodeButton
          type="start"
          label="Start"
          icon={<PlayCircle />}
          color="green"
          onClick={() => onAddNode('start')}
        />
        <NodeButton
          type="task"
          label="Task"
          icon={<PlusSquare />}
          color="blue"
          onClick={() => onAddNode('task')}
        />
        <NodeButton
          type="decision"
          label="Decision"
          icon={<GitBranch />}
          color="yellow"
          onClick={() => onAddNode('decision')}
        />
        <NodeButton
          type="end"
          label="End"
          icon={<Flag />}
          color="red"
          onClick={() => onAddNode('end')}
        />
      </div>
    </Card>
  );
}

function NodeButton({ 
  type, 
  label, 
  icon, 
  color, 
  onClick 
}: { 
  type: string; 
  label: string; 
  icon: React.ReactNode; 
  color: 'green' | 'blue' | 'yellow' | 'red'; 
  onClick: () => void; 
}) {
  const colorStyles = {
    green: {
      bg: "bg-green-100",
      border: "border-green-300",
      text: "text-green-800",
      hover: "hover:bg-green-200",
    },
    blue: {
      bg: "bg-blue-100",
      border: "border-blue-300",
      text: "text-blue-800",
      hover: "hover:bg-blue-200",
    },
    yellow: {
      bg: "bg-yellow-100",
      border: "border-yellow-300",
      text: "text-yellow-800",
      hover: "hover:bg-yellow-200",
    },
    red: {
      bg: "bg-red-100",
      border: "border-red-300",
      text: "text-red-800",
      hover: "hover:bg-red-200",
    },
  };

  const styles = colorStyles[color];
  
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          className={cn(
            "flex flex-col items-center justify-center p-2 rounded-lg border transition-colors",
            "text-sm font-medium w-full",
            styles.bg,
            styles.border,
            styles.text,
            styles.hover
          )}
          onClick={onClick}
        >
          <div className="mb-1">{icon}</div>
          {label}
        </button>
      </TooltipTrigger>
      <TooltipContent side="right">
        <p>Add {label} Node</p>
      </TooltipContent>
    </Tooltip>
  );
}

export function WorkflowNodeToolbar({ node, onNodeEdit, onNodeDelete }: WorkflowNodeToolbarProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState(node.data.label || '');
  
  const handleEdit = () => {
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onNodeEdit(node.id, { ...node.data, label });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setLabel(node.data.label || '');
    setIsEditing(false);
  };
  
  return (
    <NodeToolbar 
      nodeId={node.id}  // Change from 'node={node}' to 'nodeId={node.id}'
      position={Position.Top} 
      offset={10}
      className="bg-white rounded-md shadow-md border p-2 flex items-center space-x-2"
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button 
            variant="ghost" 
            size="sm"
            className="h-7 px-2 text-xs"
          >
            Edit
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-72 p-3">
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium">Node Label</label>
              <input 
                type="text" 
                value={label}
                onChange={(e) => setLabel(e.target.value)}
                className="w-full mt-1 px-3 py-1 border rounded text-sm"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleCancel}
                className="h-7 px-2 text-xs"
              >
                Cancel
              </Button>
              <Button 
                variant="default" 
                size="sm" 
                onClick={handleSave}
                className="h-7 px-2 text-xs bg-indigo-600 hover:bg-indigo-700"
              >
                Save
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
      <Button 
        variant="ghost" 
        size="sm" 
        className="h-7 px-2 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
        onClick={() => onNodeDelete(node.id)}
      >
        Delete
      </Button>
    </NodeToolbar>
  );
}
