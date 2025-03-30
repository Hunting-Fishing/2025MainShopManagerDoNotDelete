import { v4 as uuidv4 } from 'uuid';
import { 
  EmailTemplate, 
  EmailTemplatePreview,
  EmailCampaign, 
  EmailCampaignPreview,
  EmailSequence,
  EmailCategory,
  EmailSequenceStep,
  EmailSequenceEnrollment,
  EmailSequenceAnalytics
} from "@/types/email";
import { supabase } from '@/integrations/supabase/client';

// Mock data for email templates
const mockTemplates: EmailTemplate[] = [
  {
    id: "1",
    name: "Welcome Email",
    subject: "Welcome to our service!",
    description: "Sent to new customers after sign-up",
    category: "welcome",
    content: "<p>Welcome to our service! We're glad to have you.</p>",
    variables: [
      { name: "firstName", defaultValue: "Customer", description: "Customer's first name" },
      { name: "companyName", defaultValue: "Our Company", description: "Company name" }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: "2",
    name: "Follow-up Email",
    subject: "Following up on your recent service",
    description: "Sent after service completion",
    category: "follow_up",
    content: "<p>Thank you for choosing our service. How was your experience?</p>",
    variables: [
      { name: "firstName", defaultValue: "Customer", description: "Customer's first name" },
      { name: "serviceName", defaultValue: "Our Service", description: "Service provided" }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for email campaigns
const mockCampaigns: EmailCampaign[] = [
  {
    id: "1",
    name: "Summer Promotion",
    subject: "Special Summer Offers Inside!",
    status: "scheduled",
    scheduledDate: new Date(Date.now() + 86400000).toISOString(),
    sentDate: null,
    totalRecipients: 150,
    opened: 0,
    clicked: 0,
    templateId: "1",
    content: "<p>Check out our summer promotions!</p>",
    segmentIds: ["1", "2"],
    recipientIds: [],
    personalizations: [],
    metadata: {},
    abTest: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for email sequences
const mockSequences: EmailSequence[] = [
  {
    id: "1",
    name: "Customer Onboarding",
    description: "Sequence to help new customers get started",
    triggerType: "event",
    triggerEvent: "new_customer",
    steps: [
      {
        id: "step1",
        name: "Welcome Email",
        templateId: "1",
        delayHours: 0,
        delayType: "fixed",
        position: 1,
        isActive: true
      },
      {
        id: "step2",
        name: "Follow-up Email",
        templateId: "2",
        delayHours: 72,
        delayType: "fixed",
        position: 2,
        isActive: true
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Mock data for sequence enrollments
const mockEnrollments: EmailSequenceEnrollment[] = [];

// Mock data for sequence analytics
const mockSequenceAnalytics: EmailSequenceAnalytics[] = [
  {
    id: "1",
    sequenceId: "1",
    totalEnrollments: 0,
    activeEnrollments: 0,
    completedEnrollments: 0,
    updatedAt: new Date().toISOString()
  }
];

export const emailService = {
  // Template functions
  async getTemplates(): Promise<EmailTemplatePreview[]> {
    return mockTemplates.map(mapTemplateToPreview);
  },
  
  async getTemplatesByCategory(category: EmailCategory): Promise<EmailTemplatePreview[]> {
    return mockTemplates
      .filter(template => template.category === category)
      .map(mapTemplateToPreview);
  },
  
  async getTemplateById(id: string): Promise<EmailTemplate | null> {
    const template = mockTemplates.find(t => t.id === id);
    return template || null;
  },
  
  async createTemplate(template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const newTemplate: EmailTemplate = {
      id: uuidv4(),
      name: template.name || "New Template",
      subject: template.subject || "",
      description: template.description || "",
      category: template.category || "custom",
      content: template.content || "",
      variables: template.variables || [],
      isArchived: template.isArchived || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockTemplates.push(newTemplate);
    return newTemplate;
  },
  
  async updateTemplate(id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> {
    const index = mockTemplates.findIndex(t => t.id === id);
    
    if (index === -1) {
      throw new Error("Template not found");
    }
    
    const updatedTemplate = {
      ...mockTemplates[index],
      ...template,
      updatedAt: new Date().toISOString()
    };
    
    mockTemplates[index] = updatedTemplate;
    return updatedTemplate;
  },
  
  async deleteTemplate(id: string): Promise<void> {
    const index = mockTemplates.findIndex(t => t.id === id);
    
    if (index !== -1) {
      mockTemplates.splice(index, 1);
    }
  },
  
  // Campaign functions
  async getCampaigns(): Promise<EmailCampaignPreview[]> {
    return mockCampaigns.map(mapCampaignToPreview);
  },
  
  async getCampaignById(id: string): Promise<EmailCampaign | null> {
    const campaign = mockCampaigns.find(c => c.id === id);
    return campaign || null;
  },
  
  async createCampaign(campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const newCampaign: EmailCampaign = {
      id: uuidv4(),
      name: campaign.name || "New Campaign",
      subject: campaign.subject || "",
      status: campaign.status || "draft",
      scheduledDate: campaign.scheduledDate || null,
      sentDate: campaign.sentDate || null,
      totalRecipients: campaign.totalRecipients || 0,
      opened: campaign.opened || 0,
      clicked: campaign.clicked || 0,
      templateId: campaign.templateId || "",
      content: campaign.content || "",
      segmentIds: campaign.segmentIds || [],
      recipientIds: campaign.recipientIds || [],
      personalizations: campaign.personalizations || [],
      metadata: campaign.metadata || {},
      abTest: campaign.abTest || null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockCampaigns.push(newCampaign);
    return newCampaign;
  },
  
  async updateCampaign(id: string, campaign: Partial<EmailCampaign>): Promise<EmailCampaign> {
    const index = mockCampaigns.findIndex(c => c.id === id);
    
    if (index === -1) {
      throw new Error("Campaign not found");
    }
    
    const updatedCampaign = {
      ...mockCampaigns[index],
      ...campaign,
      updatedAt: new Date().toISOString()
    };
    
    mockCampaigns[index] = updatedCampaign;
    return updatedCampaign;
  },
  
  async deleteCampaign(id: string): Promise<void> {
    const index = mockCampaigns.findIndex(c => c.id === id);
    
    if (index !== -1) {
      mockCampaigns.splice(index, 1);
    }
  },
  
  // Sequences functions
  async getSequences(): Promise<EmailSequence[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          id,
          name,
          description,
          trigger_type,
          trigger_event,
          is_active,
          created_by,
          created_at,
          updated_at
        `);
      
      if (error) throw error;
      
      // Fetch steps for each sequence
      const sequences = await Promise.all(data.map(async (seq) => {
        const { data: stepsData, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .select(`
            id,
            name,
            template_id,
            delay_hours,
            delay_type,
            condition_type,
            condition_value,
            condition_operator,
            is_active,
            position
          `)
          .eq('sequence_id', seq.id)
          .order('position', { ascending: true });
        
        if (stepsError) throw stepsError;
        
        const steps: EmailSequenceStep[] = stepsData.map(step => ({
          id: step.id,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type as 'fixed' | 'business_days',
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type as 'event' | 'property',
            value: step.condition_value,
            operator: step.condition_operator as '=' | '!=' | '>' | '<' | '>=' | '<='
          } : undefined
        }));
        
        return {
          id: seq.id,
          name: seq.name,
          description: seq.description,
          triggerType: seq.trigger_type as 'manual' | 'event' | 'schedule',
          triggerEvent: seq.trigger_event,
          steps,
          isActive: seq.is_active,
          createdBy: seq.created_by,
          createdAt: seq.created_at,
          updatedAt: seq.updated_at
        };
      }));
      
      return sequences;
    } catch (error) {
      console.error("Error fetching email sequences:", error);
      // Fallback to mock data for development
      return [...mockSequences];
    }
  },
  
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    try {
      const { data, error } = await supabase
        .from('email_sequences')
        .select(`
          id,
          name,
          description,
          trigger_type,
          trigger_event,
          is_active,
          created_by,
          created_at,
          updated_at
        `)
        .eq('id', id)
        .single();
      
      if (error) throw error;
      
      // Fetch steps for the sequence
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select(`
          id,
          name,
          template_id,
          delay_hours,
          delay_type,
          condition_type,
          condition_value,
          condition_operator,
          is_active,
          position
        `)
        .eq('sequence_id', id)
        .order('position', { ascending: true });
      
      if (stepsError) throw stepsError;
      
      const steps: EmailSequenceStep[] = stepsData.map(step => ({
        id: step.id,
        name: step.name,
        templateId: step.template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type,
        position: step.position,
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type,
          value: step.condition_value,
          operator: step.condition_operator
        } : undefined
      }));
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        triggerType: data.trigger_type as 'manual' | 'event' | 'schedule',
        triggerEvent: data.trigger_event,
        steps,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error fetching email sequence:", error);
      
      // Fallback to mock data for development
      const sequence = mockSequences.find(s => s.id === id);
      return sequence ? { ...sequence } : null;
    }
  },
  
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    try {
      // Insert the sequence
      const { data, error } = await supabase
        .from('email_sequences')
        .insert([{
          name: sequence.name || "New Sequence",
          description: sequence.description || "",
          trigger_type: sequence.triggerType || "manual",
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive || false,
          created_by: sequence.createdBy
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Insert steps if provided
      if (sequence.steps && sequence.steps.length > 0) {
        const stepsToInsert = sequence.steps.map((step, index) => ({
          sequence_id: data.id,
          name: step.name,
          template_id: step.templateId,
          delay_hours: step.delayHours,
          delay_type: step.delayType,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator,
          is_active: step.isActive !== undefined ? step.isActive : true,
          position: step.position || index + 1
        }));
        
        const { data: stepsData, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .insert(stepsToInsert)
          .select();
        
        if (stepsError) throw stepsError;
        
        // Initialize analytics record
        await supabase
          .from('email_sequence_analytics')
          .insert([{
            sequence_id: data.id,
            total_enrollments: 0,
            active_enrollments: 0,
            completed_enrollments: 0
          }]);
        
        // Map steps to the expected format
        const steps: EmailSequenceStep[] = stepsData.map(step => ({
          id: step.id,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type,
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type,
            value: step.condition_value,
            operator: step.condition_operator
          } : undefined
        }));
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          triggerType: data.trigger_type,
          triggerEvent: data.trigger_event,
          steps,
          isActive: data.is_active,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        steps: [],
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error creating email sequence:", error);
      
      // Fallback to mock implementation for development
      const newSequence: EmailSequence = {
        id: uuidv4(),
        name: sequence.name || "New Sequence",
        description: sequence.description || "",
        triggerType: sequence.triggerType || "manual",
        triggerEvent: sequence.triggerEvent,
        steps: sequence.steps || [],
        isActive: sequence.isActive || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      mockSequences.push(newSequence);
      
      // Initialize analytics
      mockSequenceAnalytics.push({
        id: uuidv4(),
        sequenceId: newSequence.id,
        totalEnrollments: 0,
        activeEnrollments: 0,
        completedEnrollments: 0,
        updatedAt: new Date().toISOString()
      });
      
      return newSequence;
    }
  },
  
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    try {
      // Update the sequence details
      const { data, error } = await supabase
        .from('email_sequences')
        .update({
          name: sequence.name,
          description: sequence.description,
          trigger_type: sequence.triggerType,
          trigger_event: sequence.triggerEvent,
          is_active: sequence.isActive
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      
      // Handle steps update if provided
      if (sequence.steps) {
        // First, delete all existing steps
        await supabase
          .from('email_sequence_steps')
          .delete()
          .eq('sequence_id', id);
        
        // Then insert new steps
        const stepsToInsert = sequence.steps.map((step, index) => ({
          sequence_id: id,
          name: step.name,
          template_id: step.templateId,
          delay_hours: step.delayHours,
          delay_type: step.delayType,
          condition_type: step.condition?.type,
          condition_value: step.condition?.value,
          condition_operator: step.condition?.operator,
          is_active: step.isActive !== undefined ? step.isActive : true,
          position: step.position || index + 1
        }));
        
        const { data: stepsData, error: stepsError } = await supabase
          .from('email_sequence_steps')
          .insert(stepsToInsert)
          .select();
        
        if (stepsError) throw stepsError;
        
        // Map steps to the expected format
        const steps: EmailSequenceStep[] = stepsData.map(step => ({
          id: step.id,
          name: step.name,
          templateId: step.template_id,
          delayHours: step.delay_hours,
          delayType: step.delay_type,
          position: step.position,
          isActive: step.is_active,
          condition: step.condition_type ? {
            type: step.condition_type,
            value: step.condition_value,
            operator: step.condition_operator
          } : undefined
        }));
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          triggerType: data.trigger_type,
          triggerEvent: data.trigger_event,
          steps,
          isActive: data.is_active,
          createdBy: data.created_by,
          createdAt: data.created_at,
          updatedAt: data.updated_at
        };
      }
      
      // If no steps provided, fetch existing ones
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select(`
          id,
          name,
          template_id,
          delay_hours,
          delay_type,
          condition_type,
          condition_value,
          condition_operator,
          is_active,
          position
        `)
        .eq('sequence_id', id)
        .order('position', { ascending: true });
      
      if (stepsError) throw stepsError;
      
      const steps: EmailSequenceStep[] = stepsData.map(step => ({
        id: step.id,
        name: step.name,
        templateId: step.template_id,
        delayHours: step.delay_hours,
        delayType: step.delay_type,
        position: step.position,
        isActive: step.is_active,
        condition: step.condition_type ? {
          type: step.condition_type,
          value: step.condition_value,
          operator: step.condition_operator
        } : undefined
      }));
      
      return {
        id: data.id,
        name: data.name,
        description: data.description,
        triggerType: data.trigger_type,
        triggerEvent: data.trigger_event,
        steps,
        isActive: data.is_active,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at
      };
    } catch (error) {
      console.error("Error updating email sequence:", error);
      
      // Fallback to mock implementation for development
      const index = mockSequences.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error("Sequence not found");
      }
      
      const updatedSequence = {
        ...mockSequences[index],
        ...sequence,
        updatedAt: new Date().toISOString()
      };
      
      mockSequences[index] = updatedSequence;
      return updatedSequence;
    }
  },
  
  async deleteSequence(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('email_sequences')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting email sequence:", error);
      
      // Fallback to mock implementation for development
      const index = mockSequences.findIndex(s => s.id === id);
      
      if (index !== -1) {
        mockSequences.splice(index, 1);
      }
    }
  },
  
  async enrollCustomerInSequence(sequenceId: string, customerId: string): Promise<EmailSequenceEnrollment> {
    try {
      // Get the first step of the sequence
      const { data: stepsData, error: stepsError } = await supabase
        .from('email_sequence_steps')
        .select('id')
        .eq('sequence_id', sequenceId)
        .eq('position', 1)
        .single();
      
      if (stepsError) throw stepsError;
      
      // Calculate next send time based on the first step delay
      const { data: stepDetails, error: stepError } = await supabase
        .from('email_sequence_steps')
        .select('delay_hours, delay_type')
        .eq('id', stepsData.id)
        .single();
      
      if (stepError) throw stepError;
      
      const nextSendTime = new Date();
      nextSendTime.setHours(nextSendTime.getHours() + stepDetails.delay_hours);
      
      // Create enrollment
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert([{
          sequence_id: sequenceId,
          customer_id: customerId,
          current_step_id: stepsData.id,
          status: 'active',
          next_send_time: nextSendTime.toISOString()
        }])
        .select()
        .single();
      
      if (error) throw error;
      
      // Update analytics
      await supabase.rpc('increment_sequence_enrollments', { 
        sequence_id: sequenceId 
      });
      
      return {
        id: data.id,
        sequenceId: data.sequence_id,
        customerId: data.customer_id,
        currentStepId: data.current_step_id,
        status: data.status,
        startedAt: data.started_at,
        completedAt: data.completed_at,
        nextSendTime: data.next_send_time,
        metadata: data.metadata
      };
    } catch (error) {
      console.error("Error enrolling customer in sequence:", error);
      
      // Fallback to mock implementation for development
      const sequence = mockSequences.find(s => s.id === sequenceId);
      if (!sequence || sequence.steps.length === 0) {
        throw new Error("Sequence not found or has no steps");
      }
      
      const firstStep = sequence.steps[0];
      const nextSendTime = new Date();
      nextSendTime.setHours(nextSendTime.getHours() + firstStep.delayHours);
      
      const enrollment: EmailSequenceEnrollment = {
        id: uuidv4(),
        sequenceId,
        customerId,
        currentStepId: firstStep.id,
        status: 'active',
        startedAt: new Date().toISOString(),
        nextSendTime: nextSendTime.toISOString()
      };
      
      mockEnrollments.push(enrollment);
      
      // Update mock analytics
      const analyticsIndex = mockSequenceAnalytics.findIndex(a => a.sequenceId === sequenceId);
      if (analyticsIndex !== -1) {
        mockSequenceAnalytics[analyticsIndex].totalEnrollments += 1;
        mockSequenceAnalytics[analyticsIndex].activeEnrollments += 1;
        mockSequenceAnalytics[analyticsIndex].updatedAt = new Date().toISOString();
      }
      
      return enrollment;
    }
  },
  
  async updateEnrollmentStatus(enrollmentId: string, status: 'active' | 'completed' | 'paused' | 'cancelled'): Promise<void> {
    try {
      const { data: enrollment, error: fetchError } = await supabase
        .from('email_sequence_enrollments')
        .select('sequence_id, status')
        .eq('id', enrollmentId)
        .single();
      
      if (fetchError) throw fetchError;
      
      const updateData: any = { status };
      
      if (status === 'completed' && enrollment.status !== 'completed') {
        updateData.completed_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('email_sequence_enrollments')
        .update(updateData)
        .eq('id', enrollmentId);
      
      if (error) throw error;
      
      // Update analytics based on status change
      if (enrollment.status !== status) {
        // Decrement old status count
        if (enrollment.status === 'active') {
          await supabase.rpc('decrement_active_enrollments', { 
            sequence_id: enrollment.sequence_id 
          });
        } else if (enrollment.status === 'completed') {
          await supabase.rpc('decrement_completed_enrollments', { 
            sequence_id: enrollment.sequence_id 
          });
        }
        
        // Increment new status count
        if (status === 'active') {
          await supabase.rpc('increment_active_enrollments', { 
            sequence_id: enrollment.sequence_id 
          });
        } else if (status === 'completed') {
          await supabase.rpc('increment_completed_enrollments', { 
            sequence_id: enrollment.sequence_id 
          });
        }
      }
    } catch (error) {
      console.error("Error updating enrollment status:", error);
      
      // Fallback to mock implementation for development
      const enrollmentIndex = mockEnrollments.findIndex(e => e.id === enrollmentId);
      if (enrollmentIndex !== -1) {
        const oldStatus = mockEnrollments[enrollmentIndex].status;
        mockEnrollments[enrollmentIndex].status = status;
        
        if (status === 'completed' && oldStatus !== 'completed') {
          mockEnrollments[enrollmentIndex].completedAt = new Date().toISOString();
        }
        
        // Update mock analytics
        const sequenceId = mockEnrollments[enrollmentIndex].sequenceId;
        const analyticsIndex = mockSequenceAnalytics.findIndex(a => a.sequenceId === sequenceId);
        
        if (analyticsIndex !== -1) {
          if (oldStatus === 'active') {
            mockSequenceAnalytics[analyticsIndex].activeEnrollments -= 1;
          } else if (oldStatus === 'completed') {
            mockSequenceAnalytics[analyticsIndex].completedEnrollments -= 1;
          }
          
          if (status === 'active') {
            mockSequenceAnalytics[analyticsIndex].activeEnrollments += 1;
          } else if (status === 'completed') {
            mockSequenceAnalytics[analyticsIndex].completedEnrollments += 1;
          }
          
          mockSequenceAnalytics[analyticsIndex].updatedAt = new Date().toISOString();
        }
      }
    }
  },
  
  // Send email functions
  async sendTestEmail(templateId: string, recipientEmail: string, personalizations?: Record<string, string>): Promise<void> {
    console.log(`Sending test email (Template ID: ${templateId}) to ${recipientEmail}`, personalizations);
    // In a real implementation, this would call the Supabase Edge Function
  },
  
  async scheduleEmailCampaign(campaignId: string, scheduledDate: string): Promise<void> {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      campaign.status = 'scheduled';
      campaign.scheduledDate = scheduledDate;
      campaign.updatedAt = new Date().toISOString();
    }
  },
  
  async sendEmailCampaignNow(campaignId: string): Promise<void> {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      campaign.status = 'sent';
      campaign.sentDate = new Date().toISOString();
      campaign.updatedAt = new Date().toISOString();
    }
  },
  
  async pauseEmailCampaign(campaignId: string): Promise<void> {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      campaign.status = 'paused';
      campaign.updatedAt = new Date().toISOString();
    }
  },
  
  async cancelEmailCampaign(campaignId: string): Promise<void> {
    const campaign = mockCampaigns.find(c => c.id === campaignId);
    
    if (campaign) {
      campaign.status = 'cancelled';
      campaign.updatedAt = new Date().toISOString();
    }
  }
};

// Helper functions for mapping data
function mapTemplateToPreview(template: EmailTemplate): EmailTemplatePreview {
  return {
    id: template.id,
    name: template.name,
    subject: template.subject,
    description: template.description,
    category: template.category,
    createdAt: template.createdAt,
    updatedAt: template.updatedAt
  };
}

function mapCampaignToPreview(campaign: EmailCampaign): EmailCampaignPreview {
  return {
    id: campaign.id,
    name: campaign.name,
    subject: campaign.subject,
    status: campaign.status,
    scheduledDate: campaign.scheduledDate,
    sentDate: campaign.sentDate,
    totalRecipients: campaign.totalRecipients,
    opened: campaign.opened,
    clicked: campaign.clicked,
    createdAt: campaign.createdAt,
    updatedAt: campaign.updatedAt
  };
}
