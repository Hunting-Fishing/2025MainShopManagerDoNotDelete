import React from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import type { ItemStatus } from '@/hooks/useForkliftInspections';

interface ForkliftInspectionItemProps {
  label: string;
  itemKey: string;
  value: ItemStatus;
  notes?: string;
  onChange: (key: string, value: ItemStatus) => void;
  onNotesChange: (key: string, notes: string) => void;
  icon?: React.ReactNode;
}

const STATUS_CONFIG = {
  good: {
    label: 'Good',
    color: 'bg-green-500 hover:bg-green-600 text-white',
    activeColor: 'bg-green-600 ring-2 ring-green-400 ring-offset-2',
    icon: CheckCircle2,
  },
  attention: {
    label: 'Attention',
    color: 'bg-amber-500 hover:bg-amber-600 text-white',
    activeColor: 'bg-amber-600 ring-2 ring-amber-400 ring-offset-2',
    icon: AlertTriangle,
  },
  bad: {
    label: 'Bad',
    color: 'bg-red-500 hover:bg-red-600 text-white',
    activeColor: 'bg-red-600 ring-2 ring-red-400 ring-offset-2',
    icon: XCircle,
  },
};

export function ForkliftInspectionItem({
  label,
  itemKey,
  value,
  notes,
  onChange,
  onNotesChange,
  icon,
}: ForkliftInspectionItemProps) {
  const showNotesField = value !== 'good';

  return (
    <div className="border rounded-lg overflow-hidden bg-card">
      <div className="px-4 py-3 flex items-center justify-between bg-muted/30">
        <div className="flex items-center gap-2">
          {icon && <span className="text-muted-foreground">{icon}</span>}
          <span className="font-medium text-sm">{label}</span>
        </div>
        <div className="flex items-center gap-1.5">
          {(Object.keys(STATUS_CONFIG) as ItemStatus[]).map((status) => {
            const config = STATUS_CONFIG[status];
            const Icon = config.icon;
            const isActive = value === status;
            
            return (
              <button
                key={status}
                type="button"
                onClick={() => onChange(itemKey, status)}
                className={cn(
                  'flex items-center gap-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all',
                  isActive ? config.activeColor : config.color,
                  'focus:outline-none'
                )}
              >
                <Icon className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">{config.label}</span>
              </button>
            );
          })}
        </div>
      </div>
      
      {showNotesField && (
        <div className="px-4 py-3 bg-background border-t">
          <Textarea
            placeholder={`Notes for ${label.toLowerCase()} issue...`}
            value={notes || ''}
            onChange={(e) => onNotesChange(itemKey, e.target.value)}
            className="min-h-[60px] text-sm"
          />
        </div>
      )}
    </div>
  );
}
