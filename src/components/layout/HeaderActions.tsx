
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthUser } from '@/hooks/useAuthUser';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { 
  LogOut, 
  User, 
  Plus, 
  FileText, 
  Receipt, 
  Wrench,
  Calendar,
  Settings as SettingsIcon,
  UserCircle,
  BarChart3,
  Users,
  Brain,
  AlertCircle,
  ClipboardList
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';
import { useUserRoles } from '@/hooks/useUserRoles';
import { hasRoutePermission } from '@/utils/routeGuards';
import { cleanupAuthState } from '@/utils/authCleanup';

export function HeaderActions() {
  const { isAuthenticated, userName, isLoading } = useAuthUser();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const { data: userRoles = [] } = useUserRoles();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      console.log('Initiating sign out...');
      
      // Clean up auth state first
      cleanupAuthState();
      
      // Attempt global sign out
      try {
        await supabase.auth.signOut({ scope: 'global' });
      } catch (err) {
        console.log('Global signout error (ignoring):', err);
      }
      
      // Force page reload for clean state
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
      // Even if there's an error, redirect to login
      window.location.href = '/login';
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center space-x-4">
        <div className="h-8 w-8 bg-gray-200 rounded-full animate-pulse" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="flex items-center space-x-4">
        <Button variant="ghost" onClick={() => navigate('/login')}>
          Sign In
        </Button>
      </div>
    );
  }

  const getRoleBadgeVariant = (role: string) => {
    switch (role.toLowerCase()) {
      case 'owner':
        return 'default';
      case 'admin':
      case 'administrator':
        return 'destructive';
      case 'manager':
        return 'secondary';
      case 'technician':
        return 'outline';
      case 'customer':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const displayRole = userRole?.displayName || userRole?.name || 'User';

  return (
    <div className="flex items-center space-x-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center space-x-2 h-auto py-2">
            <User className="h-4 w-4" />
            <div className="flex flex-col items-start">
              <span className="text-sm font-medium">{userName || 'User'}</span>
              {!roleLoading && (
                <Badge 
                  variant={getRoleBadgeVariant(displayRole)} 
                  className="text-xs h-4 px-1"
                >
                  {displayRole}
                </Badge>
              )}
            </div>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-64">
          <DropdownMenuLabel>
            <div className="flex flex-col">
              <span>My Account</span>
              {!roleLoading && (
                <span className="text-xs text-muted-foreground font-normal">
                  Role: {displayRole}
                </span>
              )}
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Quick Actions */}
          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Quick Actions
            </DropdownMenuLabel>
            {hasRoutePermission('/work-orders', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/work-orders/new')}>
                <Plus className="mr-2 h-4 w-4" />
                Create Work Order
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/quotes', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/quotes/new')}>
                <FileText className="mr-2 h-4 w-4" />
                Create Quote
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/invoices', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/invoices/new')}>
                <Receipt className="mr-2 h-4 w-4" />
                Create Invoice
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/calendar', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/calendar')}>
                <Calendar className="mr-2 h-4 w-4" />
                Schedule Appointment
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/maintenance-requests', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/maintenance-requests')}>
                <AlertCircle className="mr-2 h-4 w-4" />
                Maintenance Request
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/equipment-tracking', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/daily-logs')}>
                <ClipboardList className="mr-2 h-4 w-4" />
                Daily Logs
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          
          {/* Navigation Links */}
          <DropdownMenuGroup>
            <DropdownMenuItem onClick={() => navigate('/profile')}>
              <UserCircle className="mr-2 h-4 w-4" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigate('/settings')}>
              <SettingsIcon className="mr-2 h-4 w-4" />
              Settings
            </DropdownMenuItem>
            {hasRoutePermission('/developer', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/developer')}>
                <Brain className="mr-2 h-4 w-4" />
                AI Hub
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/reports', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/reports')}>
                <BarChart3 className="mr-2 h-4 w-4" />
                Reports
              </DropdownMenuItem>
            )}
            {hasRoutePermission('/team', userRoles) && (
              <DropdownMenuItem onClick={() => navigate('/team')}>
                <Users className="mr-2 h-4 w-4" />
                Team
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>
          
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleSignOut}>
            <LogOut className="mr-2 h-4 w-4" />
            Sign Out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}
