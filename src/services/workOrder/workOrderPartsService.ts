
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw new Error(`Failed to fetch work order parts: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getWorkOrderParts:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    return data || [];
  } catch (error) {
    console.error('Exception in getJobLineParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'>): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert(partData)
      .select('*')
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw new Error(`Failed to create work order part: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Exception in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updates)
      .eq('id', partId)
      .select('*')
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw new Error(`Failed to update work order part: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Exception in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw new Error(`Failed to delete work order part: ${error.message}`);
    }
  } catch (error) {
    console.error('Exception in deleteWorkOrderPart:', error);
    throw error;
  }
}
