
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Command } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { User, Bell } from 'lucide-react';
import { NotificationBell } from '@/components/notifications/NotificationBell';
import { AddNotificationDemo } from '@/components/notifications/AddNotificationDemo';

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

function UserMenu() {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-10 w-10 rounded-full">
          <Avatar className="h-10 w-10">
            <AvatarImage src="" alt="User" />
            <AvatarFallback className="bg-esm-blue-100 text-esm-blue-700">JD</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium">John Doe</p>
            <p className="text-xs text-slate-500">admin@easyshopmanager.com</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          <User className="mr-2 h-4 w-4" />
          <span>Profile</span>
        </DropdownMenuItem>
        <DropdownMenuItem>
          <Bell className="mr-2 h-4 w-4" />
          <span>Notifications</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
