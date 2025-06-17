
import { WorkOrderJobLine } from '@/types/jobLine';
import { supabase } from '@/integrations/supabase/client';

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  if (!workOrderId || workOrderId === 'new') {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      throw error;
    }

    return (data || []).map(line => ({
      id: line.id,
      work_order_id: line.work_order_id,
      name: line.name,
      category: line.category || '',
      subcategory: line.subcategory || '',
      description: line.description || '',
      estimated_hours: line.estimated_hours || 0,
      labor_rate: line.labor_rate || 0,
      labor_rate_type: (line.labor_rate_type || 'standard') as 'standard' | 'overtime' | 'premium' | 'flat_rate',
      total_amount: line.total_amount || 0,
      status: (line.status || 'pending') as 'pending' | 'in-progress' | 'completed' | 'on-hold',
      display_order: line.display_order || 0,
      notes: line.notes || '',
      created_at: line.created_at,
      updated_at: line.updated_at
    }));
  } catch (error) {
    console.error('Error in getWorkOrderJobLines:', error);
    throw error;
  }
}

export async function createJobLine(jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert([{
        work_order_id: jobLine.work_order_id,
        name: jobLine.name,
        category: jobLine.category,
        subcategory: jobLine.subcategory,
        description: jobLine.description,
        estimated_hours: jobLine.estimated_hours,
        labor_rate: jobLine.labor_rate,
        labor_rate_type: jobLine.labor_rate_type,
        total_amount: jobLine.total_amount,
        status: jobLine.status,
        display_order: jobLine.display_order,
        notes: jobLine.notes
      }])
      .select('*')
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw error;
    }

    return {
      id: data.id,
      work_order_id: data.work_order_id,
      name: data.name,
      category: data.category || '',
      subcategory: data.subcategory || '',
      description: data.description || '',
      estimated_hours: data.estimated_hours || 0,
      labor_rate: data.labor_rate || 0,
      labor_rate_type: (data.labor_rate_type || 'standard') as 'standard' | 'overtime' | 'premium' | 'flat_rate',
      total_amount: data.total_amount || 0,
      status: (data.status || 'pending') as 'pending' | 'in-progress' | 'completed' | 'on-hold',
      display_order: data.display_order || 0,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in createJobLine:', error);
    throw error;
  }
}

export async function updateJobLine(id: string, updates: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update({
        name: updates.name,
        category: updates.category,
        subcategory: updates.subcategory,
        description: updates.description,
        estimated_hours: updates.estimated_hours,
        labor_rate: updates.labor_rate,
        labor_rate_type: updates.labor_rate_type,
        total_amount: updates.total_amount,
        status: updates.status,
        display_order: updates.display_order,
        notes: updates.notes
      })
      .eq('id', id)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw error;
    }

    return {
      id: data.id,
      work_order_id: data.work_order_id,
      name: data.name,
      category: data.category || '',
      subcategory: data.subcategory || '',
      description: data.description || '',
      estimated_hours: data.estimated_hours || 0,
      labor_rate: data.labor_rate || 0,
      labor_rate_type: (data.labor_rate_type || 'standard') as 'standard' | 'overtime' | 'premium' | 'flat_rate',
      total_amount: data.total_amount || 0,
      status: (data.status || 'pending') as 'pending' | 'in-progress' | 'completed' | 'on-hold',
      display_order: data.display_order || 0,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  } catch (error) {
    console.error('Error in updateJobLine:', error);
    throw error;
  }
}

export async function deleteJobLine(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteJobLine:', error);
    throw error;
  }
}

// Alias exports for backward compatibility with existing imports
export const createWorkOrderJobLine = createJobLine;
export const updateWorkOrderJobLine = updateJobLine;
export const deleteWorkOrderJobLine = deleteJobLine;

// Additional alias for upsert functionality
export async function upsertWorkOrderJobLine(jobLine: Partial<WorkOrderJobLine> & { work_order_id: string }): Promise<WorkOrderJobLine> {
  if (jobLine.id) {
    return updateJobLine(jobLine.id, jobLine);
  } else {
    return createJobLine(jobLine as Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>);
  }
}
