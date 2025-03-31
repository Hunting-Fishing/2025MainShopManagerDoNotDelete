
import { EmailCategory } from './common';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  body?: string; // Added for backward compatibility
  recipientIds?: string[];
  recipient_ids?: string[];
  recipient_segment?: string;
  sent_at?: string;
  scheduled_at?: string; // Added for compatibility
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  status: EmailCampaignStatus;
  ab_test?: EmailABTest;
  created_by?: string;
  total_recipients?: number;
  totalRecipients?: number; // For compatibility
  email_template_id?: string;
  category?: EmailCategory;
  shop_id?: string;
  
  // Analytics properties used in some components
  opened?: number;
  clicked?: number;
  scheduledDate?: string; // For compatibility
  sentDate?: string; // For compatibility
  segment_ids?: string[];
  segment_id?: string;
  personalizations?: Record<string, any>;
  metadata?: Record<string, any>;
  template_id?: string;
}

export interface EmailCampaignPreview {
  id: string;
  name: string;
  subject: string;
  scheduled_for?: string;
  scheduled_at?: string; // Added for compatibility
  created_at: string;
  updated_at: string;
  status: EmailCampaignStatus;
  total_recipients: number;
  totalRecipients?: number; // For compatibility
  has_ab_test: boolean;
  sent_at?: string;
  
  // Analytics properties used in some components
  opened?: number;
  clicked?: number;
}

export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed' | 'paused' | 'completed';

export interface EmailCampaignAnalytics {
  id: string;
  name?: string; // Added for compatibility
  campaign_id: string;
  total_sent: number;
  total_delivered: number;
  total_opened: number;
  total_clicked: number;
  total_bounced: number;
  total_unsubscribed: number;
  total_complaints: number;
  open_rate: number;
  click_rate: number;
  click_to_open_rate: number;
  unsubscribe_rate: number;
  bounce_rate: number;
  updated_at: string;
  created_at?: string;
  
  // Properties used in CampaignAnalyticsDashboard and other components
  sent?: number;
  delivered?: number;
  opened?: number;
  clicked?: number;
  bounced?: number;
  bounced_rate?: number; // For compatibility with existing code
  complained?: number;
  unsubscribed?: number;
  timeline?: EmailCampaignTimelinePoint[] | any[];
}

export interface EmailCampaignTimelinePoint {
  id?: string;
  campaign_id?: string;
  event_type?: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  event_time?: string;
  recipient_email?: string;
  recipient_id?: string;
  link_url?: string;
  meta_data?: Record<string, any>;
  
  // Properties used in dashboard components
  date?: string;
  opens?: number;
  clicks?: number;
  unsubscribes?: number;
  complaints?: number;
}

export interface EmailABTest {
  id?: string;
  name?: string;
  campaign_id?: string;
  test_type?: 'subject' | 'content' | 'sender' | 'send_time';
  variants: EmailABTestVariant[];
  winner_id?: string;
  winner_selected_at?: string;
  selection_criteria?: 'opens' | 'clicks' | 'manual';
  test_size_percent?: number;
  testing_duration_hours?: number;
  status?: 'running' | 'completed' | 'cancelled';
  created_at?: string;
  updated_at?: string;
  
  // Properties used in EmailABTestingForm and other components
  enabled?: boolean;
  winnerCriteria?: 'open_rate' | 'click_rate';
  winnerSelectionDate?: string | null;
  winnerId?: string | null;
}

export interface EmailABTestVariant {
  id: string;
  name: string;
  test_id?: string;
  subject?: string;
  content?: string;
  send_time?: string;
  sender?: string;
  total_sent?: number;
  total_opened?: number;
  total_clicked?: number;
  open_rate?: number;
  click_rate?: number;
  is_winner?: boolean;
  is_control?: boolean;
  
  // Properties used in EmailABTestingForm
  recipientPercentage?: number;
  recipients?: number;
  opened?: number;
  clicked?: number;
  improvement?: number;
  metrics?: {
    openRate?: number;
    clickRate?: number;
    clickToOpenRate?: number;
    conversionRate?: number;
  };
}

export interface EmailABTestResult {
  testId: string;
  campaignId: string;
  winnerId?: string;
  winnerName?: string;
  confidenceLevel?: number;
  metrics?: {
    openRate?: {
      control: number;
      variant: number;
      improvement: number;
    };
    clickRate?: {
      control: number;
      variant: number;
      improvement: number;
    };
  };
  
  // Properties used in CampaignAnalyticsDashboard
  variants?: EmailABTestVariant[];
  winner?: EmailABTestVariant | null;
  winnerSelectedAt?: string | null;
  winnerCriteria?: 'open_rate' | 'click_rate';
  isComplete?: boolean;
  winningVariantId?: string;
}
