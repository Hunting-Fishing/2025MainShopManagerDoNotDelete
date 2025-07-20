
import React, { useState } from "react";
import { Bell, Search, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNotifications } from "@/context/notifications";
import { NotificationsDropdown } from "@/components/notifications/NotificationsDropdown";
import { useIsMobile } from "@/hooks/use-mobile";
import { HeaderSidebarToggle } from "./HeaderSidebarToggle";
import { HeaderActions } from "./HeaderActions";

interface HeaderProps {
  onMenuClick?: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { unreadCount } = useNotifications();
  const [searchOpen, setSearchOpen] = useState(false);
  const isMobile = useIsMobile();

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-white dark:bg-slate-800 dark:border-slate-700 px-4 print:hidden">
      <div className="flex items-center gap-2">
        <HeaderSidebarToggle onClick={onMenuClick} />
        
        {/* Search shown differently on mobile vs desktop */}
        {isMobile ? (
          searchOpen ? (
            <div className="absolute inset-0 bg-white dark:bg-slate-800 z-20 flex items-center px-4">
              <input
                type="text"
                placeholder="Search..."
                className="h-9 w-full rounded-md border border-input bg-background dark:bg-slate-700 dark:text-slate-100 px-4 text-sm"
                autoFocus
              />
              <Button 
                variant="ghost" 
                size="icon" 
                className="ml-2"
                onClick={() => setSearchOpen(false)}
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          ) : (
            <Button variant="ghost" size="icon" onClick={() => setSearchOpen(true)}>
              <Search className="h-5 w-5" />
            </Button>
          )
        ) : (
          <div className="relative w-64 lg:w-80">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search..."
              className="h-9 w-full rounded-md border border-input bg-background dark:bg-slate-700 dark:text-slate-100 pl-8 pr-4 text-sm"
            />
          </div>
        )}
      </div>
      <div className="flex items-center gap-2">
        <NotificationsDropdown>
          <Button 
            variant="ghost" 
            size="icon" 
            className="relative"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                {unreadCount}
              </span>
            )}
          </Button>
        </NotificationsDropdown>
        <HeaderActions />
      </div>
    </header>
  );
}
