
import { useState, useCallback } from 'react';

type ViewMode = 'table' | 'card';

export interface UseWorkOrderViewModeResult {
  viewMode: ViewMode;
  toggleViewMode: (mode: ViewMode) => void;
}

export function useWorkOrderViewMode(initialMode: ViewMode = 'table'): UseWorkOrderViewModeResult {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const toggleViewMode = useCallback((mode: ViewMode) => {
    setViewMode(mode);
  }, []);

  return {
    viewMode,
    toggleViewMode
  };
}
