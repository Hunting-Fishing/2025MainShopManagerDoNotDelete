export type EmailTemplateVariable = {
  name: string;
  defaultValue: string;
  description: string;
};

export type EmailTemplatePreview = {
  id: string;
  name: string;
  subject: string;
  description: string;
  category: EmailCategory;
  createdAt: string;
  updatedAt: string;
};

export type EmailTemplate = EmailTemplatePreview & {
  content: string;
  variables: EmailTemplateVariable[];
  isArchived: boolean;
};

export type EmailCategory = 
  | 'transactional' 
  | 'marketing' 
  | 'reminder' 
  | 'welcome' 
  | 'follow_up' 
  | 'survey' 
  | 'custom';

export type EmailCampaignStatus = 
  | 'draft'
  | 'scheduled' 
  | 'sending' 
  | 'sent' 
  | 'paused' 
  | 'cancelled';

export type EmailCampaignPreview = {
  id: string;
  name: string;
  subject: string;
  status: EmailCampaignStatus;
  scheduledDate: string | null;
  sentDate: string | null;
  totalRecipients: number;
  opened: number;
  clicked: number;
  createdAt: string;
  updatedAt: string;
};

export type EmailCampaign = EmailCampaignPreview & {
  templateId: string;
  content: string;
  segmentIds: string[];
  recipientIds: string[];
  personalizations: Record<string, string>[];
  metadata: Record<string, any>;
  abTest: EmailABTest | null;
};

export type EmailABTest = {
  enabled: boolean;
  variants: EmailABTestVariant[];
  winnerCriteria: 'open_rate' | 'click_rate';
  winnerSelectionDate: string | null;
  winnerId: string | null;
};

export type EmailABTestVariant = {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientPercentage: number;
  recipients: number;
  opened: number;
  clicked: number;
};

export type EmailSequence = {
  id: string;
  name: string;
  description: string;
  triggerType: 'manual' | 'event' | 'schedule';
  triggerEvent?: string;
  steps: EmailSequenceStep[];
  isActive: boolean;
  createdBy?: string;
  createdAt: string;
  updatedAt: string;
};

export type EmailSequenceStep = {
  id: string;
  name: string;
  templateId: string;
  delayHours: number;
  delayType: 'fixed' | 'business_days';
  position: number;
  isActive: boolean;
  condition?: {
    type: 'event' | 'property';
    value: string;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
  };
};

export type EmailSequenceEnrollment = {
  id: string;
  sequenceId: string;
  customerId: string;
  currentStepId?: string;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  startedAt: string;
  completedAt?: string;
  nextSendTime?: string;
  metadata?: Record<string, any>;
};

export type EmailSequenceAnalytics = {
  id: string;
  sequenceId: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  conversionRate?: number;
  averageTimeToComplete?: number;
  updatedAt: string;
};

export type EmailCampaignAnalytics = {
  campaignId: string;
  name: string;
  sent: number;
  delivered: number;
  bounced: number;
  opened: number;
  clicked: number;
  unsubscribed: number;
  complained: number;
  openRate: number;
  clickRate: number;
  clickToOpenRate: number;
  unsubscribeRate: number;
  bouncedRate: number;
  timeline: {
    date: string;
    opens: number;
    clicks: number;
  }[];
};

export type EmailRecipient = {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  customFields: Record<string, any>;
  segmentIds: string[];
  isUnsubscribed: boolean;
  bounceStatus: 'none' | 'soft' | 'hard';
  lastEngagement: string | null;
};
