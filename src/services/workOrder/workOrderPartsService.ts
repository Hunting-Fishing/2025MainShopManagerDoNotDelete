
import { supabase } from '@/lib/supabase';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { mapPartFormToDatabase, mapDatabaseToPart } from '@/utils/databaseMappers';
import { PartsFormValidator } from '@/utils/partsErrorHandler';

export const workOrderPartsService = {
  async getWorkOrderParts(workOrderId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for work order:', workOrderId);
    
    if (!workOrderId) {
      throw new Error('Work order ID is required');
    }
    
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('work_order_id', workOrderId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Database error fetching work order parts:', error);
        throw new Error(`Failed to fetch parts: ${error.message}`);
      }

      console.log('Raw parts data from database:', data);

      // Map database results to WorkOrderPart interface
      const mappedParts = (data || []).map(mapDatabaseToPart);
      console.log('Mapped parts:', mappedParts);

      return mappedParts;
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async createWorkOrderPart(formData: WorkOrderPartFormValues, workOrderId: string): Promise<WorkOrderPart> {
    console.log('Creating work order part:', { formData, workOrderId });

    // Validate input parameters
    if (!workOrderId) {
      throw new Error('Work order ID is required');
    }

    // Validate form data
    const validationErrors = PartsFormValidator.validatePartForm(formData);
    if (validationErrors.length > 0) {
      const errorMessage = validationErrors.map(e => e.message).join(', ');
      throw new Error(`Validation failed: ${errorMessage}`);
    }

    try {
      // Map form data to database schema
      const dbData = mapPartFormToDatabase(formData, workOrderId, formData.job_line_id);
      console.log('Mapped database data:', dbData);

      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([dbData])
        .select()
        .single();

      if (error) {
        console.error('Database error creating work order part:', error);
        throw new Error(`Failed to create part: ${error.message}`);
      }

      console.log('Created part data:', data);
      return mapDatabaseToPart(data);
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async updateWorkOrderPart(partId: string, updates: Partial<WorkOrderPartFormValues>): Promise<WorkOrderPart> {
    console.log('Updating work order part:', { partId, updates });

    if (!partId) {
      throw new Error('Part ID is required');
    }

    try {
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
        console.error('Database error updating work order part:', error);
        throw new Error(`Failed to update part: ${error.message}`);
      }

      console.log('Updated part data:', data);
      return mapDatabaseToPart(data);
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async deleteWorkOrderPart(partId: string): Promise<void> {
    console.log('Deleting work order part:', partId);

    if (!partId) {
      throw new Error('Part ID is required');
    }

    try {
      const { error } = await supabase
        .from('work_order_parts')
        .delete()
        .eq('id', partId);

      if (error) {
        console.error('Database error deleting work order part:', error);
        throw new Error(`Failed to delete part: ${error.message}`);
      }

      console.log('Part deleted successfully');
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getPartsByJobLine(jobLineId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for job line:', jobLineId);
    
    if (!jobLineId) {
      throw new Error('Job line ID is required');
    }
    
    try {
      const { data, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('job_line_id', jobLineId)
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Database error fetching parts by job line:', error);
        throw new Error(`Failed to fetch parts: ${error.message}`);
      }

      return (data || []).map(mapDatabaseToPart);
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  },

  async getJobLineParts(jobLineId: string): Promise<WorkOrderPart[]> {
    console.log('Fetching parts for job line:', jobLineId);
    
    if (!jobLineId) {
      throw new Error('Job line ID is required');
    }
    
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

      return (data || []).map(mapDatabaseToPart);
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      throw new Error(errorMessage);
    }
  }
};

// Export individual functions for backward compatibility
export const getWorkOrderParts = workOrderPartsService.getWorkOrderParts;
export const createWorkOrderPart = workOrderPartsService.createWorkOrderPart;
export const updateWorkOrderPart = workOrderPartsService.updateWorkOrderPart;
export const deleteWorkOrderPart = workOrderPartsService.deleteWorkOrderPart;
export const getPartsByJobLine = workOrderPartsService.getPartsByJobLine;
export const getJobLineParts = workOrderPartsService.getJobLineParts;
