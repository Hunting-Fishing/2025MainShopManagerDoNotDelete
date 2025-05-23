import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command, LogOut } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell, Settings } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AddNotificationDemo } from '@/components/notifications/AddNotificationDemo';
import { supabase } from '@/lib/supabase';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { useAuthUser } from '@/hooks/useAuthUser';

interface HeaderActionsProps {
  onOpenCommandMenu: () => void;
}

export function HeaderActions({ onOpenCommandMenu }: HeaderActionsProps) {
  return (
    <div className="flex items-center gap-4">
      <Button 
        variant="outline" 
        size="sm" 
        className="text-sm flex items-center gap-1"
        onClick={onOpenCommandMenu}
      >
        <Command className="h-3.5 w-3.5" />
        <span>Command</span>
        <kbd className="ml-1 text-xs bg-slate-100 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
      </Button>
    
      <AddNotificationDemo />
      <NotificationBell />

      <UserMenu />
    </div>
  );
}

export function UserMenu() {
  const navigate = useNavigate();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const { userName, isAuthenticated, isLoading } = useAuthUser();
  
  // Get initials from the user name
  const getInitials = (name: string): string => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  const userInitials = getInitials(userName);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      
      // Clean up any auth-related storage to prevent auth limbo
      localStorage.removeItem('supabase.auth.token');
      // Remove all Supabase auth keys from localStorage
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          localStorage.removeItem(key);
        }
      });
      // Remove from sessionStorage if in use
      Object.keys(sessionStorage || {}).forEach((key) => {
        if (key.startsWith('supabase.auth.') || key.includes('sb-')) {
          sessionStorage.removeItem(key);
        }
      });
      
      await supabase.auth.signOut({ scope: 'global' });
      
      toast({
        title: "Logged out",
        description: "You have been successfully logged out.",
      });
      
      // Navigate to login page with replace to prevent going back
      navigate('/login', { replace: true });
      
    } catch (error) {
      console.error('Error logging out:', error);
      toast({
        title: "Logout failed",
        description: "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <Button variant="ghost" className="relative h-10 w-10 rounded-full">
        <Avatar className="h-10 w-10">
          <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">...</AvatarFallback>
        </Avatar>
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt={userName || "User"} />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">{userInitials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">{userName || "User"}</p>
            <p className="text-xs text-slate-500">{isAuthenticated ? "Logged in" : "Not logged in"}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex cursor-pointer items-center">
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/reminders" className="flex cursor-pointer items-center">
            <Bell className="mr-2 h-4 w-4" />
            <span>Notifications</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to="/settings" className="flex cursor-pointer items-center">
            <Settings className="mr-2 h-4 w-4" />
            <span>Settings</span>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} disabled={isLoggingOut} className="cursor-pointer text-red-600">
          <LogOut className="mr-2 h-4 w-4" />
          <span>{isLoggingOut ? "Logging out..." : "Log out"}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
