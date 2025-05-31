
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { commonServiceCategories } from '@/lib/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  // For now, return the static service categories
  // In the future, this could be enhanced to fetch from a database
  return Promise.resolve(commonServiceCategories);
}
