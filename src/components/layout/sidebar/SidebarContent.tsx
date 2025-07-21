
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useNavigationWithRoles } from '@/hooks/useNavigation';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getIconComponent } from '@/utils/iconMapper';
import { hasRoutePermission } from '@/utils/routeGuards';
import { SidebarLogo } from './SidebarLogo';
import { navigation } from './navigation';

export function SidebarContent() {
  const location = useLocation();
  const { setIsOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { data: userRoles = [] } = useUserRoles();
  const dbNavigation = useNavigationWithRoles(userRoles);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Filter navigation items based on user permissions
  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => hasRoutePermission(item.href, userRoles))
  })).filter(section => section.items.length > 0);

  // Use database navigation if available, otherwise use filtered static navigation
  const activeNavigation = dbNavigation.length > 0 ? dbNavigation : filteredNavigation;

  return (
    <div className="flex h-full flex-col bg-indigo-700">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6">
        <SidebarLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-2 py-4 overflow-y-auto">
        {activeNavigation.map((section) => (
          <div key={section.id || section.title} className="mb-4">
            <h3 className="px-3 text-xs font-semibold text-indigo-200 uppercase tracking-wider mb-2">
              {section.title}
            </h3>
            <div className="space-y-1">
              {section.items.map((item) => {
                const isActive = location.pathname === item.href || 
                  (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                
                const IconComponent = getIconComponent(item.icon);
                
                return (
                  <Link
                    key={item.id || item.href}
                    to={item.href}
                    onClick={handleLinkClick}
                    className={cn(
                      'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
                      isActive
                        ? 'bg-indigo-800 text-white'
                        : 'text-indigo-100 hover:bg-indigo-600 hover:text-white'
                    )}
                    title={item.description || item.title}
                  >
                    <IconComponent
                      className={cn(
                        'mr-3 h-5 w-5 flex-shrink-0',
                        isActive ? 'text-white' : 'text-indigo-300 group-hover:text-white'
                      )}
                    />
                    {item.title}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </nav>
    </div>
  );
}
