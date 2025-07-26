import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, List, Table, Grid3X3 } from 'lucide-react';
import { useInventoryView, ViewMode } from '@/contexts/InventoryViewContext';

const viewModes = [
  { mode: 'cards' as ViewMode, icon: LayoutGrid, label: 'Cards' },
  { mode: 'grid' as ViewMode, icon: Grid3X3, label: 'Grid' },
  { mode: 'list' as ViewMode, icon: List, label: 'List' },
  { mode: 'table' as ViewMode, icon: Table, label: 'Table' }
];

export function ViewModeToggle() {
  const { viewMode, setViewMode } = useInventoryView();

  return (
    <div className="flex bg-background border rounded-lg p-1">
      {viewModes.map(({ mode, icon: Icon, label }) => (
        <Button
          key={mode}
          variant={viewMode === mode ? 'default' : 'ghost'}
          size="sm"
          onClick={() => setViewMode(mode)}
          className={`
            px-3 py-2 transition-all duration-200
            ${viewMode === mode 
              ? 'bg-primary text-primary-foreground shadow-sm' 
              : 'hover:bg-muted'
            }
          `}
          title={label}
        >
          <Icon className="h-4 w-4" />
          <span className="ml-2 hidden sm:inline">{label}</span>
        </Button>
      ))}
    </div>
  );
}