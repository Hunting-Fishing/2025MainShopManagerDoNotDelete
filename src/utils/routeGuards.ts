
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
  { path: '/settings/role-permissions', requireAdmin: true },
  { path: '/settings/user-permissions', requireAdmin: true },
  { path: '/settings/navigation', allowedRoles: ['owner', 'manager'] },
  { path: '/reports', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/forms', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/ai-hub', allowedRoles: ['admin', 'manager', 'owner'] },
  
  // Marketing and Communications
  { path: '/email-campaigns', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/email-sequences', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/email-templates', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/sms-management', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/sms-templates', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/customer-comms', allowedRoles: ['admin', 'manager', 'service_advisor', 'reception', 'owner'] },
  
  // Staff accessible routes
  { path: '/work-orders', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'owner'] },
  { path: '/customers', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner'] },
  { path: '/calendar', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'reception', 'owner'] },
  { path: '/analytics', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/chat', allowedRoles: ['admin', 'manager', 'service_advisor', 'reception', 'owner'] },
  
  // Inventory Management
  { path: '/inventory', allowedRoles: ['admin', 'manager', 'technician', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/manager', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/add', allowedRoles: ['admin', 'manager', 'technician', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/categories', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/suppliers', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/locations', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/orders', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory/item', allowedRoles: ['admin', 'manager', 'technician', 'inventory_manager', 'parts_manager', 'owner'] },
  { path: '/inventory-analytics', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/inventory-manager', allowedRoles: ['admin', 'manager', 'inventory_manager', 'parts_manager', 'owner'] },
  
  // Operations
  { path: '/quotes', allowedRoles: ['admin', 'manager', 'service_advisor', 'owner'] },
  { path: '/invoices', allowedRoles: ['admin', 'manager', 'service_advisor', 'reception', 'owner'] },
  { path: '/payments', allowedRoles: ['admin', 'manager', 'service_advisor', 'reception', 'owner'] },
  
  // Equipment Management
  { path: '/equipment-management', allowedRoles: ['admin', 'manager', 'technician', 'deckhand', 'captain', 'mate', 'chief_engineer', 'marine_engineer', 'owner'] },
  { path: '/equipment', allowedRoles: ['admin', 'manager', 'technician', 'deckhand', 'captain', 'mate', 'chief_engineer', 'marine_engineer', 'owner'] },
  { path: '/equipment-tracking', allowedRoles: ['admin', 'manager', 'technician', 'deckhand', 'captain', 'mate', 'chief_engineer', 'marine_engineer', 'owner'] },
  { path: '/fleet-management', allowedRoles: ['admin', 'manager', 'captain', 'owner'] },
  { path: '/maintenance-requests', allowedRoles: ['admin', 'manager', 'technician', 'deckhand', 'captain', 'mate', 'chief_engineer', 'marine_engineer', 'owner'] },
  { path: '/maintenance-planning', allowedRoles: ['admin', 'manager', 'captain', 'owner'] },
  { path: '/service-packages', allowedRoles: ['admin', 'manager', 'owner'] },
  { path: '/vehicles', allowedRoles: ['admin', 'manager', 'technician', 'service_advisor', 'owner'] },
  
  // Public staff routes (all authenticated users)
  { path: '/dashboard', allowedRoles: [] }, // No specific roles required
  { path: '/help', allowedRoles: [] },
  { path: '/service-reminders', allowedRoles: [] },
  { path: '/profile', allowedRoles: [] },
  { path: '/notifications', allowedRoles: [] },
  { path: '/timesheet', allowedRoles: [] },
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
