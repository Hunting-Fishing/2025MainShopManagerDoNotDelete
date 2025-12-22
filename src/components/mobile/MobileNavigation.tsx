import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Calendar,
  CalendarDays,
  ChevronRight,
  FileText,
  Home,
  MoreHorizontal,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWorkOrdersCount } from '@/hooks/useWorkOrdersCount';
import { useNotifications } from '@/hooks/useNotifications';
import { useUserRoles } from '@/hooks/useUserRoles';
import { hasRoutePermission } from '@/utils/routeGuards';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { ScrollArea } from '@/components/ui/scroll-area';
import { getNavigationForSurface } from '@/components/navigation/appNavigation';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

interface MoreMenuItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  description?: string;
}

interface MoreMenuSection {
  title: string;
  items: MoreMenuItem[];
}

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCount } = useWorkOrdersCount();
  const { unreadCount } = useNotifications();
  const { data: userRoles = [] } = useUserRoles();
  const [moreOpen, setMoreOpen] = useState(false);

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'daily-logs',
      label: 'Logs',
      icon: FileText,
      path: '/daily-logs'
    },
    {
      id: 'calendar',
      label: 'Service',
      icon: Calendar,
      path: '/calendar'
    },
    {
      id: 'staff-scheduling',
      label: 'Staff',
      icon: CalendarDays,
      path: '/scheduling'
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      path: ''
    }
  ];

  const makeId = (value: string) =>
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'item';

  const moreMenuSections: MoreMenuSection[] = getNavigationForSurface('mobileMenu')
    .map((section) => ({
      title: section.title,
      items: section.items
        .filter((item) => hasRoutePermission(item.href, userRoles))
        .map((item) => ({
          id: makeId(item.href || item.title),
          label: item.title,
          icon: item.icon,
          path: item.href,
          description: item.description,
        })),
    }))
    .filter((section) => section.items.length > 0);

  const handleNavigation = (path: string) => {
    if (path) {
      navigate(path);
      setMoreOpen(false);
    }
  };

  const isActive = (path: string) => {
    if (path === '/dashboard') {
      return location.pathname === '/' || location.pathname === '/dashboard';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border safe-area-bottom">
      <div className="flex items-center justify-around h-16 px-2">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = item.path ? isActive(item.path) : false;
          
          if (item.id === 'more') {
            return (
              <Sheet key={item.id} open={moreOpen} onOpenChange={setMoreOpen}>
                <SheetTrigger asChild>
                  <button
                    className={cn(
                      "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 transition-colors relative",
                      moreOpen 
                        ? "text-primary" 
                        : "text-muted-foreground hover:text-foreground"
                    )}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5 mb-1" />
                      {unreadCount > 0 && (
                        <Badge 
                          variant="destructive" 
                          className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                        >
                          {unreadCount > 99 ? '99+' : unreadCount}
                        </Badge>
                      )}
                    </div>
                    <span className="text-xs font-medium truncate max-w-full">
                      {item.label}
                    </span>
                  </button>
                </SheetTrigger>
                <SheetContent side="bottom" className="h-[85vh] rounded-t-xl">
                  <SheetHeader className="pb-4 border-b">
                    <SheetTitle>More Options</SheetTitle>
                  </SheetHeader>
                  <ScrollArea className="h-full pb-20">
                    <div className="py-4 space-y-6">
                      {moreMenuSections.map((section) => (
                        <div key={section.title}>
                          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-2 mb-2">
                            {section.title}
                          </h3>
                          <div className="space-y-1">
                            {section.items.map((menuItem) => {
                              const MenuIcon = menuItem.icon;
                              const isMenuActive = isActive(menuItem.path);
                              
                              return (
                                <button
                                  key={menuItem.id}
                                  onClick={() => handleNavigation(menuItem.path)}
                                  className={cn(
                                    "w-full flex items-center gap-3 px-3 py-3 rounded-lg transition-colors",
                                    isMenuActive 
                                      ? "bg-primary/10 text-primary" 
                                      : "hover:bg-muted"
                                  )}
                                >
                                  <MenuIcon className="h-5 w-5 flex-shrink-0" />
                                  <div className="flex-1 text-left">
                                    <div className="font-medium">{menuItem.label}</div>
                                    {menuItem.description && (
                                      <div className="text-xs text-muted-foreground">
                                        {menuItem.description}
                                      </div>
                                    )}
                                  </div>
                                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                </SheetContent>
              </Sheet>
            );
          }
          
          return (
            <button
              key={item.id}
              onClick={() => handleNavigation(item.path)}
              className={cn(
                "flex flex-col items-center justify-center min-w-0 flex-1 py-1 px-1 transition-colors relative",
                active 
                  ? "text-primary" 
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <div className="relative">
                <Icon 
                  className={cn(
                    "h-5 w-5 mb-1",
                    active && "text-primary"
                  )} 
                />
                {item.badge && item.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-4 w-4 p-0 flex items-center justify-center text-xs"
                  >
                    {item.badge > 99 ? '99+' : item.badge}
                  </Badge>
                )}
              </div>
              <span className={cn(
                "text-xs font-medium truncate max-w-full",
                active && "text-primary"
              )}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
