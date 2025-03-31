
export interface EmailSequence {
  id: string;
  name: string;
  description: string;
  steps: EmailSequenceStep[];
  created_at: string;
  updated_at: string;
  shop_id: string;
  created_by: string;
  trigger_type: "manual" | "event" | "schedule";
  trigger_event: string;
  is_active: boolean;
  last_run?: string;
  next_run?: string;
  run_frequency?: string;
  
  // Aliased properties for component compatibility
  triggerType?: "manual" | "event" | "schedule";
  triggerEvent?: string;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface EmailSequenceStep {
  id: string;
  sequence_id?: string;
  order: number;
  template_id: string;
  wait_days: number;
  conditions?: EmailSequenceStepCondition[];
  created_at?: string;
  updated_at?: string;
  
  // Additional properties needed by components
  name?: string;
  type?: 'email' | 'delay';
  templateId?: string;
  email_template_id?: string;
  condition?: EmailSequenceStepCondition;
  delayHours?: number;
  delayType?: 'fixed' | 'business_days';
  position?: number;
  isActive?: boolean;
}

export interface EmailSequenceStepCondition {
  field: string;
  operator: string;
  value: any;
  type?: 'event' | 'property';
}

export interface EmailSequenceEnrollment {
  id: string;
  sequence_id: string;
  customer_id: string;
  status: "active" | "completed" | "paused" | "cancelled" | "error";
  current_step?: number;
  next_send_date?: string;
  progress?: EmailSequenceProgress;
  metadata?: Record<string, any>;
  created_at: string;
  updated_at: string;
  customer_email?: string;
  customer_name?: string;
  completed_at?: string;
  current_step_id?: string;
  
  // Additional properties needed by components
  nextSendTime?: string;
  sequence?: EmailSequence;
  // Making current_step more flexible to accept both number and object
  current_step_object?: {
    id: string;
    name: string;
    template_id: string;
    position: number;
  };
}

export interface EmailSequenceProgress {
  completed_steps: string[];
  last_step_sent?: string;
  last_step_sent_at?: string;
  next_step?: string;
}

export interface EmailSequenceAnalytics {
  id: string;
  sequence_id: string;
  total_enrollments: number;
  active_enrollments: number;
  completed_enrollments: number;
  cancelled_enrollments: number;
  total_emails_sent: number;
  open_rate: number;
  click_rate: number;
  conversion_rate?: number;
  average_time_to_complete?: number;
  created_at: string;
  updated_at: string;
  
  // Aliased properties for component compatibility
  totalEnrollments?: number;
  activeEnrollments?: number;
  completedEnrollments?: number;
  averageTimeToComplete?: number;
  conversionRate?: number;
  sequenceId?: string;
}
