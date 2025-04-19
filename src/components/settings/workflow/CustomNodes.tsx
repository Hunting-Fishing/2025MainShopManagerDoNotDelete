
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';

export function TaskNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border rounded-lg bg-white p-4 shadow-md min-w-[150px]">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2" />
      <div className="text-center font-medium">{data.label}</div>
      {data.description && <div className="text-xs text-muted-foreground mt-1">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2" />
    </div>
  );
}

export function DecisionNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border rounded-lg bg-yellow-50 p-3 shadow-md min-w-[150px] rotate-45">
      <div className="-rotate-45">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 -rotate-45" />
        <div className="text-center font-medium">{data.label}</div>
        {data.description && <div className="text-xs text-muted-foreground mt-1">{data.description}</div>}
        <Handle type="source" position={Position.Right} id="yes" isConnectable={isConnectable} className="w-2 h-2" />
        <Handle type="source" position={Position.Bottom} id="no" isConnectable={isConnectable} className="w-2 h-2" />
      </div>
    </div>
  );
}

export function StartNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-green-100 border border-green-300 p-4 shadow-md min-w-[100px] text-center">
      <div className="font-medium">{data.label || 'Start'}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2" />
    </div>
  );
}

export function EndNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-red-100 border border-red-300 p-4 shadow-md min-w-[100px] text-center">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2" />
      <div className="font-medium">{data.label || 'End'}</div>
    </div>
  );
}

export const nodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};
