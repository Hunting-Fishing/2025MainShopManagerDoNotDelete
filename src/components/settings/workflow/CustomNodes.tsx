
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';
import { ChevronRight, CircleX, CornerDownRight, CheckCircle2, AlertCircle, Activity, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

export function TaskNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border-2 border-blue-300 rounded-xl bg-gradient-to-r from-blue-50 to-blue-100 p-4 shadow-lg min-w-[180px] transition-all hover:shadow-xl">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />
      <div className="flex items-center justify-center">
        <Activity className="h-4 w-4 mr-2 text-blue-600" />
        <div className="font-medium text-blue-700">{data.label}</div>
      </div>
      {data.description && (
        <div className="text-xs text-muted-foreground mt-2 text-blue-600/80 bg-blue-50 p-1.5 rounded border border-blue-200">
          {data.description}
        </div>
      )}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-3 h-3 bg-blue-500" />
    </div>
  );
}

export function DecisionNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border-2 border-yellow-300 rounded-xl bg-gradient-to-r from-yellow-50 to-yellow-100 p-4 shadow-lg min-w-[200px] rotate-45">
      <div className="-rotate-45">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-3 h-3 -rotate-45 bg-yellow-500" />
        <div className="flex items-center justify-center">
          <div className="font-medium text-yellow-800 flex items-center">
            <ChevronRight className="h-4 w-4 mr-1.5 text-yellow-600" />
            {data.label}
          </div>
        </div>
        {data.description && (
          <div className="text-xs text-yellow-700 mt-1.5 bg-yellow-50 p-1.5 rounded border border-yellow-200">
            {data.description}
          </div>
        )}
        <div className="text-xs text-center mt-3 flex justify-around">
          <div className="text-green-600 flex items-center bg-green-50 px-2 py-0.5 rounded-full border border-green-200">
            <CheckCircle2 className="h-3 w-3 mr-1" /> Yes
          </div>
          <div className="text-red-600 flex items-center bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
            <CircleX className="h-3 w-3 mr-1" /> No
          </div>
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
    <div className="rounded-full bg-gradient-to-r from-green-400 to-green-600 border-2 border-green-300 p-4 shadow-lg min-w-[130px] text-center transition-all hover:shadow-xl">
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
    <div className="rounded-full bg-gradient-to-r from-red-400 to-red-600 border-2 border-red-300 p-4 shadow-lg min-w-[130px] text-center transition-all hover:shadow-xl">
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
