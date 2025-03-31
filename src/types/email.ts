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
  body: string;
  created_at: string;
  updated_at: string;
}

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  body: string;
  segment_id?: string;
  template_id?: string;
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'completed' | 'cancelled';
  scheduled_at?: string;
  sent_at?: string;
  created_at: string;
  updated_at: string;
}

export interface EmailSequence {
  id: string;
  name: string;
  description?: string;
  steps: EmailSequenceStep[];
  created_at: string;
  updated_at: string;
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

export interface EmailSequenceAnalytics {
  id: string;
  sequenceId: string;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  conversionRate: number;
  averageTimeToComplete: number;
  updatedAt: string;
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
