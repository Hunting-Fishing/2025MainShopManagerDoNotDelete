
export interface TeamMember {
  id: string;
  name: string;
  role: string;
  email: string;
  phone: string;
  jobTitle: string;
  department: string;
  status: "Active" | "Inactive";
  workOrders: {
    assigned: number;
    completed: number;
  };
  permissions?: Record<string, any>; // Optional permissions for custom roles
  notes?: string;
  joinDate?: string;
  lastActive?: string;
  recentActivity?: Array<{
    type: string;
    date: string;
    description: string;
  }>;
}

// Additional interfaces for team management
export interface Role {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  permissions: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

// Unified interface for role management
export interface RoleManagement {
  roles: Role[];
  addRole: (role: Omit<Role, 'id' | 'createdAt' | 'updatedAt'>) => Role;
  updateRole: (id: string, data: Partial<Role>) => Role | null;
  deleteRole: (id: string) => boolean;
  getRoleById: (id: string) => Role | null;
  getRoleByName: (name: string) => Role | null;
}
