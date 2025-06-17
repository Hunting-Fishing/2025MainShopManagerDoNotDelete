
import { supabase } from '@/config/supabase';
import { WorkOrderJobLine } from '@/types/jobLine';
import { isValidLaborRateType } from '@/types/jobLine';

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  console.log('Fetching job lines for work order:', workOrderId);
  
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      throw new Error(`Failed to fetch job lines: ${error.message}`);
    }

    console.log('Raw job lines data:', data);

    if (!data) {
      console.log('No job lines found');
      return [];
    }

    // Map the data and ensure proper type casting for labor_rate_type
    const mappedJobLines: WorkOrderJobLine[] = data.map(line => ({
      id: line.id,
      work_order_id: line.work_order_id,
      name: line.name || '',
      category: line.category || '',
      subcategory: line.subcategory || '',
      description: line.description || '',
      estimated_hours: line.estimated_hours || 0,
      labor_rate: line.labor_rate || 0,
      labor_rate_type: isValidLaborRateType(line.labor_rate_type) ? line.labor_rate_type : 'standard',
      total_amount: line.total_amount || 0,
      status: line.status || 'pending',
      display_order: line.display_order || 0,
      notes: line.notes || '',
      created_at: line.created_at,
      updated_at: line.updated_at
    }));

    console.log('Mapped job lines:', mappedJobLines);
    return mappedJobLines;

  } catch (error) {
    console.error('Error in getWorkOrderJobLines:', error);
    throw error;
  }
}

export async function createWorkOrderJobLine(jobLine: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderJobLine> {
  console.log('Creating job line:', jobLine);
  
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert([jobLine])
      .select()
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw new Error(`Failed to create job line: ${error.message}`);
    }

    // Ensure proper type casting for the returned data
    const mappedJobLine: WorkOrderJobLine = {
      id: data.id,
      work_order_id: data.work_order_id,
      name: data.name || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      description: data.description || '',
      estimated_hours: data.estimated_hours || 0,
      labor_rate: data.labor_rate || 0,
      labor_rate_type: isValidLaborRateType(data.labor_rate_type) ? data.labor_rate_type : 'standard',
      total_amount: data.total_amount || 0,
      status: data.status || 'pending',
      display_order: data.display_order || 0,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log('Created job line:', mappedJobLine);
    return mappedJobLine;

  } catch (error) {
    console.error('Error in createWorkOrderJobLine:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(id: string, updates: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> {
  console.log('Updating job line:', id, updates);
  
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw new Error(`Failed to update job line: ${error.message}`);
    }

    // Ensure proper type casting for the returned data
    const mappedJobLine: WorkOrderJobLine = {
      id: data.id,
      work_order_id: data.work_order_id,
      name: data.name || '',
      category: data.category || '',
      subcategory: data.subcategory || '',
      description: data.description || '',
      estimated_hours: data.estimated_hours || 0,
      labor_rate: data.labor_rate || 0,
      labor_rate_type: isValidLaborRateType(data.labor_rate_type) ? data.labor_rate_type : 'standard',
      total_amount: data.total_amount || 0,
      status: data.status || 'pending',
      display_order: data.display_order || 0,
      notes: data.notes || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };

    console.log('Updated job line:', mappedJobLine);
    return mappedJobLine;

  } catch (error) {
    console.error('Error in updateWorkOrderJobLine:', error);
    throw error;
  }
}

export async function upsertWorkOrderJobLine(jobLine: Partial<WorkOrderJobLine> & { work_order_id: string }): Promise<WorkOrderJobLine> {
  if (jobLine.id) {
    return updateWorkOrderJobLine(jobLine.id, jobLine);
  } else {
    return createWorkOrderJobLine(jobLine as Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>);
  }
}

export async function deleteWorkOrderJobLine(id: string): Promise<void> {
  console.log('Deleting job line:', id);
  
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job line:', error);
      throw new Error(`Failed to delete job line: ${error.message}`);
    }

    console.log('Successfully deleted job line:', id);

  } catch (error) {
    console.error('Error in deleteWorkOrderJobLine:', error);
    throw error;
  }
}

export async function createMultipleJobLines(jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]): Promise<WorkOrderJobLine[]> {
  console.log('Creating multiple job lines:', jobLines);
  
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert(jobLines)
      .select();

    if (error) {
      console.error('Error creating multiple job lines:', error);
      throw new Error(`Failed to create job lines: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from job lines creation');
    }

    // Map the data and ensure proper type casting for labor_rate_type
    const mappedJobLines: WorkOrderJobLine[] = data.map(line => ({
      id: line.id,
      work_order_id: line.work_order_id,
      name: line.name || '',
      category: line.category || '',
      subcategory: line.subcategory || '',
      description: line.description || '',
      estimated_hours: line.estimated_hours || 0,
      labor_rate: line.labor_rate || 0,
      labor_rate_type: isValidLaborRateType(line.labor_rate_type) ? line.labor_rate_type : 'standard',
      total_amount: line.total_amount || 0,
      status: line.status || 'pending',
      display_order: line.display_order || 0,
      notes: line.notes || '',
      created_at: line.created_at,
      updated_at: line.updated_at
    }));

    console.log('Created multiple job lines:', mappedJobLines);
    return mappedJobLines;

  } catch (error) {
    console.error('Error in createMultipleJobLines:', error);
    throw error;
  }
}
