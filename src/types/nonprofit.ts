export interface Program {
  id: string;
  name: string;
  description?: string;
  program_type: 'education' | 'health' | 'environment' | 'community' | 'youth' | 'seniors' | 'other';
  status: 'active' | 'inactive' | 'completed' | 'planned';
  start_date?: string;
  end_date?: string;
  budget_allocated: number;
  budget_spent: number;
  target_participants: number;
  current_participants: number;
  location?: string;
  coordinator_id?: string;
  shop_id: string;
  grant_funded: boolean;
  funding_sources: string[];
  success_metrics: string[];
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface Volunteer {
  id: string;
  customer_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  skills: string[];
  availability: Record<string, any>;
  background_check_status: 'pending' | 'approved' | 'rejected' | 'expired';
  background_check_date?: string;
  training_completed: string[];
  volunteer_hours: number;
  status: 'active' | 'inactive' | 'suspended';
  notes?: string;
  shop_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ProgramParticipant {
  id: string;
  program_id: string;
  participant_name: string;
  participant_email?: string;
  participant_phone?: string;
  enrollment_date: string;
  completion_date?: string;
  status: 'enrolled' | 'active' | 'completed' | 'dropped' | 'suspended';
  progress_notes?: string;
  outcome_data: Record<string, any>;
  demographics: Record<string, any>;
  shop_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface VolunteerAssignment {
  id: string;
  volunteer_id: string;
  program_id?: string;
  role: string;
  start_date: string;
  end_date?: string;
  hours_committed: number;
  hours_completed: number;
  status: 'active' | 'completed' | 'cancelled';
  notes?: string;
  shop_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface ImpactMeasurementData {
  id: string;
  metric_id: string;
  measured_value: number;
  measurement_date: string;
  notes?: string;
  verified_by?: string;
  verification_date?: string;
  shop_id: string;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  name: string;
  description?: string;
  program_type: Program['program_type'];
  status?: Program['status'];
  start_date?: string;
  end_date?: string;
  budget_allocated?: number;
  target_participants?: number;
  location?: string;
  coordinator_id?: string;
  grant_funded?: boolean;
  funding_sources?: string[];
  success_metrics?: string[];
}

export interface CreateVolunteerData {
  customer_id?: string;
  first_name: string;
  last_name: string;
  email?: string;
  phone?: string;
  address?: string;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  skills?: string[];
  availability?: Record<string, any>;
  background_check_status?: Volunteer['background_check_status'];
  background_check_date?: string;
  training_completed?: string[];
  notes?: string;
}

export interface CreateParticipantData {
  program_id: string;
  participant_name: string;
  participant_email?: string;
  participant_phone?: string;
  enrollment_date?: string;
  status?: ProgramParticipant['status'];
  progress_notes?: string;
  outcome_data?: Record<string, any>;
  demographics?: Record<string, any>;
}

export interface CreateVolunteerAssignmentData {
  volunteer_id: string;
  program_id?: string;
  role: string;
  start_date: string;
  end_date?: string;
  hours_committed?: number;
  notes?: string;
}

export interface CreateImpactMeasurementData {
  metric_id: string;
  measured_value: number;
  measurement_date?: string;
  notes?: string;
  verified_by?: string;
}