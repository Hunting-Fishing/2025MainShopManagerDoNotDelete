
import { supabase } from '@/lib/supabase';
import { EmailSequence, EmailTemplate, EmailTemplateVariable } from '@/types/email';
import { Json } from '@/integrations/supabase/types';

class EmailService {
  async getTemplates(category?: string): Promise<EmailTemplate[]> {
    let query = supabase
      .from('email_templates')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (category) {
      query = query.eq('category', category);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching templates:", error);
      throw error;
    }

    return (data || []).map(template => ({
      id: template.id,
      name: template.name,
      subject: template.subject,
      description: template.description || '',
      category: template.category as any,
      content: template.content,
      variables: template.variables ? (template.variables as any[] || []) : [],
      created_at: template.created_at,
      updated_at: template.updated_at,
      is_archived: template.is_archived || false,
    }));
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

    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      description: data.description || '',
      category: data.category as any,
      content: data.content,
      variables: data.variables ? (data.variables as any[] || []) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_archived: data.is_archived || false,
    };
  }

  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    // Convert EmailTemplateVariable[] to a JSON-compatible format
    const templateData = {
      name: template.name || '',
      subject: template.subject || '',
      content: template.content || '',
      description: template.description,
      category: template.category || 'marketing',
      variables: template.variables ? JSON.parse(JSON.stringify(template.variables)) : []
    };

    const { data, error } = await supabase
      .from('email_templates')
      .insert([templateData])
      .select()
      .single();

    if (error) {
      console.error("Error creating template:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      description: data.description || '',
      category: data.category as any,
      content: data.content,
      variables: data.variables ? (data.variables as any[] || []) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_archived: data.is_archived || false,
    };
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate | null> {
    // Convert EmailTemplateVariable[] to a JSON-compatible format for Supabase
    const updateData: any = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.subject !== undefined && { subject: updates.subject }),
      ...(updates.content !== undefined && { content: updates.content }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.is_archived !== undefined && { is_archived: updates.is_archived })
    };
    
    // Handle variables separately to ensure proper JSON conversion
    if (updates.variables) {
      updateData.variables = JSON.parse(JSON.stringify(updates.variables));
    }
    
    const { data, error } = await supabase
      .from('email_templates')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating template:", error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      subject: data.subject,
      description: data.description || '',
      category: data.category as any,
      content: data.content,
      variables: data.variables ? (data.variables as any[] || []) : [],
      created_at: data.created_at,
      updated_at: data.updated_at,
      is_archived: data.is_archived || false,
    };
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

  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<boolean> {
    try {
      const response = await supabase.functions.invoke('send-test-email', {
        body: { 
          templateId, 
          recipientEmail, 
          personalizations 
        }
      });
      
      if (response.error) {
        console.error("Error sending test email:", response.error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      return false;
    }
  }

  async getSequences(): Promise<EmailSequence[]> {
    const { data, error } = await supabase
      .from('email_sequences')
      .select('*, steps:email_sequence_steps(*)')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(sequence => ({
      id: sequence.id,
      name: sequence.name,
      description: sequence.description || '',
      created_at: sequence.created_at,
      updated_at: sequence.updated_at,
      shop_id: sequence.shop_id,
      created_by: sequence.created_by,
      trigger_type: sequence.trigger_type as "manual" | "event" | "schedule",
      trigger_event: sequence.trigger_event,
      is_active: sequence.is_active,
      steps: (sequence.steps || []).map((step: any) => ({
        id: step.id,
        sequence_id: step.sequence_id,
        type: step.delay_hours > 0 ? 'delay' : 'email',
        order: step.position,
        position: step.position,
        delayHours: step.delay_hours,
        delayType: step.delay_type as "fixed" | "business_days",
        email_template_id: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        isActive: step.is_active,
        name: step.name || `Step ${step.position + 1}`
      }))
    }));
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
    
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      created_at: data.created_at,
      updated_at: data.updated_at,
      shop_id: data.shop_id,
      created_by: data.created_by,
      trigger_type: data.trigger_type as "manual" | "event" | "schedule",
      trigger_event: data.trigger_event,
      is_active: data.is_active,
      steps: (data.steps || []).map((step: any) => ({
        id: step.id,
        sequence_id: step.sequence_id,
        type: step.delay_hours > 0 ? 'delay' : 'email',
        order: step.position,
        position: step.position,
        delayHours: step.delay_hours,
        delayType: step.delay_type as "fixed" | "business_days",
        email_template_id: step.template_id,
        created_at: step.created_at,
        updated_at: step.updated_at,
        isActive: step.is_active,
        name: step.name || `Step ${step.position + 1}`
      }))
    };
  }

  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    const sequenceData = {
      name: sequence.name,
      description: sequence.description,
      trigger_type: (sequence.triggerType || sequence.trigger_type || 'manual') as string,
      trigger_event: sequence.triggerEvent || sequence.trigger_event,
      is_active: sequence.isActive || sequence.is_active || false
    };

    const { data: sequenceResult, error: sequenceError } = await supabase
      .from('email_sequences')
      .insert(sequenceData)
      .select()
      .single();

    if (sequenceError) {
      console.error("Error creating sequence:", sequenceError);
      return null;
    }

    if (sequence.steps && sequence.steps.length > 0) {
      const stepsData = sequence.steps.map((step, index) => ({
        sequence_id: sequenceResult.id,
        template_id: step.templateId || step.email_template_id,
        position: index,
        delay_hours: step.delayHours || 0,
        delay_type: step.delayType || 'fixed',
        name: step.name || `Step ${index + 1}`,
        is_active: step.isActive !== undefined ? step.isActive : true
      }));

      const { data: stepsResult, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .insert(stepsData)
        .select();

      if (stepsError) {
        console.error("Error creating sequence steps:", stepsError);
      }

      return {
        ...sequenceResult,
        trigger_type: sequenceResult.trigger_type as "manual" | "event" | "schedule",
        steps: (stepsResult || []).map((step: any) => ({
          id: step.id,
          sequence_id: step.sequence_id,
          type: step.delay_hours > 0 ? 'delay' : 'email',
          order: step.position,
          position: step.position,
          delayHours: step.delay_hours,
          delayType: step.delay_type as "fixed" | "business_days",
          email_template_id: step.template_id,
          created_at: step.created_at,
          updated_at: step.updated_at,
          isActive: step.is_active,
          name: step.name
        }))
      };
    }

    return {
      ...sequenceResult,
      trigger_type: sequenceResult.trigger_type as "manual" | "event" | "schedule",
      steps: []
    };
  }

  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence | null> {
    const sequenceData = {
      name: sequence.name,
      description: sequence.description,
      trigger_type: (sequence.triggerType || sequence.trigger_type || 'manual') as string,
      trigger_event: sequence.triggerEvent || sequence.trigger_event,
      is_active: sequence.isActive || sequence.is_active
    };

    const { data: sequenceResult, error: sequenceError } = await supabase
      .from('email_sequences')
      .update(sequenceData)
      .eq('id', id)
      .select()
      .single();

    if (sequenceError) {
      console.error("Error updating sequence:", sequenceError);
      return null;
    }

    if (sequence.steps) {
      await supabase.from('email_sequence_steps').delete().eq('sequence_id', id);

      const stepsData = sequence.steps.map((step, index) => ({
        sequence_id: id,
        template_id: step.templateId || step.email_template_id,
        position: index,
        delay_hours: step.delayHours || 0,
        delay_type: step.delayType || 'fixed',
        name: step.name || `Step ${index + 1}`,
        is_active: step.isActive !== undefined ? step.isActive : true
      }));

      const { data: stepsResult, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .insert(stepsData)
        .select();

      if (stepsError) {
        console.error("Error updating sequence steps:", stepsError);
      }

      return {
        ...sequenceResult,
        trigger_type: sequenceResult.trigger_type as "manual" | "event" | "schedule",
        steps: (stepsResult || []).map((step: any) => ({
          id: step.id,
          sequence_id: step.sequence_id,
          type: step.delay_hours > 0 ? 'delay' : 'email',
          order: step.position,
          position: step.position,
          delayHours: step.delay_hours,
          delayType: step.delay_type as "fixed" | "business_days",
          email_template_id: step.template_id,
          created_at: step.created_at,
          updated_at: step.updated_at,
          isActive: step.is_active,
          name: step.name
        }))
      };
    }

    return {
      ...sequenceResult,
      trigger_type: sequenceResult.trigger_type as "manual" | "event" | "schedule",
      steps: []
    };
  }

  async deleteSequence(id: string): Promise<boolean> {
    await supabase.from('email_sequence_steps').delete().eq('sequence_id', id);
    
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
        next_send_time: new Date().toISOString()
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
