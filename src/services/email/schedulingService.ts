
import { customTableQuery, GenericResponse } from './utils/supabaseHelper';

/**
 * Service for managing email sequence processing schedules
 */
export const schedulingService = {
  /**
   * Get the current sequence processing schedule
   * @returns Processing schedule configuration
   */
  async getSequenceProcessingSchedule() {
    try {
      const response = await customTableQuery('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
        
      // Cast the response to break the circular type reference
      const { data, error } = response as GenericResponse;
      
      if (error) throw error;
      
      return {
        enabled: data?.is_active || false,
        cron: data?.cron_expression || '0 * * * *', // Default to hourly
        lastRun: data?.last_run || null,
        nextRun: data?.next_run || null,
        sequenceIds: data?.sequence_ids ? 
          (Array.isArray(data.sequence_ids) ? data.sequence_ids : JSON.parse(data.sequence_ids as string)) 
          : []
      };
    } catch (error) {
      console.error('Error getting sequence processing schedule:', error);
      return {
        enabled: false,
        cron: '0 * * * *',
        lastRun: null,
        nextRun: null,
        sequenceIds: []
      };
    }
  },

  /**
   * Update the sequence processing schedule
   * @param config Schedule configuration
   * @returns Success status
   */
  async updateSequenceProcessingSchedule(config: { 
    cron?: string; 
    enabled: boolean;
    sequenceIds?: string[];
  }) {
    try {
      // Check for existing schedule
      const existingResponse = await customTableQuery('system_schedules')
        .select('*')
        .eq('type', 'email_sequence_processing')
        .maybeSingle();
      
      // Cast to avoid circular type reference
      const { data: existing, error: fetchError } = existingResponse as GenericResponse;
      
      if (fetchError) throw fetchError;
      
      if (existing) {
        // Update existing schedule
        const updateResponse = await customTableQuery('system_schedules')
          .update({
            is_active: config.enabled,
            cron_expression: config.cron || existing.cron_expression,
            sequence_ids: config.sequenceIds || existing.sequence_ids,
            updated_at: new Date().toISOString()
          })
          .eq('id', existing.id)
          .select();
        
        const { data, error } = updateResponse as GenericResponse;
        
        if (error) throw error;
        return { success: true, data };
      } else {
        // Create new schedule
        const insertResponse = await customTableQuery('system_schedules')
          .insert({
            type: 'email_sequence_processing',
            is_active: config.enabled,
            cron_expression: config.cron || '0 * * * *',
            sequence_ids: config.sequenceIds || []
          })
          .select();
        
        const { data, error } = insertResponse as GenericResponse;
        
        if (error) throw error;
        return { success: true, data };
      }
    } catch (error) {
      console.error('Error updating sequence processing schedule:', error);
      return { success: false, error };
    }
  }
};
