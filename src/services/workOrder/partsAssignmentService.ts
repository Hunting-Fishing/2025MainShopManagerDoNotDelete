
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

export async function getUnassignedParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .is('job_line_id', null)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching unassigned parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getUnassignedParts:', error);
    throw error;
  }
}

export async function assignPartToJobLine(partId: string, jobLineId: string): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: jobLineId, updated_at: new Date().toISOString() })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error assigning part to job line:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in assignPartToJobLine:', error);
    throw error;
  }
}

export async function unassignPart(partId: string): Promise<WorkOrderPart> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: null, updated_at: new Date().toISOString() })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error unassigning part:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in unassignPart:', error);
    throw error;
  }
}

export async function bulkAssignParts(partIds: string[], jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({ job_line_id: jobLineId, updated_at: new Date().toISOString() })
      .in('id', partIds)
      .select();

    if (error) {
      console.error('Error bulk assigning parts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in bulkAssignParts:', error);
    throw error;
  }
}

export async function getPartAssignmentHistory(partId: string) {
  // This would require a parts history table - placeholder for future implementation
  try {
    const { data, error } = await supabase
      .from('work_order_part_history')
      .select('*')
      .eq('part_id', partId)
      .order('changed_at', { ascending: false });

    if (error && error.code !== 'PGRST116') { // Ignore "relation does not exist" error
      console.error('Error fetching part assignment history:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getPartAssignmentHistory:', error);
    return [];
  }
}
