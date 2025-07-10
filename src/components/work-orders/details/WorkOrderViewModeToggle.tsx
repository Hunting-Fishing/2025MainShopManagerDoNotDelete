import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';

export type WorkOrderViewMode = 'tabbed' | 'detailed';

interface WorkOrderViewModeToggleProps {
  mode: WorkOrderViewMode;
  onModeChange: (mode: WorkOrderViewMode) => void;
  className?: string;
}

export function WorkOrderViewModeToggle({ 
  mode, 
  onModeChange, 
  className 
}: WorkOrderViewModeToggleProps) {
  return (
    <div className={cn("flex items-center gap-1 border rounded-lg p-1 bg-muted/50", className)}>
      <Button
        variant={mode === 'tabbed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('tabbed')}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Tabbed View
      </Button>
      <Button
        variant={mode === 'detailed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('detailed')}
        className="h-8 px-3"
      >
        <FileText className="h-4 w-4 mr-2" />
        Detailed Form
      </Button>
    </div>
  );
}