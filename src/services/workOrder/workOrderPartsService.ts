import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';

/**
 * Get all parts for a specific work order
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
    throw error;
  }
}

/**
 * Get all parts for a specific job line
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

    // Transform the data to ensure consistent property names
    const transformedData = data?.map(part => ({
      ...part,
      // Ensure all required properties have proper fallbacks
      part_number: part.part_number || '',
      name: part.name || part.partName || 'Unknown Part',
      unit_price: part.unit_price || part.customerPrice || 0,
      quantity: part.quantity || 0,
      total_price: part.total_price || (part.unit_price || 0) * (part.quantity || 0),
      // Keep aliases for backward compatibility
      partName: part.name || part.partName,
      partNumber: part.part_number || part.partNumber,
      customerPrice: part.unit_price || part.customerPrice
    })) || [];

    console.log('getJobLineParts: Successfully fetched and transformed parts:', transformedData.length);
    return transformedData;
  } catch (error) {
    console.error('getJobLineParts: Failed to fetch parts:', error);
    throw error;
  }
}

/**
 * Create a new work order part
 */
export async function createWorkOrderPart(partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('createWorkOrderPart: Creating part:', partData);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .insert({
        work_order_id: partData.work_order_id,
        job_line_id: partData.job_line_id,
        part_number: partData.part_number || '',
        name: partData.name || '',
        description: partData.description,
        quantity: partData.quantity || 0,
        unit_price: partData.unit_price || 0,
        total_price: partData.total_price || (partData.unit_price || 0) * (partData.quantity || 0),
        status: partData.status || 'pending',
        notes: partData.notes
      })
      .select()
      .single();

    if (error) {
      console.error('createWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('createWorkOrderPart: Successfully created part:', data);
    return data;
  } catch (error) {
    console.error('createWorkOrderPart: Failed to create part:', error);
    throw error;
  }
}

/**
 * Update an existing work order part
 */
export async function updateWorkOrderPart(partId: string, partData: Partial<WorkOrderPart>): Promise<WorkOrderPart> {
  try {
    console.log('updateWorkOrderPart: Updating part:', partId, partData);
    
    const updateData: any = {};
    
    // Only include defined fields in the update
    if (partData.part_number !== undefined) updateData.part_number = partData.part_number;
    if (partData.name !== undefined) updateData.name = partData.name;
    if (partData.description !== undefined) updateData.description = partData.description;
    if (partData.quantity !== undefined) updateData.quantity = partData.quantity;
    if (partData.unit_price !== undefined) updateData.unit_price = partData.unit_price;
    if (partData.total_price !== undefined) updateData.total_price = partData.total_price;
    if (partData.status !== undefined) updateData.status = partData.status;
    if (partData.notes !== undefined) updateData.notes = partData.notes;
    if (partData.job_line_id !== undefined) updateData.job_line_id = partData.job_line_id;

    // Calculate total_price if unit_price or quantity changed
    if (updateData.unit_price !== undefined || updateData.quantity !== undefined) {
      const currentPrice = updateData.unit_price ?? partData.unit_price ?? 0;
      const currentQuantity = updateData.quantity ?? partData.quantity ?? 0;
      updateData.total_price = currentPrice * currentQuantity;
    }

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('updateWorkOrderPart: Error:', error);
      throw error;
    }

    console.log('updateWorkOrderPart: Successfully updated part:', data);
    return data;
  } catch (error) {
    console.error('updateWorkOrderPart: Failed to update part:', error);
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
