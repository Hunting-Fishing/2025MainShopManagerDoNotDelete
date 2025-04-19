
import { useState, useCallback } from 'react';

export const useWorkOrderFilters = () => {
  const [showFilters, setShowFilters] = useState(false);
  const [technicians, setTechnicians] = useState<string[]>([]);
  const [loadingTechnicians, setLoadingTechnicians] = useState(false);

  const handleSearch = useCallback((searchTerm: string) => {
    return { searchTerm };
  }, []);

  const handleStatusFilter = useCallback((statuses: string[]) => {
    return { status: statuses };
  }, []);

  const handlePriorityFilter = useCallback((priorities: string[]) => {
    return { priority: priorities };
  }, []);

  const handleServiceCategoryFilter = useCallback((categoryId: string | null) => {
    return categoryId ? { service_category_id: categoryId } : {};
  }, []);

  const handleTechnicianFilter = useCallback((selectedTechs: string[]) => {
    if (selectedTechs.length > 0) {
      return { technicianId: selectedTechs[0] };
    }
    return {};
  }, []);

  return {
    showFilters,
    setShowFilters,
    technicians,
    setTechnicians,
    loadingTechnicians,
    setLoadingTechnicians,
    handleSearch,
    handleStatusFilter,
    handlePriorityFilter,
    handleServiceCategoryFilter,
    handleTechnicianFilter
  };
};
