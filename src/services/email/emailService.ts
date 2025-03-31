import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailTemplate } from '@/types/email';

interface EmailTemplateResponse {
  data: EmailTemplate[] | null;
  error: any;
}

class EmailService {
  async getTemplates(): Promise<EmailTemplate[]> {
    const { data, error }: EmailTemplateResponse = await supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }

    return data || [];
  }

  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching template:", error);
      return null;
    }

    return data;
  }

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .insert([
        {
          name: template.name,
          subject: template.subject,
          content: template.content,
        },
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      return null;
    }

    return data;
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    const { data, error } = await supabase
      .from('email_templates')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      return null;
    }

    return data;
  }

  async deleteTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_templates')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting template:", error);
      return false;
    }

    return true;
  }

  async archiveTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_archived: true })
      .eq('id', id);

    if (error) {
      console.error("Error archiving template:", error);
      return false;
    }

    return true;
  }

  async restoreTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_templates')
      .update({ is_archived: false })
      .eq('id', id);

    if (error) {
      console.error("Error restoring template:", error);
      return false;
    }

    return true;
  }

  // Email sequence methods
  async getSequences(): Promise<EmailSequence[]> {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*, steps:email_sequence_steps(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getSequenceById(id: string): Promise<EmailSequence | null> {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*, steps:email_sequence_steps(*)')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching sequence:", error);
      return null;
    }
    
    return data;
  }

  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    // Create sequence first
    const { data: sequenceData, error: sequenceError } = await supabase
      .from('email_sequences')
      .insert({
        name: sequence.name,
        description: sequence.description,
        trigger_type: sequence.triggerType || sequence.trigger_type,
        trigger_event: sequence.triggerEvent || sequence.trigger_event,
        is_active: sequence.isActive || sequence.is_active || false
      })
      .select()
      .single();

    if (sequenceError) {
      console.error("Error creating sequence:", sequenceError);
      return null;
    }

    // Then add steps if they exist
    if (sequence.steps && sequence.steps.length > 0) {
      const stepsWithSequenceId = sequence.steps.map((step, index) => ({
        sequence_id: sequenceData.id,
        type: step.type,
        order: index,
        position: index,
        email_template_id: step.templateId || step.email_template_id,
        delay_hours: step.delayHours || 0,
        delay_type: step.delayType || 'fixed'
      }));

      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .insert(stepsWithSequenceId)
        .select();

      if (stepsError) {
        console.error("Error creating sequence steps:", stepsError);
      }

      // Return complete sequence with steps
      return { ...sequenceData, steps: stepsData || [] };
    }

    return sequenceData;
  }

  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    // Update sequence first
    const { data: sequenceData, error: sequenceError } = await supabase
      .from('email_sequences')
      .update({
        name: sequence.name,
        description: sequence.description,
        trigger_type: sequence.triggerType || sequence.trigger_type,
        trigger_event: sequence.triggerEvent || sequence.trigger_event,
        is_active: sequence.isActive || sequence.is_active
      })
      .eq('id', id)
      .select()
      .single();

    if (sequenceError) {
      console.error("Error updating sequence:", sequenceError);
      return null;
    }

    // Delete existing steps and re-insert if they exist
    if (sequence.steps) {
      // Delete existing steps
      await supabase.from('email_sequence_steps').delete().eq('sequence_id', id);

      // Insert new steps
      const stepsWithSequenceId = sequence.steps.map((step, index) => ({
        sequence_id: id,
        type: step.type,
        order: index,
        position: index,
        email_template_id: step.templateId || step.email_template_id,
        delay_hours: step.delayHours || 0,
        delay_type: step.delayType || 'fixed'
      }));

      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .insert(stepsWithSequenceId)
        .select();

      if (stepsError) {
        console.error("Error updating sequence steps:", stepsError);
      }

      // Return complete sequence with steps
      return { ...sequenceData, steps: stepsData || [] };
    }

    return sequenceData;
  }

  async deleteSequence(id: string): Promise<boolean> {
    // Delete steps first to avoid foreign key constraint issues
    await supabase.from('email_sequence_steps').delete().eq('sequence_id', id);
    
    // Then delete the sequence
    const { error } = await supabase.from('email_sequences').delete().eq('id', id);
    
    if (error) {
      console.error("Error deleting sequence:", error);
      return false;
    }
    
    return true;
  }
  
  async triggerSequenceProcessing(sequenceId?: string): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('process-email-sequences', {
        body: { sequenceId, action: 'process' }
      });
      
      if (response.error) {
        console.error("Error triggering sequence processing:", response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error triggering sequence processing:", error);
      return false;
    }
  }
  
  async pauseSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_sequence_enrollments')
      .update({ status: 'paused' })
      .eq('id', enrollmentId);
      
    if (error) {
      console.error("Error pausing enrollment:", error);
      return false;
    }
    
    return true;
  }
  
  async resumeSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_sequence_enrollments')
      .update({ 
        status: 'active',
        next_send_time: new Date().toISOString() // Resume immediately
      })
      .eq('id', enrollmentId);
      
    if (error) {
      console.error("Error resuming enrollment:", error);
      return false;
    }
    
    return true;
  }
  
  async cancelSequenceEnrollment(enrollmentId: string): Promise<boolean> {
    const { error } = await supabase
      .from('email_sequence_enrollments')
      .update({ 
        status: 'cancelled',
        next_send_time: null
      })
      .eq('id', enrollmentId);
      
    if (error) {
      console.error("Error cancelling enrollment:", error);
      return false;
    }
    
    return true;
  }
}

export const emailService = new EmailService();
