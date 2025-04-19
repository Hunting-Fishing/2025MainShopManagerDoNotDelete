
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { ChevronRight, CircleX, CornerDownRight, CheckCircle2, AlertCircle } from 'lucide-react';

export function TaskNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border-2 border-blue-300 rounded-xl bg-blue-50 p-4 shadow-md min-w-[180px] transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />
      <div className="text-center font-medium text-blue-700">{data.label}</div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-2 text-blue-600/80">{data.description}</div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

export function DecisionNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border-2 border-yellow-300 rounded-xl bg-yellow-50 p-4 shadow-md min-w-[180px] rotate-45">
      <div className="-rotate-45">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 -rotate-45 bg-yellow-500" />
        <div className="text-center font-medium text-yellow-800">{data.label}</div>
        {data.description && (
          <div className="text-xs text-muted-foreground mt-1.5">{data.description}</div>
        )}
        <div className="text-xs text-center mt-2 flex justify-around">
          <div className="text-green-600 flex items-center"><CheckCircle2 className="h-3 w-3 mr-1" /> Yes</div>
          <div className="text-red-600 flex items-center"><CircleX className="h-3 w-3 mr-1" /> No</div>
        </div>
        <Handle 
          type="source" 
          position={Position.Right} 
          id="yes" 
          isConnectable={isConnectable} 
          className="w-3 h-3 bg-green-500" 
        />
        <Handle 
          type="source" 
          position={Position.Bottom} 
          id="no" 
          isConnectable={isConnectable} 
          className="w-3 h-3 bg-red-500" 
        />
      </div>
    </div>
  );
}

export function StartNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-gradient-to-r from-green-400 to-green-600 border-2 border-green-300 p-4 shadow-md min-w-[120px] text-center transition-shadow hover:shadow-lg">
      <div className="font-medium text-white flex items-center justify-center">
        <CornerDownRight className="h-4 w-4 mr-1.5" />
        {data.label || 'Start'}
      </div>
      <Handle 
        type="source" 
        position={Position.Bottom} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-white" 
      />
    </div>
  );
}

export function EndNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-gradient-to-r from-red-400 to-red-600 border-2 border-red-300 p-4 shadow-md min-w-[120px] text-center transition-shadow hover:shadow-lg">
      <Handle 
        type="target" 
        position={Position.Top} 
        isConnectable={isConnectable} 
        className="w-3 h-3 bg-white" 
      />
      <div className="font-medium text-white flex items-center justify-center">
        <AlertCircle className="h-4 w-4 mr-1.5" />
        {data.label || 'End'}
      </div>
    </div>
  );
}

export const nodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};
