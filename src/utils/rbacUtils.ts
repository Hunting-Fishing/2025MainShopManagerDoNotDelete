
import { useEffect, useState, FunctionComponent, ComponentType } from 'react';
import { useAuth } from '@/hooks/useAuth';

// Permission types
export type ResourceType = 'customer' | 'workOrder' | 'inventory' | 'invoice' | 'report' | 'settings';
export type ActionType = 'view' | 'create' | 'update' | 'delete' | 'approve';

// Permission structure
export interface Permission {
  resource: ResourceType;
  action: ActionType;
  description?: string;
}

// Role-based permissions
export const PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    { resource: 'customer', action: 'view', description: 'View customer data' },
    { resource: 'customer', action: 'create', description: 'Create customer data' },
    { resource: 'customer', action: 'update', description: 'Update customer data' },
    { resource: 'customer', action: 'delete', description: 'Delete customer data' },
    { resource: 'workOrder', action: 'view', description: 'View work orders' },
    { resource: 'workOrder', action: 'create', description: 'Create work orders' },
    { resource: 'workOrder', action: 'update', description: 'Update work orders' },
    { resource: 'workOrder', action: 'delete', description: 'Delete work orders' },
    { resource: 'workOrder', action: 'approve', description: 'Approve work orders' },
  ],
  user: [
    { resource: 'customer', action: 'view', description: 'View customer data' },
    { resource: 'workOrder', action: 'view', description: 'View work orders' },
    { resource: 'workOrder', action: 'create', description: 'Create work orders' },
  ],
  guest: [
    { resource: 'customer', action: 'view', description: 'View customer data' },
  ]
};

/**
 * Hook to check user permissions
 */
export const usePermission = () => {
  const { user, userRole } = useAuth();
  const [permissions, setPermissions] = useState<Permission[]>([]);

  useEffect(() => {
    if (user && userRole && PERMISSIONS[userRole]) {
      setPermissions(PERMISSIONS[userRole]);
    } else {
      setPermissions(PERMISSIONS.guest || []);
    }
  }, [user, userRole]);

  // Check if user has permission for a specific resource and action
  const hasPermission = (resource: ResourceType, action: ActionType): boolean => {
    return permissions.some(permission => 
      permission.resource === resource && permission.action === action
    );
  };

  return { permissions, hasPermission };
};

/**
 * HOC to protect components based on permissions
 */
export const withPermission = <P extends object>(
  WrappedComponent: ComponentType<P>,
  resource: ResourceType,
  action: ActionType,
  FallbackComponent?: ComponentType<{}>
): React.FC<P> => {  // Explicit return type added
  const WithPermissionComponent: React.FC<P> = (props) => {
    const { hasPermission } = usePermission();
    const allowed = hasPermission(resource, action);

    if (!allowed && FallbackComponent) {
      return <FallbackComponent />;
    }

    if (!allowed) {
      return null;
    }

    return <WrappedComponent {...props} />;
  };

  return WithPermissionComponent;
};
