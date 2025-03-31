
import { EmailCategory } from './common';

export interface EmailCampaign {
  id: string;
  name: string;
  subject: string;
  content: string;
  recipients?: string[];
  recipient_segment?: string;
  sent_at?: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  status: EmailCampaignStatus;
  ab_test?: EmailABTest;
  created_by?: string;
  total_recipients?: number;
  email_template_id?: string;
  category?: EmailCategory;
  shop_id?: string;
}

export interface EmailCampaignPreview {
  id: string;
  name: string;
  subject: string;
  scheduled_for?: string;
  created_at: string;
  updated_at: string;
  status: EmailCampaignStatus;
  total_recipients: number;
  has_ab_test: boolean;
  sent_at?: string;
}

export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'cancelled' | 'failed';

export interface EmailCampaignAnalytics {
  id: string;
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
}

export interface EmailCampaignTimelinePoint {
  id: string;
  campaign_id: string;
  event_type: 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'unsubscribed' | 'complained';
  event_time: string;
  recipient_email?: string;
  recipient_id?: string;
  link_url?: string;
  meta_data?: Record<string, any>;
}

export interface EmailABTest {
  id: string;
  name: string;
  campaign_id: string;
  test_type: 'subject' | 'content' | 'sender' | 'send_time';
  variants: EmailABTestVariant[];
  winner_id?: string;
  winner_selected_at?: string;
  selection_criteria: 'opens' | 'clicks' | 'manual';
  test_size_percent: number;
  testing_duration_hours: number;
  status: 'running' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

export interface EmailABTestVariant {
  id: string;
  name: string;
  test_id: string;
  subject?: string;
  content?: string;
  send_time?: string;
  sender?: string;
  total_sent: number;
  total_opened: number;
  total_clicked: number;
  open_rate: number;
  click_rate: number;
  is_winner?: boolean;
  is_control?: boolean;
}

export interface EmailABTestResult {
  testId: string;
  winnerId: string;
  winnerName: string;
  confidenceLevel: number;
  metrics: {
    openRate: {
      control: number;
      variant: number;
      improvement: number;
    };
    clickRate: {
      control: number;
      variant: number;
      improvement: number;
    };
  };
}
