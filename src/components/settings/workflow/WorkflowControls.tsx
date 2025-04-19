
import { Button } from "@/components/ui/button";
import { PlusCircle, Save, Edit, Trash } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { WorkflowNode } from "@/types/workflow";

interface WorkflowControlsProps {
  onAddNode: (type: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function WorkflowControls({ onAddNode, onSave, isSaving }: WorkflowControlsProps) {
  return (
    <div className="bg-white shadow-md p-3 rounded-xl flex flex-wrap gap-3 text-sm border border-gray-100">
      <div className="border-r pr-3 mr-2">
        <p className="text-xs font-medium text-muted-foreground mb-2">Add Node</p>
        <div className="flex gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-green-100 border-green-300 text-green-800 hover:bg-green-200 rounded-full"
                  onClick={() => onAddNode('start')}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Start
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a start node</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="bg-blue-100 border-blue-300 text-blue-800 hover:bg-blue-200 rounded-full"
                  onClick={() => onAddNode('task')}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Task
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a task node</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-yellow-100 border-yellow-300 text-yellow-800 hover:bg-yellow-200 rounded-full"
                  onClick={() => onAddNode('decision')}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  Decision
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add a decision node</TooltipContent>
            </Tooltip>
          </TooltipProvider>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200 rounded-full"
                  onClick={() => onAddNode('end')}
                >
                  <PlusCircle className="h-3 w-3 mr-1" />
                  End
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add an end node</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-2">Actions</p>
        <Button
          variant="default"
          size="sm"
          className={cn("bg-indigo-600 hover:bg-indigo-700 text-white rounded-full", 
            isSaving && "opacity-70 pointer-events-none")}
          onClick={onSave}
          disabled={isSaving}
        >
          {isSaving ? 'Saving...' : 'Save Workflow'}
          <Save className="ml-2 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

interface WorkflowNodeToolbarProps {
  node: WorkflowNode;
  onNodeEdit: (id: string, data: any) => void;
  onNodeDelete: (id: string) => void;
}

export function WorkflowNodeToolbar({ node, onNodeEdit, onNodeDelete }: WorkflowNodeToolbarProps) {
  const handleLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onNodeEdit(node.id, { label: e.target.value });
  };

  if (node.type === 'start' || node.type === 'end') {
    return null;
  }

  return (
    <div className="absolute -top-12 left-0 bg-white p-1.5 rounded-lg shadow-md flex gap-2 text-xs items-center border border-gray-100">
      <input 
        type="text" 
        value={node.data?.label || ''} 
        onChange={handleLabelChange}
        className="border rounded-md px-2 py-1 text-xs w-28"
        placeholder="Node label"
      />
      <Tooltip>
        <TooltipTrigger asChild>
          <button 
            className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-gray-100"
            onClick={() => onNodeDelete(node.id)}
            aria-label="Delete node"
          >
            <Trash className="h-3.5 w-3.5" />
          </button>
        </TooltipTrigger>
        <TooltipContent>Delete node</TooltipContent>
      </Tooltip>
    </div>
  );
}
