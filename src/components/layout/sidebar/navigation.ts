
import {
  getNavigationForSurface,
  type NavigationItem,
  type NavigationSection,
} from '@/components/navigation/appNavigation';

export type { NavigationItem, NavigationSection };

export const navigation: NavigationSection[] = getNavigationForSurface('sidebar');
