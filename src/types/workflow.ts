
import { Node, Edge, NodeBase } from '@xyflow/react';

// Define workflow node data type
export interface WorkflowNodeData {
  label: string;
  [key: string]: any;
}

// Define workflow node type that extends the React Flow Node type
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
