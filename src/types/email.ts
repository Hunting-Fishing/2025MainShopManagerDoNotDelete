export interface Email {
  id: string;
  subject: string;
  body: string;
  from: string;
  to: string;
  cc?: string;
  bcc?: string;
  sent_at?: string;
  status: 'sent' | 'draft' | 'failed';
  attachments?: string[];
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description?: string;
  category?: EmailCategory;
  content?: string;
  variables?: EmailTemplateVariable[];
  created_at: string;
  updated_at: string;
  body?: string;
  is_archived?: boolean;
}

export type EmailCategory = 'marketing' | 'transactional' | 'reminder' | 'welcome' | 'follow_up' | 'survey' | 'custom';

export interface EmailTemplateVariable {
  id: string;
  name: string;
  description?: string;
  default_value?: string;
  defaultValue?: string; // Support for UI components
}

export interface EmailTemplatePreview {
  id: string;
  name: string;
  subject: string;
  category?: EmailCategory;
  created_at: string;
  description?: string;
  is_archived?: boolean;
  // Alias properties for UI components
  createdAt?: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  segment_id?: string;
  template_id?: string;
  status: EmailCampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
  content?: string;
  recipientIds?: string[];
  recipient_ids?: string[];
  personalizations?: Record<string, any>;
  metadata?: Record<string, any>;
  abTest?: EmailABTest;
  ab_test?: EmailABTest;
  totalRecipients?: number;
  total_recipients?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
  complained?: number;
  unsubscribed?: number;
  sentDate?: string;
  scheduledDate?: string;
  // UI component support
  templateId?: string;
  segmentIds?: string[];
  segment_ids?: string[];
}

export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed' | 'cancelled';

export interface EmailCampaignPreview {
  id: string;
  name: string;
  subject: string;
  status: EmailCampaignStatus;
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  total_recipients: number;
  opened: number;
  clicked: number;
  totalRecipients?: number; // Alias for UI components
  scheduledDate?: string;   // Alias for UI components
  sentDate?: string;        // Alias for UI components
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  steps: EmailSequenceStep[];
  created_at: string;
  updated_at: string;
  shop_id?: string;
  created_by?: string;
  trigger_type?: 'manual' | 'event' | 'schedule';
  trigger_event?: string;
  is_active?: boolean;
  
  // UI component support
  triggerType?: 'manual' | 'event' | 'schedule';
  triggerEvent?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id: string;
  type: 'delay' | 'email';
  order: number;
  delay_duration?: string;
  email_template_id?: string;
  created_at: string;
  updated_at: string;
  
  // UI component support
  name?: string;
  templateId?: string;
  delayHours?: number;
  delayType?: 'fixed' | 'business_days';
  position?: number;
  isActive?: boolean;
  condition?: {
    type: 'event' | 'property';
    value: any;
    operator: '=' | '!=' | '>' | '<' | '>=' | '<=';
  };
}

export interface EmailSequenceEnrollment {
  id: string;
  sequence_id: string;
  customer_id: string;
  status: 'active' | 'paused' | 'completed' | 'cancelled';
  current_step_id?: string;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  
  // UI component support
  sequenceId?: string;
  customerId?: string;
  currentStepId?: string;
  startedAt?: string;
  completedAt?: string;
  nextSendTime?: string;
  metadata?: Record<string, any>;
}

export interface EmailSegment {
  id: string;
  name: string;
  description?: string;
  criteria: EmailSegmentCriteria[];
  created_at: string;
  updated_at: string;
}

export interface EmailSegmentCriteria {
  id: string;
  segment_id: string;
  field: string;
  operator: string;
  value: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaignTimelinePoint {
  date: string;
  opens: number;
  clicks: number;
  unsubscribes?: number;
  complaints?: number;
}

export interface EmailCampaignAnalytics {
  id: string;
  name: string;
  campaign_id: string;
  sent: number;
  delivered: number;
  opened: number;
  clicked: number;
  bounced: number;
  complained: number;
  unsubscribed: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  bounced_rate: number;
  unsubscribe_rate: number;
  timeline: EmailCampaignTimelinePoint[];
  created_at: string;
  updated_at: string;
}

export interface EmailABTest {
  enabled: boolean;
  variants: EmailABTestVariant[];
  winnerCriteria: 'open_rate' | 'click_rate';
  winnerSelectionDate: string | null;
  winnerId: string | null;
}

export interface EmailABTestVariant {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipientPercentage: number;
  recipients: number;
  opened: number;
  clicked: number;
  improvement?: number;
  metrics?: {
    openRate: number;
    clickRate: number;
    clickToOpenRate: number;
    conversionRate?: number;
  };
}

export interface EmailABTestResult {
  testId: string;
  campaignId: string;
  variants: EmailABTestVariant[];
  winner: EmailABTestVariant | null;
  winnerSelectedAt: string | null;
  winnerCriteria: 'open_rate' | 'click_rate';
  isComplete: boolean;
  winningVariantId?: string;
  confidenceLevel?: number;
}

export interface EmailSequenceAnalytics {
  id: string;
  sequenceId: string;
  sequence_id: string;
  totalEnrollments: number;
  total_enrollments: number;
  activeEnrollments: number;
  active_enrollments: number;
  completedEnrollments: number;
  completed_enrollments: number;
  conversionRate: number;
  conversion_rate: number;
  averageTimeToComplete: number;
  average_time_to_complete: number;
  updatedAt: string;
  updated_at: string;
}

export interface CustomerValuePrediction {
  currentValue: number;
  predictedValue: number;
  growthRate: number;
  timeframe: number; // months
  recommendedServices: string[];
  nextContactTime: string;
}

export interface CustomerSegmentAnalytics {
  segmentId: string;
  segmentName: string;
  customerCount: number;
  averageValue: number;
  retentionRate: number;
  growthRate: number;
  serviceFrequency: number;
}

export interface RetentionAnalytics {
  overallRate: number;
  bySegment: Record<string, number>;
  byTimeframe: {
    month: string;
    rate: number;
  }[];
  riskFactors: {
    factor: string;
    impact: number;
  }[];
}
