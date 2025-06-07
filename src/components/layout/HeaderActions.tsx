
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAuthUser } from '@/hooks/useAuthUser';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LogOut, User } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useUserRole } from '@/hooks/useUserRole';

export function HeaderActions() {
  const { isAuthenticated, userName, isLoading } = useAuthUser();
  const { userRole, isLoading: roleLoading } = useUserRole();
  const navigate = useNavigate();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      navigate('/login');
    } catch (error) {
      console.error('Error signing out:', error);
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
        <DropdownMenuContent align="end">
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
          <DropdownMenuItem onClick={() => navigate('/settings')}>
            Settings
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => navigate('/profile')}>
            Profile
          </DropdownMenuItem>
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
