
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { mapPartFormToDatabase, mapDatabaseToPart } from '@/utils/databaseMappers';

export const workOrderPartsService = {
  async getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for work order:', workOrderId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('work_order_id', workOrderId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching work order parts:', error);
      throw new Error(`Failed to fetch parts: ${error.message}`);
    }

    console.log('Raw parts data from database:', data);

    // Map database results to WorkOrderPart interface
    const mappedParts = (data || []).map(mapDatabaseToPart);
    console.log('Mapped parts:', mappedParts);

    return mappedParts;
  },

  async createWorkOrderPart(formData: WorkOrderPartFormValues, workOrderId: string): Promise<WorkOrderPart> {
    console.log('Creating work order part:', { formData, workOrderId });

    // Validate required fields
    if (!formData.name || !formData.part_number) {
      throw new Error('Part name and part number are required');
    }

    if (!workOrderId) {
      throw new Error('Work order ID is required');
    }

    // Map form data to database schema
    const dbData = mapPartFormToDatabase(formData, workOrderId, formData.job_line_id);
    console.log('Mapped database data:', dbData);

    const { data, error } = await supabase
      .from('work_order_parts')
      .insert([dbData])
      .select()
      .single();

    if (error) {
      console.error('Error creating work order part:', error);
      throw new Error(`Failed to create part: ${error.message}`);
    }

    console.log('Created part data:', data);
    return mapDatabaseToPart(data);
  },

  async updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
    console.log('Updating work order part:', { partId, updates });

    if (!partId) {
      throw new Error('Part ID is required');
    }

    // Map updates to database schema
    const dbUpdates = mapPartFormToDatabase(updates, '', updates.job_line_id);
    
    // Remove fields that shouldn't be updated
    delete (dbUpdates as any).work_order_id;
    delete (dbUpdates as any).created_at;

    const { data, error } = await supabase
      .from('work_order_parts')
      .update(dbUpdates)
      .eq('id', partId)
      .select()
      .single();

    if (error) {
      console.error('Error updating work order part:', error);
      throw new Error(`Failed to update part: ${error.message}`);
    }

    console.log('Updated part data:', data);
    return mapDatabaseToPart(data);
  },

  async deleteWorkOrderPart(partId: string): Promise<void> {
    console.log('Deleting work order part:', partId);

    if (!partId) {
      throw new Error('Part ID is required');
    }

    const { error } = await supabase
      .from('work_order_parts')
      .delete()
      .eq('id', partId);

    if (error) {
      console.error('Error deleting work order part:', error);
      throw new Error(`Failed to delete part: ${error.message}`);
    }

    console.log('Part deleted successfully');
  },

  async getPartsByJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for job line:', jobLineId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching parts by job line:', error);
      throw new Error(`Failed to fetch parts: ${error.message}`);
    }

    return (data || []).map(mapDatabaseToPart);
  },

  async getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for job line:', jobLineId);
    
    const { data, error } = await supabase
      .from('work_order_parts')
      .select('*')
      .eq('job_line_id', jobLineId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching job line parts:', error);
      throw new Error(`Failed to fetch job line parts: ${error.message}`);
    }

    return (data || []).map(mapDatabaseToPart);
  }
};

// Export individual functions for backward compatibility
export const getWorkOrderParts = workOrderPartsService.getWorkOrderParts;
export const createWorkOrderPart = workOrderPartsService.createWorkOrderPart;
export const updateWorkOrderPart = workOrderPartsService.updateWorkOrderPart;
export const deleteWorkOrderPart = workOrderPartsService.deleteWorkOrderPart;
export const getPartsByJobLine = workOrderPartsService.getPartsByJobLine;
export const getJobLineParts = workOrderPartsService.getJobLineParts;
