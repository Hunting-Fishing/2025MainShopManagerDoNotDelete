
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export const getJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw error;
    }

    // Map database fields to TypeScript interface
    return (data || []).map(part => ({
      ...part,
      name: part.part_name || '',
      unit_price: part.customer_price || 0,
      total_price: (part.customer_price || 0) * (part.quantity || 0)
    }));
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    // Map database fields to TypeScript interface
    return (data || []).map(part => ({
      ...part,
      name: part.part_name || '',
      unit_price: part.customer_price || 0,
      total_price: (part.customer_price || 0) * (part.quantity || 0)
    }));
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
};

export const createWorkOrderPart = async (
  workOrderId: string,
  jobLineId: string | null,
  values: WorkOrderPartFormValues
): Promise<WorkOrderPart> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: workOrderId,
        job_line_id: jobLineId,
        part_number: values.part_number,
        part_name: values.name || values.partName,
        quantity: values.quantity,
        customer_price: values.unit_price,
        part_type: values.partType || 'OEM',
        status: values.status,
        notes: values.notes,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    // Map database fields to TypeScript interface
    return {
      ...data,
      name: data.part_name || '',
      unit_price: data.customer_price || 0,
      total_price: (data.customer_price || 0) * (data.quantity || 0)
    } as WorkOrderPart;
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
};

export const updateWorkOrderPart = async (
  partId: string,
  values: WorkOrderPartFormValues
): Promise<WorkOrderPart | null> => {
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .update({
        part_number: values.part_number,
        part_name: values.name || values.partName,
        quantity: values.quantity,
        customer_price: values.unit_price,
        part_type: values.partType || 'OEM',
        status: values.status,
        notes: values.notes,
      })
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    // Map database fields to TypeScript interface
    return {
      ...data,
      name: data.part_name || '',
      unit_price: data.customer_price || 0,
      total_price: (data.customer_price || 0) * (data.quantity || 0)
    } as WorkOrderPart;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    return null;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<boolean> => {
  try {
    const { error } = await supabase.from('work_order_parts').delete().eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    return false;
  }
};
