
import { useState } from 'react';

type ViewMode = 'table' | 'card';

export function useWorkOrderViewMode(initialMode: ViewMode = 'table') {
  const [viewMode, setViewMode] = useState<ViewMode>(initialMode);

  const toggleViewMode = (mode: ViewMode) => {
    setViewMode(mode);
  };

  return {
    viewMode,
    toggleViewMode
  };
}
