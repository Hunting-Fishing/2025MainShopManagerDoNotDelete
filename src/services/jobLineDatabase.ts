
// Replace mock data with real database service
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export const getJobLines = async (workOrderId: string): Promise<WorkOrderJobLine[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      throw new Error('Failed to fetch job lines');
    }

    return data || [];
  } catch (error) {
    console.error('Error in getJobLines:', error);
    return [];
  }
};

export const createJobLine = async (jobLineData: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> => {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert(jobLineData)
      .select()
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw new Error('Failed to create job line');
    }

    return data;
  } catch (error) {
    console.error('Error in createJobLine:', error);
    throw error;
  }
};

export const updateJobLine = async (id: string, updates: Partial<WorkOrderJobLine>): Promise<WorkOrderJobLine> => {
  try {
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw new Error('Failed to update job line');
    }

    return data;
  } catch (error) {
    console.error('Error in updateJobLine:', error);
    throw error;
  }
};

export const deleteJobLine = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting job line:', error);
      throw new Error('Failed to delete job line');
    }
  } catch (error) {
    console.error('Error in deleteJobLine:', error);
    throw error;
  }
};

// Remove the mock data
export const sampleJobLines: WorkOrderJobLine[] = [];
