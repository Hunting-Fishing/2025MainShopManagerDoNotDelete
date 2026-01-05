import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useEnabledModules } from '@/hooks/useEnabledModules';
import { MODULE_ROUTES, ModuleSectionItem } from '@/config/moduleRoutes';
import { useSidebar } from '@/hooks/use-sidebar';
import { useIsMobile } from '@/hooks/use-mobile';

export function ModuleSections() {
  const location = useLocation();
  const { setIsOpen } = useSidebar();
  const isMobile = useIsMobile();
  const { getEnabledModuleSlugs, hasShop, isLoading } = useEnabledModules();

  const handleLinkClick = () => {
    if (isMobile) {
      setIsOpen(false);
    }
  };

  if (isLoading || !hasShop) {
    return null;
  }

  const enabledSlugs = getEnabledModuleSlugs();
  
  // Get the currently active module based on the route
  const currentPath = location.pathname;
  
  // Find the active module by checking which module's dashboard route matches
  const activeModuleSlug = enabledSlugs.find(slug => {
    const config = MODULE_ROUTES[slug];
    if (!config) return false;
    
    // Check if current path starts with the module's dashboard route
    // or if we're on a nested route of that module
    const dashboardRoute = config.dashboardRoute;
    return currentPath === dashboardRoute || currentPath.startsWith(dashboardRoute + '/');
  });

  // If no active module found, don't show sections
  if (!activeModuleSlug) {
    return null;
  }

  const moduleConfig = MODULE_ROUTES[activeModuleSlug];
  if (!moduleConfig?.sections || moduleConfig.sections.length === 0) {
    return null;
  }

  const Icon = moduleConfig.icon;

  return (
    <div className="mb-3">
      {/* Module Section Header */}
      <div className={cn(
        "px-3 py-2 rounded-t-lg border-b mb-1",
        "bg-gradient-to-r",
        moduleConfig.gradientFrom,
        moduleConfig.gradientTo,
        "border-white/20"
      )}>
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-white" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-white">
            {moduleConfig.name}
          </h3>
        </div>
      </div>
      
      {/* Module Section Items */}
      <div className="space-y-0.5">
        {moduleConfig.sections.map((item: ModuleSectionItem) => {
          const isActive = currentPath === item.href || 
            (item.href !== moduleConfig.dashboardRoute && currentPath.startsWith(item.href));
          
          const ItemIcon = item.icon;
          
          return (
            <Link
              key={item.href}
              to={item.href}
              onClick={handleLinkClick}
              className={cn(
                'group flex items-center px-3 py-2 text-sm font-medium rounded-md transition-all duration-150',
                isActive
                  ? 'bg-primary/10 text-primary font-semibold'
                  : 'text-muted-foreground hover:bg-muted/50 hover:text-foreground'
              )}
              title={item.description || item.title}
            >
              <ItemIcon
                className={cn(
                  'mr-3 h-4 w-4 flex-shrink-0 transition-colors',
                  isActive 
                    ? 'text-primary'
                    : 'text-muted-foreground/70 group-hover:text-foreground'
                )}
              />
              {item.title}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
