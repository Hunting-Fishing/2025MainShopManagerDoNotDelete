
import { Permission } from "@/utils/rbacUtils";

export interface UserRole {
  id: string;
  name: string;
  permissions: Permission[];
}

export interface AuthUser {
  id: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  roles?: UserRole[];
  isEmailVerified?: boolean;
  lastLogin?: string;
}

export interface AuthSession {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  hasPermission: (permission: Permission) => boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => Promise<void>;
}
