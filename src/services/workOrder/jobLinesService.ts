import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine, JobLineFormValues, isValidJobLineStatus, isValidLaborRateType } from '@/types/jobLine';

export async function getWorkOrderJobLines(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    console.log('Fetching job lines for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_job_lines')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('display_order', { ascending: true });

    if (error) {
      console.error('Error fetching job lines:', error);
      throw error;
    }

    console.log('Retrieved job lines:', data);
    
    // Map and validate the data
    return (data || []).map(item => ({
      ...item,
      status: isValidJobLineStatus(item.status) ? item.status : 'pending',
      labor_rate_type: isValidLaborRateType(item.labor_rate_type) ? item.labor_rate_type : 'standard'
    })) as WorkOrderJobLine[];
  } catch (error) {
    console.error('Error in getWorkOrderJobLines:', error);
    throw error;
  }
}

export async function createWorkOrderJobLine(
  workOrderId: string,
  jobLineData: JobLineFormValues
): Promise<WorkOrderJobLine> {
  try {
    console.log('Creating job line for work order:', workOrderId, 'with data:', jobLineData);
    
    const insertData = {
      work_order_id: workOrderId,
      name: jobLineData.name,
      category: jobLineData.category || '',
      subcategory: jobLineData.subcategory || '',
      description: jobLineData.description || '',
      estimated_hours: jobLineData.estimated_hours || 0,
      labor_rate: jobLineData.labor_rate || 0,
      labor_rate_type: isValidLaborRateType(jobLineData.labor_rate_type || 'standard') ? jobLineData.labor_rate_type : 'standard',
      total_amount: jobLineData.total_amount || (jobLineData.estimated_hours || 0) * (jobLineData.labor_rate || 0),
      status: isValidJobLineStatus(jobLineData.status || 'pending') ? jobLineData.status : 'pending',
      notes: jobLineData.notes || '',
      display_order: jobLineData.display_order || 0
    };

    console.log('Inserting job line data:', insertData);

    const { data, error } = await supabase
      .from('work_order_job_lines')
      .insert(insertData)
      .select()
      .single();

    if (error) {
      console.error('Error creating job line:', error);
      throw error;
    }

    console.log('Successfully created job line:', data);
    
    // Return with proper type casting
    return {
      ...data,
      status: isValidJobLineStatus(data.status) ? data.status : 'pending',
      labor_rate_type: isValidLaborRateType(data.labor_rate_type) ? data.labor_rate_type : 'standard'
    } as WorkOrderJobLine;
  } catch (error) {
    console.error('Error in createWorkOrderJobLine:', error);
    throw error;
  }
}

export async function updateWorkOrderJobLine(
  jobLineId: string,
  jobLineData: Partial<WorkOrderJobLine>
): Promise<WorkOrderJobLine> {
  try {
    console.log('Updating job line:', jobLineId, 'with data:', jobLineData);
    
    const updateData = {
      name: jobLineData.name,
      category: jobLineData.category,
      subcategory: jobLineData.subcategory,
      description: jobLineData.description,
      estimated_hours: jobLineData.estimated_hours,
      labor_rate: jobLineData.labor_rate,
      labor_rate_type: jobLineData.labor_rate_type && isValidLaborRateType(jobLineData.labor_rate_type) ? jobLineData.labor_rate_type : 'standard',
      total_amount: jobLineData.total_amount,
      status: jobLineData.status && isValidJobLineStatus(jobLineData.status) ? jobLineData.status : 'pending',
      notes: jobLineData.notes,
      display_order: jobLineData.display_order,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('work_order_job_lines')
      .update(updateData)
      .eq('id', jobLineId)
      .select()
      .single();

    if (error) {
      console.error('Error updating job line:', error);
      throw error;
    }

    console.log('Successfully updated job line:', data);
    
    // Return with proper type casting
    return {
      ...data,
      status: isValidJobLineStatus(data.status) ? data.status : 'pending',
      labor_rate_type: isValidLaborRateType(data.labor_rate_type) ? data.labor_rate_type : 'standard'
    } as WorkOrderJobLine;
  } catch (error) {
    console.error('Error in updateWorkOrderJobLine:', error);
    throw error;
  }
}

export async function upsertWorkOrderJobLine(
  workOrderId: string,
  jobLineData: Partial<WorkOrderJobLine>
): Promise<WorkOrderJobLine> {
  try {
    if (jobLineData.id && !jobLineData.id.startsWith('temp-')) {
      return await updateWorkOrderJobLine(jobLineData.id, jobLineData);
    } else {
      return await createWorkOrderJobLine(workOrderId, jobLineData as JobLineFormValues);
    }
  } catch (error) {
    console.error('Error in upsertWorkOrderJobLine:', error);
    throw error;
  }
}

export async function deleteWorkOrderJobLine(jobLineId: string): Promise<void> {
  try {
    console.log('Deleting job line:', jobLineId);
    
    const { error } = await supabase
      .from('work_order_job_lines')
      .delete()
      .eq('id', jobLineId);

    if (error) {
      console.error('Error deleting job line:', error);
      throw error;
    }

    console.log('Successfully deleted job line:', jobLineId);
  } catch (error) {
    console.error('Error in deleteWorkOrderJobLine:', error);
    throw error;
  }
}
