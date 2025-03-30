
import { createClient } from '@supabase/supabase-js';
import {
  EmailTemplate,
  EmailTemplatePreview,
  EmailCampaign,
  EmailCampaignPreview,
  EmailCampaignStatus,
  EmailCategory,
  EmailSequence,
  EmailSequenceStep,
  EmailSequenceEnrollment,
  EmailSequenceAnalytics,
  EmailCampaignAnalytics,
  EmailRecipient
} from '@/types/email';
import { supabase } from '@/lib/supabase';

// Mock database for development
const mockTemplates: EmailTemplate[] = [
  {
    id: '1',
    name: 'Welcome Email',
    subject: 'Welcome to our service!',
    description: 'Sent to new customers after sign up',
    category: 'welcome',
    content: '<p>Hello {{name}},</p><p>Welcome to our service! We\'re excited to have you on board.</p><p>Best regards,<br>The Team</p>',
    variables: [
      { name: 'name', defaultValue: 'there', description: 'Customer name' }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Service Reminder',
    subject: 'Your upcoming service',
    description: 'Service reminder for scheduled appointments',
    category: 'reminder',
    content: '<p>Hello {{name}},</p><p>This is a reminder about your upcoming service on {{date}}.</p><p>Best regards,<br>The Team</p>',
    variables: [
      { name: 'name', defaultValue: 'there', description: 'Customer name' },
      { name: 'date', defaultValue: 'tomorrow', description: 'Service date' }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Invoice Paid',
    subject: 'Receipt for your payment',
    description: 'Sent after an invoice is paid',
    category: 'transactional',
    content: '<p>Hello {{name}},</p><p>Thank you for your payment of {{amount}}.</p><p>Invoice: {{invoice_number}}</p><p>Best regards,<br>The Team</p>',
    variables: [
      { name: 'name', defaultValue: 'there', description: 'Customer name' },
      { name: 'amount', defaultValue: '$100.00', description: 'Payment amount' },
      { name: 'invoice_number', defaultValue: 'INV-001', description: 'Invoice number' }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    id: '4',
    name: 'Monthly Newsletter',
    subject: 'This month\'s updates and tips',
    description: 'Monthly newsletter with updates and maintenance tips',
    category: 'marketing',
    content: '<p>Hello {{name}},</p><p>Here are this month\'s updates and maintenance tips...</p><p>Best regards,<br>The Team</p>',
    variables: [
      { name: 'name', defaultValue: 'there', description: 'Customer name' }
    ],
    isArchived: false,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

const mockCampaigns: EmailCampaignPreview[] = [
  {
    id: '1',
    name: 'Spring Maintenance Promotion',
    subject: 'Get ready for spring with our maintenance special',
    status: 'sent',
    scheduledDate: null,
    sentDate: new Date('2023-03-15').toISOString(),
    totalRecipients: 235,
    opened: 142,
    clicked: 58,
    createdAt: new Date('2023-03-10').toISOString(),
    updatedAt: new Date('2023-03-15').toISOString()
  },
  {
    id: '2',
    name: 'Summer Cooling Tips',
    subject: 'Keep your home cool efficiently this summer',
    status: 'scheduled',
    scheduledDate: new Date('2023-06-01').toISOString(),
    sentDate: null,
    totalRecipients: 278,
    opened: 0,
    clicked: 0,
    createdAt: new Date('2023-05-20').toISOString(),
    updatedAt: new Date('2023-05-20').toISOString()
  },
  {
    id: '3',
    name: 'Winter Preparation Guide',
    subject: 'Is your system ready for winter?',
    status: 'draft',
    scheduledDate: null,
    sentDate: null,
    totalRecipients: 0,
    opened: 0,
    clicked: 0,
    createdAt: new Date('2023-09-10').toISOString(),
    updatedAt: new Date('2023-09-10').toISOString()
  }
];

const mockSequences: EmailSequence[] = [
  {
    id: '1',
    name: 'New Customer Onboarding',
    description: 'Welcome series for new customers',
    triggerType: 'manual',
    steps: [
      {
        id: 'step_1',
        name: 'Welcome Email',
        templateId: '1',
        delayHours: 0,
        delayType: 'fixed',
        position: 1,
        isActive: true
      },
      {
        id: 'step_2',
        name: 'First Follow-up',
        templateId: '4',
        delayHours: 72,
        delayType: 'fixed',
        position: 2,
        isActive: true
      }
    ],
    isActive: true,
    createdAt: new Date('2023-01-10').toISOString(),
    updatedAt: new Date('2023-01-10').toISOString()
  },
  {
    id: '2',
    name: 'Post-Service Follow-up',
    description: 'Feedback and maintenance reminders after service',
    triggerType: 'event',
    triggerEvent: 'service_complete',
    steps: [
      {
        id: 'step_1',
        name: 'Thank You',
        templateId: '3',
        delayHours: 24,
        delayType: 'fixed',
        position: 1,
        isActive: true
      },
      {
        id: 'step_2',
        name: 'Feedback Request',
        templateId: '4',
        delayHours: 72,
        delayType: 'fixed',
        position: 2,
        isActive: true,
        condition: {
          type: 'event',
          value: 'email_opened',
          operator: '='
        }
      }
    ],
    isActive: true,
    createdAt: new Date('2023-02-15').toISOString(),
    updatedAt: new Date('2023-02-15').toISOString()
  }
];

// Email Service
export const emailService = {
  // Templates
  getTemplates: async (category?: EmailCategory): Promise<EmailTemplatePreview[]> => {
    try {
      console.log("Fetching email templates...", category);
      
      // In a real app, this would make a request to your backend
      // For now, we'll use mock data
      let templates = [...mockTemplates];
      
      if (category) {
        templates = templates.filter(template => template.category === category);
      }
      
      // Convert to previews
      const previews: EmailTemplatePreview[] = templates.map(t => ({
        id: t.id,
        name: t.name,
        subject: t.subject,
        description: t.description,
        category: t.category,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt
      }));
      
      console.log(`Found ${previews.length} templates`);
      return previews;
    } catch (error) {
      console.error("Error fetching email templates:", error);
      throw error;
    }
  },
  
  getTemplateById: async (id: string): Promise<EmailTemplate | null> => {
    try {
      console.log(`Fetching email template with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const template = mockTemplates.find(t => t.id === id);
      
      if (!template) {
        console.log(`Template with ID ${id} not found`);
        return null;
      }
      
      console.log(`Found template: ${template.name}`);
      return template;
    } catch (error) {
      console.error("Error fetching email template:", error);
      throw error;
    }
  },
  
  createTemplate: async (template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      console.log("Creating new email template");
      
      // In a real app, this would make a request to your backend
      const newTemplate: EmailTemplate = {
        id: `template_${Date.now()}`,
        name: template.name || 'Untitled Template',
        subject: template.subject || '',
        description: template.description || '',
        category: template.category || 'custom',
        content: template.content || '',
        variables: template.variables || [],
        isArchived: false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      mockTemplates.push(newTemplate);
      
      console.log(`Created template with ID: ${newTemplate.id}`);
      return newTemplate;
    } catch (error) {
      console.error("Error creating email template:", error);
      throw error;
    }
  },
  
  updateTemplate: async (id: string, template: Partial<EmailTemplate>): Promise<EmailTemplate> => {
    try {
      console.log(`Updating email template with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const index = mockTemplates.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error(`Template with ID ${id} not found`);
      }
      
      // Update template
      const updatedTemplate: EmailTemplate = {
        ...mockTemplates[index],
        ...template,
        updatedAt: new Date().toISOString()
      };
      
      mockTemplates[index] = updatedTemplate;
      
      console.log(`Updated template: ${updatedTemplate.name}`);
      return updatedTemplate;
    } catch (error) {
      console.error("Error updating email template:", error);
      throw error;
    }
  },
  
  deleteTemplate: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting email template with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const index = mockTemplates.findIndex(t => t.id === id);
      
      if (index === -1) {
        throw new Error(`Template with ID ${id} not found`);
      }
      
      // Remove from mock data
      mockTemplates.splice(index, 1);
      
      console.log(`Deleted template with ID: ${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting email template:", error);
      throw error;
    }
  },
  
  sendTestEmail: async (templateId: string, email: string): Promise<boolean> => {
    try {
      console.log(`Sending test email using template ID: ${templateId} to: ${email}`);
      
      // In a real app, this would make a request to your backend
      // For now, we'll just simulate success
      
      console.log(`Test email sent to: ${email}`);
      return true;
    } catch (error) {
      console.error("Error sending test email:", error);
      throw error;
    }
  },
  
  // Campaigns
  getCampaigns: async (status?: EmailCampaignStatus): Promise<EmailCampaignPreview[]> => {
    try {
      console.log("Fetching email campaigns...");
      
      // In a real app, this would make a request to your backend
      let campaigns = [...mockCampaigns];
      
      if (status) {
        campaigns = campaigns.filter(campaign => campaign.status === status);
      }
      
      console.log(`Found ${campaigns.length} campaigns`);
      return campaigns;
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      throw error;
    }
  },
  
  getCampaignAnalytics: async (campaignId: string): Promise<EmailCampaignAnalytics> => {
    try {
      console.log(`Fetching analytics for campaign ID: ${campaignId}`);
      
      // Find campaign
      const campaign = mockCampaigns.find(c => c.id === campaignId);
      
      if (!campaign) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      // In a real app, this would fetch detailed analytics
      const mockAnalytics: EmailCampaignAnalytics = {
        campaignId,
        name: campaign.name,
        sent: campaign.totalRecipients,
        delivered: campaign.totalRecipients - Math.floor(campaign.totalRecipients * 0.02), // 2% bounce rate
        bounced: Math.floor(campaign.totalRecipients * 0.02),
        opened: campaign.opened,
        clicked: campaign.clicked,
        unsubscribed: Math.floor(campaign.totalRecipients * 0.01),
        complained: Math.floor(campaign.totalRecipients * 0.005),
        openRate: campaign.totalRecipients > 0 ? campaign.opened / campaign.totalRecipients : 0,
        clickRate: campaign.totalRecipients > 0 ? campaign.clicked / campaign.totalRecipients : 0,
        clickToOpenRate: campaign.opened > 0 ? campaign.clicked / campaign.opened : 0,
        unsubscribeRate: campaign.totalRecipients > 0 ? Math.floor(campaign.totalRecipients * 0.01) / campaign.totalRecipients : 0,
        bouncedRate: campaign.totalRecipients > 0 ? Math.floor(campaign.totalRecipients * 0.02) / campaign.totalRecipients : 0,
        timeline: [
          { date: '2023-05-01', opens: 42, clicks: 18 },
          { date: '2023-05-02', opens: 35, clicks: 14 },
          { date: '2023-05-03', opens: 28, clicks: 11 },
          { date: '2023-05-04', opens: 21, clicks: 8 },
          { date: '2023-05-05', opens: 16, clicks: 7 }
        ]
      };
      
      console.log(`Fetched analytics for campaign: ${campaign.name}`);
      return mockAnalytics;
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      throw error;
    }
  },
  
  scheduleCampaign: async (campaignId: string, scheduledDate: string): Promise<boolean> => {
    try {
      console.log(`Scheduling campaign ID: ${campaignId} for ${scheduledDate}`);
      
      // In a real app, this would make a request to your backend
      const index = mockCampaigns.findIndex(c => c.id === campaignId);
      
      if (index === -1) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      // Update campaign
      mockCampaigns[index] = {
        ...mockCampaigns[index],
        status: 'scheduled',
        scheduledDate,
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Scheduled campaign: ${mockCampaigns[index].name}`);
      return true;
    } catch (error) {
      console.error("Error scheduling campaign:", error);
      throw error;
    }
  },
  
  sendCampaignNow: async (campaignId: string): Promise<boolean> => {
    try {
      console.log(`Sending campaign ID: ${campaignId} now`);
      
      // In a real app, this would make a request to your backend
      const index = mockCampaigns.findIndex(c => c.id === campaignId);
      
      if (index === -1) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      // Update campaign
      mockCampaigns[index] = {
        ...mockCampaigns[index],
        status: 'sending',
        scheduledDate: null,
        sentDate: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Simulate campaign completion after 5 seconds
      setTimeout(() => {
        mockCampaigns[index] = {
          ...mockCampaigns[index],
          status: 'sent',
          updatedAt: new Date().toISOString()
        };
        console.log(`Campaign ${campaignId} completed`);
      }, 5000);
      
      console.log(`Started sending campaign: ${mockCampaigns[index].name}`);
      return true;
    } catch (error) {
      console.error("Error sending campaign:", error);
      throw error;
    }
  },
  
  pauseCampaign: async (campaignId: string): Promise<boolean> => {
    try {
      console.log(`Pausing campaign ID: ${campaignId}`);
      
      // In a real app, this would make a request to your backend
      const index = mockCampaigns.findIndex(c => c.id === campaignId);
      
      if (index === -1) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      // Update campaign
      mockCampaigns[index] = {
        ...mockCampaigns[index],
        status: 'paused',
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Paused campaign: ${mockCampaigns[index].name}`);
      return true;
    } catch (error) {
      console.error("Error pausing campaign:", error);
      throw error;
    }
  },
  
  cancelCampaign: async (campaignId: string): Promise<boolean> => {
    try {
      console.log(`Cancelling campaign ID: ${campaignId}`);
      
      // In a real app, this would make a request to your backend
      const index = mockCampaigns.findIndex(c => c.id === campaignId);
      
      if (index === -1) {
        throw new Error(`Campaign with ID ${campaignId} not found`);
      }
      
      // Update campaign
      mockCampaigns[index] = {
        ...mockCampaigns[index],
        status: 'cancelled',
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Cancelled campaign: ${mockCampaigns[index].name}`);
      return true;
    } catch (error) {
      console.error("Error cancelling campaign:", error);
      throw error;
    }
  },
  
  // Sequences
  getSequences: async (): Promise<EmailSequence[]> => {
    try {
      console.log("Fetching email sequences...");
      
      // In a real app, this would make a request to your backend
      const sequences = [...mockSequences];
      
      console.log(`Found ${sequences.length} sequences`);
      return sequences;
    } catch (error) {
      console.error("Error fetching email sequences:", error);
      throw error;
    }
  },
  
  getSequenceById: async (id: string): Promise<EmailSequence | null> => {
    try {
      console.log(`Fetching email sequence with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const sequence = mockSequences.find(s => s.id === id);
      
      if (!sequence) {
        console.log(`Sequence with ID ${id} not found`);
        return null;
      }
      
      console.log(`Found sequence: ${sequence.name}`);
      return sequence;
    } catch (error) {
      console.error("Error fetching email sequence:", error);
      throw error;
    }
  },
  
  createSequence: async (sequence: Partial<EmailSequence>): Promise<EmailSequence> => {
    try {
      console.log("Creating new email sequence");
      
      // In a real app, this would make a request to your backend
      const newSequence: EmailSequence = {
        id: `sequence_${Date.now()}`,
        name: sequence.name || 'Untitled Sequence',
        description: sequence.description || '',
        triggerType: sequence.triggerType || 'manual',
        triggerEvent: sequence.triggerType === 'event' ? sequence.triggerEvent : undefined,
        steps: sequence.steps || [],
        isActive: sequence.isActive || false,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      // Add to mock data
      mockSequences.push(newSequence);
      
      console.log(`Created sequence with ID: ${newSequence.id}`);
      return newSequence;
    } catch (error) {
      console.error("Error creating email sequence:", error);
      throw error;
    }
  },
  
  updateSequence: async (id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence> => {
    try {
      console.log(`Updating email sequence with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const index = mockSequences.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error(`Sequence with ID ${id} not found`);
      }
      
      // Update sequence
      const updatedSequence: EmailSequence = {
        ...mockSequences[index],
        ...sequence,
        triggerType: sequence.triggerType || mockSequences[index].triggerType,
        updatedAt: new Date().toISOString()
      };
      
      mockSequences[index] = updatedSequence;
      
      console.log(`Updated sequence: ${updatedSequence.name}`);
      return updatedSequence;
    } catch (error) {
      console.error("Error updating email sequence:", error);
      throw error;
    }
  },
  
  deleteSequence: async (id: string): Promise<boolean> => {
    try {
      console.log(`Deleting email sequence with ID: ${id}`);
      
      // In a real app, this would make a request to your backend
      const index = mockSequences.findIndex(s => s.id === id);
      
      if (index === -1) {
        throw new Error(`Sequence with ID ${id} not found`);
      }
      
      // Remove from mock data
      mockSequences.splice(index, 1);
      
      console.log(`Deleted sequence with ID: ${id}`);
      return true;
    } catch (error) {
      console.error("Error deleting email sequence:", error);
      throw error;
    }
  },
  
  getSequenceAnalytics: async (sequenceId: string): Promise<EmailSequenceAnalytics> => {
    try {
      console.log(`Fetching analytics for sequence ID: ${sequenceId}`);
      
      // Find sequence
      const sequence = mockSequences.find(s => s.id === sequenceId);
      
      if (!sequence) {
        throw new Error(`Sequence with ID ${sequenceId} not found`);
      }
      
      // In a real app, this would fetch detailed analytics
      const mockAnalytics: EmailSequenceAnalytics = {
        id: `analytics_${sequenceId}`,
        sequenceId,
        totalEnrollments: 125,
        activeEnrollments: 48,
        completedEnrollments: 77,
        conversionRate: 0.62,
        averageTimeToComplete: 4.5, // days
        updatedAt: new Date().toISOString()
      };
      
      console.log(`Fetched analytics for sequence: ${sequence.name}`);
      return mockAnalytics;
    } catch (error) {
      console.error("Error fetching sequence analytics:", error);
      throw error;
    }
  },
  
  enrollCustomerInSequence: async (sequenceId: string, customerId: string): Promise<boolean> => {
    try {
      console.log(`Enrolling customer ${customerId} in sequence ${sequenceId}`);
      
      // In a real app, this would make a request to your backend or directly use Supabase
      // Here we would:
      // 1. Verify the sequence exists
      // 2. Verify the customer exists
      // 3. Create an enrollment record
      // 4. Possibly trigger the first email if delay is 0
      
      // For now, just simulate success
      // We'd use rpc for real logic in Supabase
      /*
      await supabase.rpc('increment_sequence_enrollments', {
        sequence_id: sequenceId
      });
      
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .insert({
          sequence_id: sequenceId,
          customer_id: customerId,
          status: 'active',
          started_at: new Date().toISOString(),
          metadata: {}, // Any additional data
        });
      
      if (error) {
        throw error;
      }
      */
      
      console.log(`Successfully enrolled customer in sequence`);
      return true;
    } catch (error) {
      console.error("Error enrolling customer in sequence:", error);
      throw error;
    }
  },
  
  pauseCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      console.log(`Pausing enrollment ${enrollmentId}`);
      
      // In a real app, this would update the enrollment status
      /*
      await supabase.rpc('decrement_active_enrollments', {
        sequence_id: sequenceId
      });
      
      await supabase.rpc('decrement_completed_enrollments', {
        sequence_id: sequenceId
      });
      
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', enrollmentId);
      
      await supabase.rpc('increment_active_enrollments', {
        sequence_id: sequenceId
      });
      
      await supabase.rpc('increment_completed_enrollments', {
        sequence_id: sequenceId
      });
      
      if (error) {
        throw error;
      }
      */
      
      console.log(`Successfully paused enrollment`);
      return true;
    } catch (error) {
      console.error("Error pausing enrollment:", error);
      throw error;
    }
  },
  
  resumeCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      console.log(`Resuming enrollment ${enrollmentId}`);
      
      // In a real app, this would update the enrollment status
      /*
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ 
          status: 'active',
          next_send_time: new Date(Date.now() + 3600000).toISOString() // 1 hour from now
        })
        .eq('id', enrollmentId);
      
      if (error) {
        throw error;
      }
      */
      
      console.log(`Successfully resumed enrollment`);
      return true;
    } catch (error) {
      console.error("Error resuming enrollment:", error);
      throw error;
    }
  },
  
  cancelCustomerEnrollment: async (enrollmentId: string): Promise<boolean> => {
    try {
      console.log(`Cancelling enrollment ${enrollmentId}`);
      
      // In a real app, this would update the enrollment status
      /*
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'cancelled' })
        .eq('id', enrollmentId);
      
      if (error) {
        throw error;
      }
      */
      
      console.log(`Successfully cancelled enrollment`);
      return true;
    } catch (error) {
      console.error("Error cancelling enrollment:", error);
      throw error;
    }
  }
};
