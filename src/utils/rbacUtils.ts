
import { useAuth } from "@/hooks/useAuth";
import React from "react";

// Define the possible permissions
export type Permission = 
  | "customer.view"
  | "customer.create"
  | "customer.edit"
  | "customer.delete"
  | "vehicle.view"
  | "vehicle.create"
  | "vehicle.edit"
  | "vehicle.delete";

// Define role-based permissions
const rolePermissions: Record<string, Permission[]> = {
  admin: [
    "customer.view", "customer.create", "customer.edit", "customer.delete",
    "vehicle.view", "vehicle.create", "vehicle.edit", "vehicle.delete"
  ],
  manager: [
    "customer.view", "customer.create", "customer.edit",
    "vehicle.view", "vehicle.create", "vehicle.edit" 
  ],
  technician: [
    "customer.view",
    "vehicle.view"
  ],
  serviceAdvisor: [
    "customer.view", "customer.create", "customer.edit",
    "vehicle.view", "vehicle.create", "vehicle.edit"
  ]
};

// Hook to check permissions
export function usePermission(permission: Permission): boolean {
  const { user } = useAuth();
  
  if (!user) return false;
  
  // Super admin has all permissions
  if (user.role === "admin") return true;
  
  // Check if the user's role has the required permission
  const userPermissions = rolePermissions[user.role] || [];
  return userPermissions.includes(permission);
}

// Component guard for permission-based access
export function withPermission<P extends object>(
  Component: React.ComponentType<P>, 
  requiredPermission: Permission
): React.FC<P> {
  return function ProtectedComponent(props: P) {
    const hasPermission = usePermission(requiredPermission);
    
    if (!hasPermission) {
      return <div className="text-center p-8">You do not have permission to access this feature.</div>;
    }
    
    return <Component {...props} />;
  };
}
