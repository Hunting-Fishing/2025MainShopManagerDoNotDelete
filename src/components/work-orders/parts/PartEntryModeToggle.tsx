
import React from 'react';
import { Button } from '@/components/ui/button';
import { LayoutGrid, FileText } from 'lucide-react';

interface PartEntryModeToggleProps {
  mode: 'comprehensive' | 'tabbed';
  onModeChange: (mode: 'comprehensive' | 'tabbed') => void;
}

export function PartEntryModeToggle({ mode, onModeChange }: PartEntryModeToggleProps) {
  return (
    <div className="flex items-center gap-1 border rounded-lg p-1 bg-muted/50 mb-4">
      <Button
        variant={mode === 'comprehensive' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('comprehensive')}
        className="h-8 px-3"
      >
        <FileText className="h-4 w-4 mr-2" />
        Comprehensive Form
      </Button>
      <Button
        variant={mode === 'tabbed' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onModeChange('tabbed')}
        className="h-8 px-3"
      >
        <LayoutGrid className="h-4 w-4 mr-2" />
        Tabbed Form
      </Button>
    </div>
  );
}
