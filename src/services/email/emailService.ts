
import { v4 as uuidv4 } from 'uuid';
import { 
  EmailTemplate, 
  EmailTemplatePreview,
  EmailCampaign, 
  EmailCampaignPreview,
  EmailSequence,
  EmailCategory
} from "@/types/email";

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
    trigger: "event",
    triggerEvent: "new_customer",
    steps: [
      {
        id: "step1",
        name: "Welcome Email",
        templateId: "1",
        delay: 0,
        delayType: "fixed",
      },
      {
        id: "step2",
        name: "Follow-up Email",
        templateId: "2",
        delay: 72,
        delayType: "fixed",
      }
    ],
    isActive: true,
    createdAt: new Date().toISOString(),
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
    return [...mockSequences];
  },
  
  async getSequenceById(id: string): Promise<EmailSequence | null> {
    const sequence = mockSequences.find(s => s.id === id);
    return sequence ? { ...sequence } : null;
  },
  
  async createSequence(sequence: Partial<EmailSequence>): Promise<EmailSequence> {
    const newSequence: EmailSequence = {
      id: uuidv4(),
      name: sequence.name || "New Sequence",
      description: sequence.description || "",
      trigger: sequence.trigger || "manual",
      triggerEvent: sequence.triggerEvent,
      steps: sequence.steps || [],
      isActive: sequence.isActive || false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    mockSequences.push(newSequence);
    return newSequence;
  },
  
  async updateSequence(id: string, sequence: Partial<EmailSequence>): Promise<EmailSequence> {
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
  },
  
  async deleteSequence(id: string): Promise<void> {
    const index = mockSequences.findIndex(s => s.id === id);
    
    if (index !== -1) {
      mockSequences.splice(index, 1);
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
