
import { useUserRoles } from '@/hooks/useUserRoles';

export interface RoutePermission {
  path: string;
  allowedRoles?: string[];
  requireOwner?: boolean;
  requireAdmin?: boolean;
}

export const routePermissions: RoutePermission[] = [
  // Admin/Developer only routes
  { path: '/developer', requireAdmin: true },
  { path: '/security', requireAdmin: true },
  
  // Manager/Admin routes
  { path: '/team', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/company-profile', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/settings', allowedRoles: ['admin', 'manager', 'owner'] },
  
  // Staff accessible routes
  { path: '/work-orders', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'owner'] },
  { path: '/customers', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner'] },
  { path: '/calendar', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner'] },
  { path: '/inventory', allowedRoles: ['admin', 'manager', 'technician', 'inventory_manager', 'owner'] },
  { path: '/quotes', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/invoices', allowedRoles: ['admin', 'manager', 'service_advisor', 'reception', 'owner'] },
  
  // Public staff routes (all authenticated users)
  { path: '/dashboard', allowedRoles: [] }, // No specific roles required
  { path: '/help', allowedRoles: [] },
  { path: '/service-reminders', allowedRoles: [] },
  { path: '/customer-comms', allowedRoles: [] },
];

export function hasRoutePermission(path: string, userRoles: string[]): boolean {
  const permission = routePermissions.find(p => path.startsWith(p.path));
  
  if (!permission) {
    return true; // No specific permission required
  }
  
  // Check if user has required roles
  if (permission.allowedRoles && permission.allowedRoles.length > 0) {
    return permission.allowedRoles.some(role => userRoles.includes(role));
  }
  
  // Check owner/admin requirements
  if (permission.requireOwner) {
    return userRoles.includes('owner');
  }
  
  if (permission.requireAdmin) {
    return userRoles.includes('admin') || userRoles.includes('owner');
  }
  
  return true;
}

export function useRoutePermission(path: string) {
  const { data: userRoles = [] } = useUserRoles();
  return hasRoutePermission(path, userRoles);
}
