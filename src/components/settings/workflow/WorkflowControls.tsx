
import { Button } from "@/components/ui/button";
import { PlusCircle, Save } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface WorkflowControlsProps {
  onAddNode: (type: string) => void;
  onSave: () => void;
  isSaving: boolean;
}

export function WorkflowControls({ onAddNode, onSave, isSaving }: WorkflowControlsProps) {
  return (
    <div className="bg-white shadow-sm p-2 rounded-lg flex flex-wrap gap-2 text-sm">
      <div className="border-r pr-2 mr-2">
        <p className="text-xs font-medium text-muted-foreground mb-1">Add Node</p>
        <div className="flex gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="xs"
                  className="bg-green-100 border-green-300 text-green-800 hover:bg-green-200"
                  onClick={() => onAddNode('start')}
                >
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
                  size="xs" 
                  className="border-blue-300 hover:bg-blue-50"
                  onClick={() => onAddNode('task')}
                >
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
                  size="xs"
                  className="bg-yellow-50 border-yellow-300 text-yellow-800 hover:bg-yellow-100"
                  onClick={() => onAddNode('decision')}
                >
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
                  size="xs"
                  className="bg-red-100 border-red-300 text-red-800 hover:bg-red-200"
                  onClick={() => onAddNode('end')}
                >
                  End
                </Button>
              </TooltipTrigger>
              <TooltipContent>Add an end node</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
      
      <div>
        <p className="text-xs font-medium text-muted-foreground mb-1">Actions</p>
        <Button
          variant="default"
          size="xs"
          className={cn("bg-blue-600 hover:bg-blue-700 text-white", 
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

export function WorkflowNodeToolbar({ node, onNodeEdit, onNodeDelete }) {
  const handleLabelChange = (e) => {
    onNodeEdit(node.id, { label: e.target.value });
  };

  return node.type !== 'start' && node.type !== 'end' ? (
    <div className="absolute -top-10 left-0 bg-white p-1 rounded shadow-md flex gap-1 text-xs items-center">
      <input 
        type="text" 
        value={node.data?.label || ''} 
        onChange={handleLabelChange}
        className="border rounded px-1 py-0.5 text-xs w-24"
      />
      <button 
        className="text-red-500 hover:text-red-700 px-1"
        onClick={() => onNodeDelete(node.id)}
      >
        ×
      </button>
    </div>
  ) : null;
}
