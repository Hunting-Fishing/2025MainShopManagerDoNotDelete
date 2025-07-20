
import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useAuthUser } from '@/hooks/useAuthUser';
import { useUserRole } from '@/hooks/useUserRole';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { MainNavigation } from './MainNavigation';
import {
  User,
  LogOut,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface SidebarProps {
  onClose?: () => void;
}

export function AppSidebar({ onClose }: SidebarProps) {
  const { user, isAuthenticated } = useAuthUser();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Logged out",
        description: "You have been successfully logged out."
      });
      navigate('/auth');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive"
      });
    }
  };

  const getUserDisplayName = () => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split('@')[0];
    return 'User';
  };

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

  if (!isAuthenticated) {
    return null;
  }

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">AutoShop Pro</h2>
          <p className="text-sm text-gray-500">Management System</p>
        </div>
        {onClose && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="lg:hidden"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* User Profile Section */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center space-x-3">
          <div className="h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-medium">
            <User className="h-5 w-5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900 truncate">
              {getUserDisplayName()}
            </p>
            {!roleLoading && userRole && (
              <Badge 
                variant={getRoleBadgeVariant(userRole.displayName)} 
                className="text-xs mt-1"
              >
                {userRole.displayName}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Navigation */}
      <MainNavigation />

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <Button
          onClick={handleLogout}
          variant="ghost"
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
        >
          <LogOut className="mr-3 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}
