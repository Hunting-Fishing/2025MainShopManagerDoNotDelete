import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  Users, 
  Package, 
  Calendar,
  MoreHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { useWorkOrdersCount } from '@/hooks/useWorkOrdersCount';
import { useNotifications } from '@/hooks/useNotifications';

interface NavItem {
  id: string;
  label: string;
  icon: React.ElementType;
  path: string;
  badge?: number;
}

export function MobileNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  const { activeCount } = useWorkOrdersCount();
  const { unreadCount } = useNotifications();

  const navItems: NavItem[] = [
    {
      id: 'dashboard',
      label: 'Home',
      icon: Home,
      path: '/dashboard'
    },
    {
      id: 'work-orders',
      label: 'Orders',
      icon: ClipboardList,
      path: '/work-orders',
      badge: activeCount
    },
    {
      id: 'equipment',
      label: 'Equipment',
      icon: Package,
      path: '/equipment-management'
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: Users,
      path: '/customers'
    },
    {
      id: 'more',
      label: 'More',
      icon: MoreHorizontal,
      path: '/settings'
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
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
          const active = isActive(item.path);
          
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