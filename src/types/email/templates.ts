
import { EmailCategory, EmailTemplateVariable } from './common';

export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  description?: string;
  category?: EmailCategory;
  content?: string;
  body?: string; // For backward compatibility
  variables?: EmailTemplateVariable[];
  created_at: string;
  updated_at: string;
  is_archived?: boolean;
}

export interface EmailTemplatePreview {
  id: string;
  name: string;
  subject: string;
  category?: EmailCategory;
  created_at: string;
  description?: string;
  is_archived?: boolean;
}
