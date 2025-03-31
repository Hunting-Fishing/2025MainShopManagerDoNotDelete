
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
  order: number;
  delay_duration?: string;
  email_template_id?: string;
  created_at: string;
  updated_at: string;
  
  // UI component support
  name?: string;
  type?: 'delay' | 'email';
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
  
  // Additional properties from joins
  sequence?: any;
  current_step?: any;
}

export interface EmailSequenceAnalytics {
  id: string;
  sequence_id: string;
  sequenceId?: string;
  total_enrollments: number;
  totalEnrollments?: number;
  active_enrollments: number;
  activeEnrollments?: number;
  completed_enrollments: number;
  completedEnrollments?: number;
  cancelled_enrollments?: number;
  conversion_rate: number;
  conversionRate?: number;
  average_time_to_complete: number;
  averageTimeToComplete?: number;
  updated_at: string;
  updatedAt?: string;
  created_at?: string;
  createdAt?: string;
  
  // Additional analytics properties
  total_emails_sent?: number;
  totalEmailsSent?: number;
  open_rate?: number;
  openRate?: number;
  click_rate?: number;
  clickRate?: number;
}
