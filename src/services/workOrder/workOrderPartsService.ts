
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';

// Transform raw part data to ensure proper mapping
export const transformPartData = (rawPart: any): WorkOrderPart => {
  return {
    id: rawPart.id,
    work_order_id: rawPart.work_order_id,
    job_line_id: rawPart.job_line_id,
    part_number: rawPart.part_number || '',
    name: rawPart.name || rawPart.partName || '',
    description: rawPart.description || '',
    quantity: Number(rawPart.quantity) || 0,
    unit_price: Number(rawPart.unit_price) || Number(rawPart.customerPrice) || 0,
    total_price: Number(rawPart.total_price) || (Number(rawPart.unit_price || rawPart.customerPrice || 0) * Number(rawPart.quantity || 0)),
    status: rawPart.status || 'pending',
    notes: rawPart.notes || '',
    created_at: rawPart.created_at,
    updated_at: rawPart.updated_at,
    
    // Backward compatibility aliases
    partName: rawPart.name || rawPart.partName || '',
    partNumber: rawPart.part_number || '',
    customerPrice: Number(rawPart.unit_price) || Number(rawPart.customerPrice) || 0,
    workOrderId: rawPart.work_order_id,
    jobLineId: rawPart.job_line_id
  };
};

export const getWorkOrderParts = async (workOrderId: string): Promise<WorkOrderPart[]> => {
  try {
    console.log('Fetching work order parts for:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw error;
    }

    console.log('Raw parts data:', data);
    
    // Transform the data to ensure proper mapping
    const transformedParts = (data || []).map(transformPartData);
    
    console.log('Transformed parts data:', transformedParts);
    
    return transformedParts;
  } catch (error) {
    console.error('Error in getWorkOrderParts:', error);
    return [];
  }
};

export const createWorkOrderPart = async (
  workOrderId: string,
  partData: WorkOrderPartFormValues
): Promise<WorkOrderPart | null> => {
  try {
    console.log('Creating work order part:', { workOrderId, partData });

    // Calculate total price
    const totalPrice = (partData.unit_price || partData.customerPrice || 0) * (partData.quantity || 0);

    const newPart = {
      work_order_id: workOrderId,
      job_line_id: partData.job_line_id || null,
      part_number: partData.part_number || partData.partNumber || '',
      name: partData.name || partData.partName || '',
      description: partData.description || '',
      quantity: partData.quantity || 0,
      unit_price: partData.unit_price || partData.customerPrice || 0,
      total_price: totalPrice,
      status: partData.status || 'pending',
      notes: partData.notes || ''
    };

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([newPart])
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw error;
    }

    console.log('Created work order part:', data);
    return transformPartData(data);
  } catch (error) {
    console.error('Error in createWorkOrderPart:', error);
    return null;
  }
};

export const updateWorkOrderPart = async (
  partId: string,
  partData: Partial<WorkOrderPartFormValues>
): Promise<WorkOrderPart | null> => {
  try {
    console.log('Updating work order part:', { partId, partData });

    const updateData: any = {};
    
    if (partData.name || partData.partName) {
      updateData.name = partData.name || partData.partName;
    }
    if (partData.part_number || partData.partNumber) {
      updateData.part_number = partData.part_number || partData.partNumber;
    }
    if (partData.description !== undefined) {
      updateData.description = partData.description;
    }
    if (partData.quantity !== undefined) {
      updateData.quantity = partData.quantity;
    }
    if (partData.unit_price !== undefined || partData.customerPrice !== undefined) {
      updateData.unit_price = partData.unit_price || partData.customerPrice;
    }
    if (partData.status !== undefined) {
      updateData.status = partData.status;
    }
    if (partData.notes !== undefined) {
      updateData.notes = partData.notes;
    }
    if (partData.job_line_id !== undefined) {
      updateData.job_line_id = partData.job_line_id;
    }

    // Recalculate total price if quantity or unit price changed
    if (updateData.quantity !== undefined || updateData.unit_price !== undefined) {
      // Get current part data to calculate total
      const { data: currentPart } = await supabase
        .from('work_order_parts')
        .select('quantity, unit_price')
        .eq('id', partId)
        .single();

      if (currentPart) {
        const newQuantity = updateData.quantity !== undefined ? updateData.quantity : currentPart.quantity;
        const newUnitPrice = updateData.unit_price !== undefined ? updateData.unit_price : currentPart.unit_price;
        updateData.total_price = newQuantity * newUnitPrice;
      }
    }

    updateData.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(updateData)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw error;
    }

    console.log('Updated work order part:', data);
    return transformPartData(data);
  } catch (error) {
    console.error('Error in updateWorkOrderPart:', error);
    return null;
  }
};

export const deleteWorkOrderPart = async (partId: string): Promise<boolean> => {
  try {
    console.log('Deleting work order part:', partId);

    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw error;
    }

    console.log('Deleted work order part:', partId);
    return true;
  } catch (error) {
    console.error('Error in deleteWorkOrderPart:', error);
    return false;
  }
};
