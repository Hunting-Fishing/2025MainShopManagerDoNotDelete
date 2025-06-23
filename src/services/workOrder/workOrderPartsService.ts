
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for work order:', workOrderId);
  
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error fetching parts:', error);
      throw new Error(`Failed to fetch parts: ${error.message}`);
    }

    console.log('Parts fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    throw error;
  }
}

export async function createWorkOrderPart(
  partData: WorkOrderPartFormValues & { work_order_id: string; total_price: number }, 
  workOrderId: string
): Promise<WorkOrderPart> {
  console.log('Creating work order part:', { partData, workOrderId });
  
  try {
    // Validate input
    if (!workOrderId) {
      throw new Error('Work order ID is required');
    }
    
    if (!partData.name?.trim()) {
      throw new Error('Part name is required');
    }
    
    if (!partData.part_number?.trim()) {
      throw new Error('Part number is required');
    }
    
    if (partData.quantity <= 0) {
      throw new Error('Quantity must be greater than 0');
    }
    
    if (partData.unit_price < 0) {
      throw new Error('Unit price cannot be negative');
    }

    // Prepare data for insertion
    const insertData = {
      work_order_id: workOrderId,
      name: partData.name.trim(),
      part_number: partData.part_number.trim(),
      description: partData.description?.trim() || null,
      quantity: partData.quantity,
      unit_price: partData.unit_price,
      total_price: partData.total_price,
      job_line_id: partData.job_line_id || null,
      status: partData.status || 'pending',
      notes: partData.notes?.trim() || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    console.log('Inserting part data:', insertData);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([insertData])
      .select()
      .single();

    if (error) {
      console.error('Database error creating part:', error);
      throw new Error(`Failed to create part: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from part creation');
    }

    console.log('Part created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    throw error;
  }
}

export async function updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  console.log('Updating work order part:', { partId, updates });
  
  try {
    if (!partId) {
      throw new Error('Part ID is required');
    }

    const updateData = {
      ...updates,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Database error updating part:', error);
      throw new Error(`Failed to update part: ${error.message}`);
    }

    if (!data) {
      throw new Error('No data returned from part update');
    }

    console.log('Part updated successfully:', data);
    return data;
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    throw error;
  }
}

export async function deleteWorkOrderPart(partId: string): Promise<void> {
  console.log('Deleting work order part:', partId);
  
  try {
    if (!partId) {
      throw new Error('Part ID is required');
    }

    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Database error deleting part:', error);
      throw new Error(`Failed to delete part: ${error.message}`);
    }

    console.log('Part deleted successfully');
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    throw error;
  }
}

export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  console.log('Fetching parts for job line:', jobLineId);
  
  try {
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Database error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    console.log('Job line parts fetched successfully:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('Error in getJobLineParts:', error);
    throw error;
  }
}
