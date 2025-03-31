
export interface Email {
  id: string;
  subject: string;
  body: string;
  content?: string; // Alternative field name for body
  from?: string;
  to?: string;
  cc?: string;
  bcc?: string;
  sent_at?: string;
  status?: 'sent' | 'draft' | 'failed';
  created_at: string;
  updated_at: string;
}

export type EmailCategory = 'transactional' | 'marketing' | 'reminder' | 'welcome' | 'follow_up' | 'survey' | 'custom';

export interface EmailTemplateVariable {
  id: string;
  name: string;
  description?: string;
  default_value?: string;
}
