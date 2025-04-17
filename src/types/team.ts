export interface TeamMember {
  id: string;
  name?: string;
  first_name?: string;
  last_name?: string;
  role: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  status: "Active" | "Inactive" | "On Leave" | "Terminated";
  statusChangeDate?: string;
  statusChangeReason?: string;
  workOrders: {
    assigned: number;
    completed: number;
  };
  permissions?: Record<string, any>; // Optional permissions for custom roles
  notes?: string;
  joinDate?: string;
  lastActive?: string;
  work_days?: string[];
  shift_start?: string;
  shift_end?: string;
  on_call_after_hours?: boolean;
  start_date?: string;
  employment_type?: string;
  employee_id?: string;
  supervisor_id?: string;
  primary_location?: string;
  work_at_other_locations?: boolean;
  admin_privileges?: boolean;
  access_financials?: boolean;
  can_create_work_orders?: boolean;
  can_close_jobs?: boolean;
  pay_rate?: number;
  pay_type?: string;
  banking_info_on_file?: boolean;
  tax_form_submitted?: boolean;
  recentActivity?: Array<{
    type: string;
    date: string;
    description: string;
    flagged?: boolean;
    flagReason?: string;
  }>;
  previousAssignments?: Array<{
    workOrderId: string;
    assignedDate: string;
    completedDate?: string;
    status: string;
  }>;
}

export interface EmergencyContact {
  id?: string;
  team_member_id?: string;
  contact_name: string;
  phone: string;
  relationship: string;
}

export interface Certification {
  id?: string;
  team_member_id?: string;
  certification_name: string;
  issue_date?: string;
  expiry_date?: string;
}

export interface Skill {
  id?: string;
  team_member_id?: string;
  skill_name: string;
  proficiency_level?: string;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Record<string, any>;
  createdAt: string;
  updatedAt: string;
  priority: number; // Added priority field for role ordering
}

export interface RoleManagement {
  roles: Role[];
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Role;
  updateRole: (id: string, data: Partial<Role>) => Role | null;
  deleteRole: (id: string) => boolean;
  getRoleById: (id: string) => Role | null;
  getRoleByName: (name: string) => Role | null;
}

export interface TechnicianStatusChange {
  id: string;
  technicianId: string;
  previousStatus: string;
  newStatus: string;
  changeDate: string;
  changeReason?: string;
  changedBy: string;
}

export interface FlaggedActivity {
  id: string;
  technicianId: string;
  activityId: string;
  activityType: string;
  flaggedDate: string;
  flaggedBy: string;
  flagReason: string;
  resolved: boolean;
  resolvedDate?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
