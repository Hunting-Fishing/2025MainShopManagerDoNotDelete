
import React from 'react';
import { Handle, Position } from '@xyflow/react';
import { WorkflowNodeData } from '@/types/workflow';

export function TaskNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border border-blue-200 rounded-lg bg-white p-4 shadow-md min-w-[150px] transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-blue-400" />
      <div className="text-center font-medium text-gray-700">{data.label}</div>
      {data.description && <div className="text-xs text-muted-foreground mt-1">{data.description}</div>}
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-blue-400" />
    </div>
  );
}

export function DecisionNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="border border-yellow-300 rounded-lg bg-yellow-50 p-3 shadow-md min-w-[150px] rotate-45">
      <div className="-rotate-45">
        <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 -rotate-45 bg-yellow-400" />
        <div className="text-center font-medium text-yellow-800">{data.label}</div>
        {data.description && <div className="text-xs text-muted-foreground mt-1">{data.description}</div>}
        <div className="text-xs text-center mt-1 flex justify-around">
          <div className="text-green-600">Yes →</div>
          <div className="text-red-600">↓ No</div>
        </div>
        <Handle type="source" position={Position.Right} id="yes" isConnectable={isConnectable} className="w-2 h-2 bg-green-400" />
        <Handle type="source" position={Position.Bottom} id="no" isConnectable={isConnectable} className="w-2 h-2 bg-red-400" />
      </div>
    </div>
  );
}

export function StartNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-green-100 border border-green-300 p-4 shadow-md min-w-[100px] text-center transition-shadow hover:shadow-lg">
      <div className="font-medium text-green-800">{data.label || 'Start'}</div>
      <Handle type="source" position={Position.Bottom} isConnectable={isConnectable} className="w-2 h-2 bg-green-400" />
    </div>
  );
}

export function EndNode({ data, isConnectable }: { data: WorkflowNodeData, isConnectable: boolean }) {
  return (
    <div className="rounded-full bg-red-100 border border-red-300 p-4 shadow-md min-w-[100px] text-center transition-shadow hover:shadow-lg">
      <Handle type="target" position={Position.Top} isConnectable={isConnectable} className="w-2 h-2 bg-red-400" />
      <div className="font-medium text-red-800">{data.label || 'End'}</div>
    </div>
  );
}

export const nodeTypes = {
  task: TaskNode,
  decision: DecisionNode,
  start: StartNode,
  end: EndNode,
};
