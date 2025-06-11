
export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  job_line_id?: string;
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface WorkOrderPartFormValues {
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  job_line_id?: string;
  notes?: string;
}

export const WORK_ORDER_PART_STATUSES = [
  'pending',
  'ordered',
  'received',
  'installed',
  'returned'
] as const;

export type WorkOrderPartStatus = typeof WORK_ORDER_PART_STATUSES[number];
