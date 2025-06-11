
import { WorkOrderJobLine } from '@/types/jobLine';

export const sampleJobLines: WorkOrderJobLine[] = [
  {
    id: '1',
    work_order_id: 'wo-1',
    name: 'Oil Change',
    category: 'Maintenance',
    subcategory: 'Routine',
    description: 'Regular oil change service',
    estimated_hours: 0.5,
    labor_rate: 120,
    total_amount: 60,
    status: 'pending',
    notes: '',
    display_order: 1,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];
