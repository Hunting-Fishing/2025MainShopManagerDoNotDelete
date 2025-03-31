
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
}

export interface EmailSequenceStepCondition {
  field: string;
  operator: string;
  value: any;
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
  created_at: string;
  updated_at: string;
}
