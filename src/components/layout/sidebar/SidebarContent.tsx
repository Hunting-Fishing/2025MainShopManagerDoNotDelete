import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';
import { useUserRoles } from '@/hooks/useUserRoles';
import { useAllUserRoles } from '@/hooks/useAllUserRoles';
import { useModulePermissions } from '@/hooks/useModulePermissions';
import { hasRoutePermission } from '@/utils/routeGuards';
import { getSectionColorScheme } from '@/utils/sectionColors';
import { SidebarLogo } from './SidebarLogo';
import { ModuleIndicator } from './ModuleIndicator';
import { ModuleSections } from './ModuleSections';
import { navigation, NavigationItem } from './navigation';
import { useSidebarVisibility } from '@/hooks/useSidebarVisibility';
import { LayoutGrid, Code } from 'lucide-react';

export function SidebarContent() {
  const location = useLocation();
  const { setIsOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { data: userRoles = [] } = useUserRoles();
  const { data: allRoles = [] } = useAllUserRoles();
  const isPlatformDeveloper = allRoles.some(r => r.source === 'developer');
  const { data: modulePermissions = {}, isLoading: permissionsLoading } = useModulePermissions();
  const { isVisible } = useSidebarVisibility();

  const handleLinkClick = (href: string) => {
    console.log('🔗 Sidebar navigation clicked:', href);
    console.log('📍 Current location:', location.pathname);
    if (isMobile) {
      setIsOpen(false);
    }
  };

  /**
   * Check if user has view permission for a navigation item
   * - If no permissionModule is specified, item is accessible to all
   * - If permissionModule is specified, check if user has view permission for that module
   * Note: Owner role gets full access via the get_user_effective_permissions RPC
   */
  const hasModuleViewPermission = (item: NavigationItem): boolean => {
    // If no permission module specified, allow access
    if (!item.permissionModule) {
      return true;
    }
    
    // While loading, hide items that require permissions to prevent flash of unauthorized content
    if (permissionsLoading) {
      return false;
    }
    
    // Check if user has view permission for this module
    const permission = modulePermissions[item.permissionModule];
    return permission?.view === true;
  };

  // Check if we're currently in a module route (e.g., /gunsmith/*, /automotive/*)
  const moduleRoutePatterns = ['/gunsmith', '/automotive', '/powersports', '/marine-services', '/power-washing', '/water-delivery', '/fuel-delivery', '/septic', '/personal-trainer', '/export', '/welding', '/game-development'];
  const isInModuleRoute = moduleRoutePatterns.some(pattern => 
    location.pathname === pattern || location.pathname.startsWith(pattern + '/')
  );

  // Check if we're on the module hub page
  const isOnModuleHub = location.pathname === '/module-hub';

  // Filter navigation based on:
  // 1. Hide entirely when inside a module or on module hub (module sections handle navigation)
  // 2. Shop-level visibility settings (hidden sections)
  // 3. Role-based section visibility
  // 4. Module-based view permissions for individual items
  // 5. Route-based role permissions (fallback)
  const filteredNavigation = (isInModuleRoute || isOnModuleHub) ? [] : navigation
    .filter(section => isVisible(section.title)) // Check shop-level and role-based visibility
    .map(section => ({
      ...section,
      items: section.items.filter(item => {
        // First check module-based permissions (primary check)
        if (!hasModuleViewPermission(item)) {
          return false;
        }
        // Then check route-based role permissions (secondary check)
        return hasRoutePermission(item.href, userRoles);
      })
    }))
    .filter(section => section.items.length > 0);

  return (
    <div className="flex h-full flex-col text-slate-100">
      {/* Logo */}
      <div className="relative flex h-16 items-center justify-center px-6 border-b border-white/10 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-indigo-500 to-violet-600" />
        <div className="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-orange-500/30 blur-2xl" />
        <div className="absolute -bottom-8 -left-8 h-24 w-24 rounded-full bg-indigo-400/30 blur-2xl" />
        <div className="relative z-10">
          <SidebarLogo />
        </div>
      </div>

      {/* Active Module Indicator */}
      <div className="py-3 border-b border-white/5 bg-slate-900/40">
        <ModuleIndicator />
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-2 p-3 overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent">
        {/* Module Hub Link */}
        <div className="mb-3 space-y-1">
          <Link
            to="/module-hub"
            onClick={() => handleLinkClick('/module-hub')}
            className={cn(
              'group relative flex items-center px-4 py-2.5 text-sm font-medium rounded-lg transition-all duration-200',
              location.pathname === '/module-hub'
                ? 'bg-gradient-to-r from-indigo-500/20 to-violet-500/10 text-white ring-1 ring-indigo-400/40 shadow-lg shadow-indigo-500/10'
                : 'text-slate-300 hover:text-white hover:bg-white/5'
            )}
          >
            <LayoutGrid className={cn(
              'mr-3 h-4 w-4 transition-colors',
              location.pathname === '/module-hub' ? 'text-indigo-300' : 'text-slate-400 group-hover:text-indigo-300'
            )} />
            All Modules
          </Link>

        </div>

        {/* Developer Sections - Platform Developer only */}
        {isPlatformDeveloper && (
          <div className="mb-3 space-y-1 pt-2 border-t border-gray-200">
            <span className="px-4 text-xs font-semibold text-orange-600 uppercase tracking-wider">
              Developer
            </span>
            <Link
              to="/water-delivery/developer"
              onClick={() => handleLinkClick('/water-delivery/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/water-delivery/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Water Delivery
            </Link>
            <Link
              to="/automotive/developer"
              onClick={() => handleLinkClick('/automotive/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/automotive/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Automotive
            </Link>
            <Link
              to="/gunsmith/developer"
              onClick={() => handleLinkClick('/gunsmith/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/gunsmith/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Gunsmith
            </Link>
            <Link
              to="/marine-services/developer"
              onClick={() => handleLinkClick('/marine-services/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/marine-services/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Marine Services
            </Link>
            <Link
              to="/fuel-delivery/developer"
              onClick={() => handleLinkClick('/fuel-delivery/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/fuel-delivery/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Fuel Delivery
            </Link>
            <Link
              to="/power-washing/developer"
              onClick={() => handleLinkClick('/power-washing/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/power-washing/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Power Washing
            </Link>
            <Link
              to="/septic/developer"
              onClick={() => handleLinkClick('/septic/developer')}
              className={cn(
                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-all duration-150',
                'hover:bg-orange-50 text-orange-600 hover:text-orange-700',
                location.pathname === '/septic/developer' && 'bg-orange-100 text-orange-700'
              )}
            >
              <Code className="mr-3 h-4 w-4" />
              Septic Services
            </Link>
          </div>
        )}

        {/* Active Module Sections */}
        <ModuleSections />

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
