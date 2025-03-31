import { supabase } from "@/integrations/supabase/client";
import { 
  Email, 
  EmailTemplate, 
  EmailTemplatePreview, 
  EmailCategory, 
  EmailCampaign, 
  EmailCampaignPreview, 
  EmailSegment, 
  EmailSequence, 
  EmailSequenceStep, 
  EmailSequenceEnrollment,
  EmailCampaignAnalytics,
  EmailTemplateVariable,
  EmailABTest
} from "@/types/email";

const mockEmails: Email[] = [
  {
    id: "1",
    subject: "Welcome to our platform!",
    body: "We're excited to have you on board.",
    from: "welcome@example.com",
    to: "user@example.com",
    sent_at: "2023-01-01T12:00:00Z",
    status: "sent",
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T12:00:00Z",
  },
  {
    id: "2",
    subject: "Important account update",
    body: "Please update your password for security reasons.",
    from: "security@example.com",
    to: "user@example.com",
    sent_at: "2023-01-05T18:00:00Z",
    status: "sent",
    created_at: "2023-01-05T00:00:00Z",
    updated_at: "2023-01-05T18:00:00Z",
  },
];

const mockTemplates: EmailTemplatePreview[] = [
  {
    id: "101",
    name: "Welcome Email",
    subject: "Welcome to our service!",
    category: "welcome",
    created_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "102",
    name: "Password Reset",
    subject: "Reset your password",
    category: "transactional",
    created_at: "2023-01-15T00:00:00Z",
  },
];

const mockCampaigns: EmailCampaignPreview[] = [
  {
    id: "201",
    name: "Spring Sale",
    subject: "Huge discounts on all items!",
    status: "scheduled",
    scheduled_at: "2023-03-01T09:00:00Z",
    created_at: "2023-02-15T00:00:00Z",
    totalRecipients: 5000,
    opened: 2500,
    clicked: 500,
  },
  {
    id: "202",
    name: "New Product Launch",
    subject: "Introducing our latest innovation",
    status: "draft",
    created_at: "2023-03-01T00:00:00Z",
    totalRecipients: 0,
    opened: 0,
    clicked: 0,
  },
];

const mockSegments: EmailSegment[] = [
  {
    id: "301",
    name: "Active Users",
    description: "Users who have logged in within the last month",
    criteria: [],
    created_at: "2022-12-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "302",
    name: "New Signups",
    description: "Users who signed up in the last week",
    criteria: [],
    created_at: "2023-01-15T00:00:00Z",
    updated_at: "2023-01-22T00:00:00Z",
  },
];

const mockSequences: EmailSequence[] = [
  {
    id: "401",
    name: "Onboarding Sequence",
    description: "A sequence of emails to onboard new users",
    steps: [],
    created_at: "2023-01-01T00:00:00Z",
    updated_at: "2023-01-01T00:00:00Z",
  },
  {
    id: "402",
    name: "Re-engagement Sequence",
    description: "A sequence of emails to re-engage inactive users",
    steps: [],
    created_at: "2023-02-01T00:00:00Z",
    updated_at: "2023-02-01T00:00:00Z",
  },
];

const mockEnrollments: EmailSequenceEnrollment[] = [
  {
    id: "501",
    sequence_id: "401",
    customer_id: "user123",
    status: "active",
    created_at: "2023-01-05T00:00:00Z",
    updated_at: "2023-01-05T00:00:00Z",
  },
  {
    id: "502",
    sequence_id: "402",
    customer_id: "user456",
    status: "paused",
    created_at: "2023-02-05T00:00:00Z",
    updated_at: "2023-02-05T00:00:00Z",
  },
];

const mockAnalytics: EmailCampaignAnalytics = {
  id: "601",
  campaign_id: "201",
  name: "Spring Sale",
  sent: 5000,
  delivered: 4900,
  opened: 2500,
  clicked: 500,
  bounced: 100,
  complained: 10,
  unsubscribed: 50,
  open_rate: 0.5,
  click_rate: 0.1,
  click_to_open_rate: 0.2,
  bounced_rate: 0.02,
  unsubscribe_rate: 0.01,
  timeline: [],
  created_at: "2023-02-15T00:00:00Z",
  updated_at: "2023-03-01T00:00:00Z",
};

class EmailService {
  constructor() {}

  // Email methods
  async getEmails(id?: string): Promise<Email | Email[]> {
    return id ? mockEmails.find((email) => email.id === id) as Email : mockEmails;
  }

  async sendEmail(email: Email): Promise<Email> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...email, id: Math.random().toString() });
      }, 500);
    });
  }

  // Template methods
  async getTemplates(id?: string): Promise<EmailTemplate | EmailTemplatePreview[]> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_templates')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data as EmailTemplate;
      } else {
        const { data, error } = await supabase
          .from('email_templates')
          .select('id, name, subject, category, created_at')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as EmailTemplatePreview[];
      }
    } catch (error) {
      console.error("Error fetching email templates:", error);
      return id ? mockTemplates.find((template) => template.id === id) as EmailTemplate : mockTemplates;
    }
  }

  async createTemplate(template: EmailTemplate): Promise<EmailTemplate> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...template, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateTemplate(id: string, updates: Partial<EmailTemplate>): Promise<EmailTemplate> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockTemplates.find((template) => template.id === id), ...updates } as EmailTemplate);
      }, 500);
    });
  }

  async deleteTemplate(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  // Campaign methods
  async getCampaigns(id?: string): Promise<EmailCampaign | EmailCampaignPreview[]> {
    try {
      if (id) {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('id', id)
          .single();
          
        if (error) throw error;
        return data as EmailCampaign;
      } else {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('id, name, subject, status, scheduled_date, sent_date, created_at, total_recipients, opened, clicked')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        return data as EmailCampaignPreview[];
      }
    } catch (error) {
      console.error("Error fetching email campaigns:", error);
      return id ? mockCampaigns.find((campaign) => campaign.id === id) as EmailCampaign : mockCampaigns;
    }
  }

  async createCampaign(campaign: EmailCampaign): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...campaign, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateCampaign(id: string, updates: Partial<EmailCampaign>): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), ...updates } as EmailCampaign);
      }, 500);
    });
  }

  async deleteCampaign(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async scheduleCampaign(id: string, date: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), scheduled_at: date } as EmailCampaign);
      }, 500);
    });
  }

  async sendCampaignNow(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'sending' } as EmailCampaign);
      }, 500);
    });
  }

  async pauseCampaign(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'paused' } as EmailCampaign);
      }, 500);
    });
  }

  async cancelCampaign(id: string): Promise<EmailCampaign> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockCampaigns.find((campaign) => campaign.id === id), status: 'cancelled' } as EmailCampaign);
      }, 500);
    });
  }

  // Segment methods
  async getSegments(id?: string): Promise<EmailSegment | EmailSegment[]> {
    return id ? mockSegments.find((segment) => segment.id === id) as EmailSegment : mockSegments;
  }

  async createSegment(segment: EmailSegment): Promise<EmailSegment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...segment, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateSegment(id: string, updates: Partial<EmailSegment>): Promise<EmailSegment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockSegments.find((segment) => segment.id === id), ...updates } as EmailSegment);
      }, 500);
    });
  }

  async deleteSegment(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  // Sequence methods
  async getSequences(id?: string): Promise<EmailSequence | EmailSequence[]> {
    return id ? mockSequences.find((sequence) => sequence.id === id) as EmailSequence : mockSequences;
  }

  async createSequence(sequence: EmailSequence): Promise<EmailSequence> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...sequence, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateSequence(id: string, updates: Partial<EmailSequence>): Promise<EmailSequence> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockSequences.find((sequence) => sequence.id === id), ...updates } as EmailSequence);
      }, 500);
    });
  }

  async deleteSequence(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  // Sequence Step methods
  async getSequenceSteps(sequenceId: string): Promise<EmailSequenceStep[]> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([]);
      }, 500);
    });
  }

  async createSequenceStep(step: EmailSequenceStep): Promise<EmailSequenceStep> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...step, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateSequenceStep(id: string, updates: Partial<EmailSequenceStep>): Promise<EmailSequenceStep> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...[]?.find((step) => step.id === id), ...updates } as EmailSequenceStep);
      }, 500);
    });
  }

  async deleteSequenceStep(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  // Enrollment methods
  async getEnrollments(id?: string): Promise<EmailSequenceEnrollment | EmailSequenceEnrollment[]> {
    return id ? mockEnrollments.find((enrollment) => enrollment.id === id) as EmailSequenceEnrollment : mockEnrollments;
  }

  async enrollCustomerInSequence(enrollment: EmailSequenceEnrollment): Promise<EmailSequenceEnrollment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...enrollment, id: Math.random().toString() });
      }, 500);
    });
  }

  async updateEnrollment(id: string, updates: Partial<EmailSequenceEnrollment>): Promise<EmailSequenceEnrollment> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ ...mockEnrollments.find((enrollment) => enrollment.id === id), ...updates } as EmailSequenceEnrollment);
      }, 500);
    });
  }

  async cancelEnrollment(id: string): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true);
      }, 500);
    });
  }

  async getCustomerSequenceEnrollments(customerId: string): Promise<EmailSequenceEnrollment[]> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .select('*')
        .eq('customer_id', customerId);
        
      if (error) throw error;
      return data as EmailSequenceEnrollment[];
    } catch (error) {
      console.error("Error fetching customer sequence enrollments:", error);
      return mockEnrollments.filter((enrollment) => enrollment.customer_id === customerId);
    }
  }

  async pauseSequenceEnrollment(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'paused' })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error pausing sequence enrollment:", error);
      return false;
    }
  }

  async resumeSequenceEnrollment(id: string): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .from('email_sequence_enrollments')
        .update({ status: 'active' })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } catch (error) {
      console.error("Error resuming sequence enrollment:", error);
      return false;
    }
  }

  async getCampaignAnalytics(campaignId: string): Promise<EmailCampaignAnalytics> {
    try {
      const { data, error } = await supabase
        .from('email_campaign_analytics')
        .select('*')
        .eq('campaign_id', campaignId)
        .single();
        
      if (error) throw error;
      return data as EmailCampaignAnalytics;
    } catch (error) {
      console.error("Error fetching campaign analytics:", error);
      return mockAnalytics;
    }
  }
}

export const emailService = new EmailService();
