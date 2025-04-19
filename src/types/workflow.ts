
import { Node, Edge, NodeProps } from '@xyflow/react';

// Define workflow types
export type WorkflowNodeData = {
  label: string;
  [key: string]: any;
};

export type WorkflowNode = Node<WorkflowNodeData>;
export type WorkflowEdge = Edge;

export interface Workflow {
  id: string;
  name: string;
  description: string | null;
  workflow_type: string;
  is_active: boolean;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
  created_at: string;
  updated_at: string;
}

export type WorkflowUpdatePayload = {
  id: string;
  nodes: WorkflowNode[];
  edges: WorkflowEdge[];
};
