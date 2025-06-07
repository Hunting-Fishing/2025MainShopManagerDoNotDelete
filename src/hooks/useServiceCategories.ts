
import { useServiceManagementState } from './useServiceManagementState';

export const useServiceCategories = () => {
  const { sectors, loading, error, refetch } = useServiceManagementState();
  
  // Flatten categories from all sectors
  const categories = sectors.flatMap(sector => sector.categories);

  return {
    categories,
    loading,
    error,
    refetch
  };
};

export const useServiceSectors = () => {
  return useServiceManagementState();
};
