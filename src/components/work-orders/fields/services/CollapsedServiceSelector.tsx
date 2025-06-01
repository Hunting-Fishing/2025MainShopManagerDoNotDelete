
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

interface CollapsedServiceSelectorProps {
  onExpand: () => void;
  serviceCount: number;
}

export function CollapsedServiceSelector({ onExpand, serviceCount }: CollapsedServiceSelectorProps) {
  return (
    <div className="border border-dashed border-slate-300 rounded-lg p-4 bg-slate-50 hover:bg-slate-100 transition-colors">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Search className="h-4 w-4 text-slate-500" />
          <div>
            <p className="text-sm font-medium text-slate-700">
              {serviceCount === 0 ? 'Add Services' : 'Add Another Service'}
            </p>
            <p className="text-xs text-slate-500">
              {serviceCount === 0 
                ? 'Search and select services for this work order'
                : `${serviceCount} service${serviceCount !== 1 ? 's' : ''} selected`
              }
            </p>
          </div>
        </div>
        
        <Button
          onClick={onExpand}
          variant="outline"
          size="sm"
          className="flex items-center gap-2"
        >
          <Plus className="h-4 w-4" />
          {serviceCount === 0 ? 'Browse Services' : 'Add More'}
        </Button>
      </div>
    </div>
  );
}
