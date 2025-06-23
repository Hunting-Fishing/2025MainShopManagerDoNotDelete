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

  async createWorkOrderPart(workOrderId: string, partData: WorkOrderPartFormValues, jobLineId?: string): Promise<WorkOrderPart> {
    try {
      console.log('Creating work order part:', { workOrderId, partData, jobLineId });
      
      // Validate required fields before sending to database
      if (!partData.name?.trim()) {
        throw new Error('Part name is required');
      }
      
      if (!partData.part_number?.trim()) {
        throw new Error('Part number is required');
      }
      
      if (!partData.part_type) {
        throw new Error('Part type is required');
      }
      
      const customerPrice = partData.unit_price || partData.customerPrice;
      if (!customerPrice || customerPrice < 0) {
        throw new Error('Customer price is required and must be non-negative');
      }

      // Map form data to database schema
      const mappedData = mapPartFormToDatabase(partData, workOrderId, jobLineId);
      console.log('Mapped part data for database:', mappedData);
      
      const { data, error } = await supabase
        .from('work_order_parts')
        .insert([mappedData])
        .select('*')
        .single();

      if (error) {
        console.error('Database error creating part:', error);
        throw new Error(PartsFormValidator.handleApiError(error));
      }

      if (!data) {
        throw new Error('No data returned from part creation');
      }

      console.log('Part created successfully:', data);
      
      // Map database result back to application format
      return mapDatabaseToPart(data);
    } catch (error) {
      console.error('Error in createWorkOrderPart:', error);
      throw error;
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
