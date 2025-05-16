
export interface StaffMember {
  id: string;
  name: string;
  role?: string;
  email?: string;
  phone?: string;
  department?: string;
  status?: 'active' | 'inactive' | 'on_leave';
}

export interface StaffRole {
  id: string;
  name: string;
  permissions?: string[];
}

export interface StaffDepartment {
  id: string;
  name: string;
  description?: string;
}
