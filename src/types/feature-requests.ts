export interface FeatureRequest {
  id: string;
  title: string;
  description: string;
  category: 'ui_ux' | 'functionality' | 'integration' | 'performance' | 'security' | 'other';
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'submitted' | 'under_review' | 'approved' | 'in_development' | 'testing' | 'completed' | 'rejected' | 'on_hold';
  
  // User information
  submitted_by?: string;
  submitter_email?: string;
  submitter_name?: string;
  
  // Voting system
  vote_count: number;
  upvotes: number;
  downvotes: number;
  
  // Development tracking
  complexity_estimate?: 'trivial' | 'minor' | 'major' | 'epic';
  estimated_hours?: number;
  assigned_developer?: string;
  target_version?: string;
  
  // Technical details
  technical_requirements?: string;
  implementation_notes?: string;
  acceptance_criteria?: string;
  
  // Integration with support system
  support_ticket_id?: string;
  
  // Metadata
  is_public: boolean;
  is_featured: boolean;
  tags: string[];
  attachments: any[];
  
  // Tracking
  created_at: string;
  updated_at: string;
  reviewed_at?: string;
  completed_at?: string;
  
  // Admin notes
  admin_notes?: string;
}

export interface FeatureRequestVote {
  id: string;
  feature_request_id: string;
  user_id?: string;
  vote_type: 'upvote' | 'downvote';
  created_at: string;
}

export interface FeatureRequestComment {
  id: string;
  feature_request_id: string;
  user_id?: string;
  commenter_name?: string;
  commenter_email?: string;
  content: string;
  is_admin_comment: boolean;
  created_at: string;
  updated_at: string;
}

export interface FeatureRequestStatusHistory {
  id: string;
  feature_request_id: string;
  old_status?: string;
  new_status: string;
  changed_by?: string;
  change_reason?: string;
  created_at: string;
}

export interface CreateFeatureRequestPayload {
  title: string;
  description: string;
  category: FeatureRequest['category'];
  priority: FeatureRequest['priority'];
  submitter_name?: string;
  submitter_email?: string;
  technical_requirements?: string;
  implementation_notes?: string;
  acceptance_criteria?: string;
  tags?: string[];
}