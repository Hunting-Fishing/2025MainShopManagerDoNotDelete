
export type EmailCampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused' | 'completed' | 'cancelled';

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
  recipient_ids: string[];
  personalizations: Record<string, any>;
  metadata: Record<string, any>;
  abTest?: EmailABTest | null;
  ab_test?: EmailABTest | null;
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
  segment_ids: string[];
}

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
