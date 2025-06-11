
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Get parts for a specific job line
 */
export async function getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
  try {
    console.log('getJobLineParts: Fetching parts for job line:', jobLineId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getJobLineParts: Error:', error);
      throw error;
    }

    console.log('getJobLineParts: Successfully fetched parts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getJobLineParts: Failed to fetch parts:', error);
    return [];
  }
}

/**
 * Get all parts for a work order
 */
export async function getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
  try {
    console.log('getWorkOrderParts: Fetching parts for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('getWorkOrderParts: Error:', error);
      throw error;
    }

    console.log('getWorkOrderParts: Successfully fetched parts:', data?.length || 0);
    return data || [];
  } catch (error) {
    console.error('getWorkOrderParts: Failed to fetch parts:', error);
    return [];
  }
}

/**
 * Create or update a work order part
 */
export async function upsertWorkOrderPart(part: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('upsertWorkOrderPart: Upserting part:', part);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .upsert({
        id: part.id,
        work_order_id: part.work_order_id,
        job_line_id: part.job_line_id,
        part_number: part.part_number,
        name: part.name,
        description: part.description,
        quantity: part.quantity,
        unit_price: part.unit_price,
        total_price: part.total_price,
        status: part.status || 'pending',
        notes: part.notes
      })
      .select()
      .single();

    if (error) {
      console.error('upsertWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('upsertWorkOrderPart: Successfully upserted part:', data);
    return data;
  } catch (error) {
    console.error('upsertWorkOrderPart: Failed to upsert part:', error);
    throw error;
  }
}

/**
 * Delete a work order part
 */
export async function deleteWorkOrderPart(partId: string): Promise<void> {
  try {
    console.log('deleteWorkOrderPart: Deleting part:', partId);
    
    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('deleteWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('deleteWorkOrderPart: Successfully deleted part');
  } catch (error) {
    console.error('deleteWorkOrderPart: Failed to delete part:', error);
    throw error;
  }
}
