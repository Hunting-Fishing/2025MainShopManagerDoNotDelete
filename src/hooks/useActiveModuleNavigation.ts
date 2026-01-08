import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { MODULE_ROUTES, ModuleRouteConfig } from '@/config/moduleRoutes';

export type ModuleSlug = keyof typeof MODULE_ROUTES;

export interface ActiveModuleInfo {
  slug: ModuleSlug | null;
  config: ModuleRouteConfig | null;
  isInModule: boolean;
}

/**
 * Detects the active module based on the current route
 * Returns the module slug, config, and whether the user is currently in a module
 */
export function useActiveModuleNavigation(): ActiveModuleInfo {
  const location = useLocation();

  return useMemo(() => {
    const path = location.pathname;

    // Check each module's routes to see if we're in one
    for (const [slug, config] of Object.entries(MODULE_ROUTES)) {
      // Check if current path starts with the module's dashboard route
      if (path.startsWith(config.dashboardRoute)) {
        return {
          slug: slug as ModuleSlug,
          config: config as ModuleRouteConfig,
          isInModule: true,
        };
      }
    }

    // Not in any module
    return {
      slug: null,
      config: null,
      isInModule: false,
    };
  }, [location.pathname]);
}

/**
 * Gets grouped sections for a module's navigation
 */
export function getModuleGroupedSections(config: ModuleRouteConfig) {
  const groups: Record<string, typeof config.sections> = {};
  
  for (const section of config.sections) {
    const group = (section as any).group || 'General';
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(section);
  }

  // Define group order
  const groupOrder = [
    'Dashboard',
    'Services',
    'Customers',
    'Inventory',
    'Billing',
    'Compliance',
    'Resources',
    'General',
  ];

  // Sort groups by defined order
  const sortedGroups = Object.entries(groups).sort(([a], [b]) => {
    const aIndex = groupOrder.indexOf(a);
    const bIndex = groupOrder.indexOf(b);
    return (aIndex === -1 ? 999 : aIndex) - (bIndex === -1 ? 999 : bIndex);
  });

  return sortedGroups;
}
