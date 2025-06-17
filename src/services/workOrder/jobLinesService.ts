
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export interface JobLineInsertData {
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
}

export interface JobLineUpdateData {
  name?: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
}

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

    console.log('Job lines fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Service error fetching job lines:', error);
    throw error;
  }
}

export async function createWorkOrderJobLine(jobLineData: JobLineInsertData): Promise<WorkOrderJobLine> {
  console.log('Creating job line:', jobLineData);
  
  try {
    // Calculate total_amount if not provided
    const totalAmount = jobLineData.total_amount ?? 
      ((jobLineData.estimated_hours || 0) * (jobLineData.labor_rate || 0));

    const dataToInsert = {
      ...jobLineData,
      total_amount: totalAmount,
      status: jobLineData.status || 'pending',
      labor_rate_type: jobLineData.labor_rate_type || 'standard',
      display_order: jobLineData.display_order ?? 0
    };

    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert([dataToInsert])
      .select()
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw new Error(`Failed to create job line: ${error.message}`);
    }

    console.log('Job line created successfully:', data);
    return data;
  } catch (error) {
    console.error('Service error creating job line:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(jobLineId: string, updateData: JobLineUpdateData): Promise<WorkOrderJobLine> {
  console.log('Updating job line:', jobLineId, updateData);
  
  try {
    // Calculate total_amount if hours or rate are being updated
    let dataToUpdate = { ...updateData };
    if (updateData.estimated_hours !== undefined || updateData.labor_rate !== undefined) {
      // Get current job line to calculate total
      const { data: currentJobLine } = await supabase
        .from('work_order_job_lines')
        .select('estimated_hours, labor_rate')
        .eq('id', jobLineId)
        .single();

      const hours = updateData.estimated_hours ?? currentJobLine?.estimated_hours ?? 0;
      const rate = updateData.labor_rate ?? currentJobLine?.labor_rate ?? 0;
      dataToUpdate.total_amount = hours * rate;
    }

    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update(dataToUpdate)
      .eq('id', jobLineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw new Error(`Failed to update job line: ${error.message}`);
    }

    console.log('Job line updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Service error updating job line:', error);
    throw error;
  }
}

export async function deleteWorkOrderJobLine(jobLineId: string): Promise<void> {
  console.log('Deleting job line:', jobLineId);
  
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', jobLineId);

    if (error) {
      console.error('Error deleting job line:', error);
      throw new Error(`Failed to delete job line: ${error.message}`);
    }

    console.log('Job line deleted successfully');
  } catch (error) {
    console.error('Service error deleting job line:', error);
    throw error;
  }
}

export async function upsertWorkOrderJobLine(jobLineData: JobLineInsertData & { id?: string }): Promise<WorkOrderJobLine> {
  if (jobLineData.id) {
    const { id, ...updateData } = jobLineData;
    return updateWorkOrderJobLine(id, updateData);
  } else {
    return createWorkOrderJobLine(jobLineData);
  }
}

export async function reorderJobLines(workOrderId: string, jobLineIds: string[]): Promise<void> {
  console.log('Reordering job lines for work order:', workOrderId);
  
  try {
    const updates = jobLineIds.map((id, index) => 
      supabase
        .from('work_order_job_lines')
        .update({ display_order: index })
        .eq('id', id)
        .eq('work_order_id', workOrderId)
    );

    const results = await Promise.all(updates);
    
    for (const result of results) {
      if (result.error) {
        console.error('Error reordering job line:', result.error);
        throw new Error(`Failed to reorder job lines: ${result.error.message}`);
      }
    }

    console.log('Job lines reordered successfully');
  } catch (error) {
    console.error('Service error reordering job lines:', error);
    throw error;
  }
}
