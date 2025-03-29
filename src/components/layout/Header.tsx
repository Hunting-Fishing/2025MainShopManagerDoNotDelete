
import React from "react";
import { Button } from "@/components/ui/button";
import { Menu, Bell, Search } from "lucide-react";
import { useSidebar } from "@/components/ui/sidebar";
import { useNotifications } from "@/context/notifications";

export function Header() {
  const { toggleCollapsed } = useSidebar();
  const { unreadCount, showNotifications } = useNotifications();

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-white px-4">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleCollapsed}>
          <Menu className="h-5 w-5" />
        </Button>
        <div className="relative w-64 lg:w-80">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search..."
            className="h-9 w-full rounded-md border border-input bg-background pl-8 pr-4 text-sm"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <Button 
          variant="ghost" 
          size="icon" 
          className="relative"
          onClick={showNotifications}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs text-white">
              {unreadCount}
            </span>
          )}
        </Button>
        <div className="h-8 w-8 rounded-full bg-slate-200" />
      </div>
    </header>
  );
}
