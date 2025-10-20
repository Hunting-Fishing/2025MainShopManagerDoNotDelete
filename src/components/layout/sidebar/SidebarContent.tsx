
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { getIconComponent } from '@/utils/iconMapper';
import { hasRoutePermission } from '@/utils/routeGuards';
import { getSectionColorScheme } from '@/utils/sectionColors';
import { SidebarLogo } from './SidebarLogo';
import { navigation } from './navigation';

export function SidebarContent() {
  const location = useLocation();
  const { setIsOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { data: userRoles = [] } = useUserRoles();

  const handleLinkClick = (href: string) => {
    console.log('🔗 Sidebar navigation clicked:', href);
    console.log('📍 Current location:', location.pathname);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  // Use only static navigation - no more database sync issues
  const filteredNavigation = navigation.map(section => ({
    ...section,
    items: section.items.filter(item => hasRoutePermission(item.href, userRoles))
  })).filter(section => section.items.length > 0);

  return (
    <div className="flex h-full flex-col bg-white border-r border-gray-200">
      {/* Logo */}
      <div className="flex h-16 items-center justify-center px-6 bg-gradient-to-r from-indigo-600 to-indigo-700 border-b border-indigo-800">
        <SidebarLogo />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-2 overflow-y-auto">
        {filteredNavigation.map((section) => {
          const colorScheme = getSectionColorScheme(section.title);
          
          return (
            <div key={section.title} className={cn(
              "mb-3 rounded-lg border transition-all duration-200",
              colorScheme.background,
              colorScheme.border
            )}>
              {/* Section Header */}
              <div className={cn(
                "px-3 py-2 rounded-t-lg border-b",
                colorScheme.header,
                colorScheme.border
              )}>
                <h3 className={cn(
                  "text-xs font-semibold uppercase tracking-wider",
                  colorScheme.headerText
                )}>
                  {section.title}
                </h3>
              </div>
              
              {/* Section Items */}
              <div className="p-2 space-y-1">
                {section.items.map((item) => {
                  const isActive = location.pathname === item.href || 
                    (item.href !== '/dashboard' && location.pathname.startsWith(item.href));
                  
                  const IconComponent = item.icon;
                  
                  return (
                    <Link
                      key={item.href}
                      to={item.href}
                      onClick={() => handleLinkClick(item.href)}
                      className={cn(
                        'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150',
                        isActive
                          ? colorScheme.active + ' shadow-sm font-semibold'
                          : colorScheme.text + ' ' + colorScheme.hover
                      )}
                      title={item.description || item.title}
                    >
                      <IconComponent
                        className={cn(
                          'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                          isActive 
                            ? colorScheme.icon.replace('text-', 'text-') + ' opacity-100'
                            : colorScheme.icon + ' opacity-75 group-hover:opacity-100'
                        )}
                      />
                      {item.title}
                    </Link>
                  );
                })}
              </div>
            </div>
          );
        })}
      </nav>
    </div>
  );
}
