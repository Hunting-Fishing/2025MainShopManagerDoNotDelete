
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
