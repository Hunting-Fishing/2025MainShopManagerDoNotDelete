
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderJobLine } from '@/types/jobLine';

export async function loadJobLinesFromDatabase(workOrderId: string): Promise<WorkOrderJobLine[]> {
  try {
    console.log('Loading job lines from database for work order:', workOrderId);
    
    const { data, error } = await supabase.rpc('get_work_order_job_lines', {
      work_order_id_param: workOrderId
    });

    if (error) {
      console.error('Error loading job lines:', error);
      throw new Error(`Failed to load job lines: ${error.message}`);
    }

    console.log('Loaded job lines from database:', data);
    
    // Map database fields to TypeScript interface (snake_case to camelCase)
    const mappedData: WorkOrderJobLine[] = (data || []).map((item: any) => ({
      id: item.id,
      workOrderId: item.work_order_id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      description: item.description,
      estimatedHours: item.estimated_hours,
      laborRate: item.labor_rate,
      totalAmount: item.total_amount,
      status: item.status,
      notes: item.notes,
      createdAt: item.created_at,
      updatedAt: item.updated_at
    }));

    return mappedData;
  } catch (error) {
    console.error('Error in loadJobLinesFromDatabase:', error);
    throw error;
  }
}

export async function saveJobLinesToDatabase(workOrderId: string, jobLines: WorkOrderJobLine[]): Promise<void> {
  try {
    console.log('Saving job lines to database:', { workOrderId, jobLines });

    // First, delete existing job lines for this work order
    const { error: deleteError } = await supabase.rpc('delete_work_order_job_lines', {
      work_order_id_param: workOrderId
    });

    if (deleteError) {
      console.error('Error deleting existing job lines:', deleteError);
      throw new Error(`Failed to delete existing job lines: ${deleteError.message}`);
    }

    // Then, insert all job lines
    for (let i = 0; i < jobLines.length; i++) {
      const jobLine = jobLines[i];
      
      // Generate a proper UUID if the current ID is a temporary one
      let jobLineId = jobLine.id;
      if (jobLine.id.startsWith('temp-')) {
        jobLineId = crypto.randomUUID();
      }

      const { data, error } = await supabase.rpc('upsert_work_order_job_line', {
        p_id: jobLineId,
        p_work_order_id: workOrderId,
        p_name: jobLine.name || '',
        p_category: jobLine.category || null,
        p_subcategory: jobLine.subcategory || null,
        p_description: jobLine.description || null,
        p_estimated_hours: jobLine.estimatedHours || 0,
        p_labor_rate: jobLine.laborRate || 0,
        p_total_amount: jobLine.totalAmount || 0,
        p_status: jobLine.status || 'pending',
        p_notes: jobLine.notes || null,
        p_display_order: i + 1
      });

      if (error) {
        console.error('Error saving job line:', error, 'Job line data:', {
          p_id: jobLineId,
          p_work_order_id: workOrderId,
          p_name: jobLine.name,
          p_category: jobLine.category,
          p_subcategory: jobLine.subcategory,
          p_description: jobLine.description,
          p_estimated_hours: jobLine.estimatedHours,
          p_labor_rate: jobLine.laborRate,
          p_total_amount: jobLine.totalAmount,
          p_status: jobLine.status,
          p_notes: jobLine.notes,
          p_display_order: i + 1
        });
        throw new Error(`Failed to save job line: ${error.message}`);
      }

      console.log('Successfully saved job line:', data);
    }

    console.log('All job lines saved successfully');
  } catch (error) {
    console.error('Error in saveJobLinesToDatabase:', error);
    throw new Error(`Failed to save job lines to database: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export function generateTempJobLineId(): string {
  return crypto.randomUUID();
}

export function parseJobLinesFromDescription(description: string): WorkOrderJobLine[] {
  if (!description?.trim()) {
    return [];
  }

  const lines = description.split('\n').filter(line => line.trim());
  const jobLines: WorkOrderJobLine[] = [];

  for (const line of lines) {
    const trimmedLine = line.trim();
    if (trimmedLine) {
      const jobLine: WorkOrderJobLine = {
        id: generateTempJobLineId(),
        workOrderId: '',
        name: trimmedLine,
        description: trimmedLine,
        category: 'General',
        subcategory: null,
        estimatedHours: 1,
        laborRate: 75,
        totalAmount: 75,
        status: 'pending',
        notes: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      jobLines.push(jobLine);
    }
  }

  return jobLines;
}
