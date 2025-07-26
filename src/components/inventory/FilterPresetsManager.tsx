import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/hooks/use-toast';
import { 
  Bookmark, 
  BookmarkPlus, 
  Trash2, 
  Star,
  Filter
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface FilterPreset {
  id: string;
  name: string;
  filters: {
    search: string;
    category: string[];
    status: string[];
    supplier: string;
    location: string;
  };
  isDefault?: boolean;
  created: Date;
}

interface FilterPresetsManagerProps {
  currentFilters: {
    search: string;
    category: string[];
    status: string[];
    supplier: string;
    location: string;
  };
  onApplyPreset: (preset: FilterPreset) => void;
  className?: string;
}

// Mock data - in a real app, this would come from a backend/local storage
const mockPresets: FilterPreset[] = [
  {
    id: '1',
    name: 'Low Stock Items',
    filters: {
      search: '',
      category: [],
      status: ['low_stock'],
      supplier: '',
      location: ''
    },
    isDefault: true,
    created: new Date('2024-01-15')
  },
  {
    id: '2',
    name: 'Electronics',
    filters: {
      search: '',
      category: ['Electronics'],
      status: ['active'],
      supplier: '',
      location: ''
    },
    created: new Date('2024-01-20')
  },
  {
    id: '3',
    name: 'Warehouse A Items',
    filters: {
      search: '',
      category: [],
      status: ['active'],
      supplier: '',
      location: 'Warehouse A'
    },
    created: new Date('2024-01-25')
  }
];

export function FilterPresetsManager({ 
  currentFilters, 
  onApplyPreset, 
  className 
}: FilterPresetsManagerProps) {
  const { toast } = useToast();
  const [presets, setPresets] = useState<FilterPreset[]>(mockPresets);
  const [isOpen, setIsOpen] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [presetName, setPresetName] = useState('');

  const hasActiveFilters = currentFilters.search || 
    currentFilters.category.length > 0 || 
    currentFilters.status.length > 0 || 
    currentFilters.supplier || 
    currentFilters.location;

  const handleSavePreset = useCallback(() => {
    if (!presetName.trim()) {
      toast({
        title: "Name required",
        description: "Please enter a name for your filter preset",
        variant: "destructive"
      });
      return;
    }

    const newPreset: FilterPreset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      filters: { ...currentFilters },
      created: new Date()
    };

    setPresets(prev => [...prev, newPreset]);
    setPresetName('');
    setShowSaveDialog(false);
    
    toast({
      title: "Preset saved",
      description: `Filter preset "${newPreset.name}" has been saved`,
    });
  }, [presetName, currentFilters, toast]);

  const handleDeletePreset = useCallback((presetId: string, presetName: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId));
    toast({
      title: "Preset deleted",
      description: `Filter preset "${presetName}" has been deleted`,
    });
  }, [toast]);

  const handleApplyPreset = useCallback((preset: FilterPreset) => {
    onApplyPreset(preset);
    setIsOpen(false);
    toast({
      title: "Preset applied",
      description: `Applied filter preset "${preset.name}"`,
    });
  }, [onApplyPreset, toast]);

  const getPresetDescription = (preset: FilterPreset) => {
    const parts = [];
    if (preset.filters.search) parts.push(`Search: "${preset.filters.search}"`);
    if (preset.filters.category.length) parts.push(`Categories: ${preset.filters.category.length}`);
    if (preset.filters.status.length) parts.push(`Status: ${preset.filters.status.length}`);
    if (preset.filters.supplier) parts.push(`Supplier: ${preset.filters.supplier}`);
    if (preset.filters.location) parts.push(`Location: ${preset.filters.location}`);
    return parts.join(', ') || 'No filters';
  };

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <Bookmark className="h-4 w-4" />
            Presets
            {presets.length > 0 && (
              <Badge variant="secondary" className="ml-1 px-1.5 py-0.5 text-xs">
                {presets.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        
        <PopoverContent className="w-80 p-0" align="start">
          <div className="p-4 border-b">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">Filter Presets</h4>
              {hasActiveFilters && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSaveDialog(true)}
                  className="gap-1"
                >
                  <BookmarkPlus className="h-3 w-3" />
                  Save
                </Button>
              )}
            </div>
          </div>
          
          {showSaveDialog && (
            <div className="p-4 border-b bg-muted/20">
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium">Preset Name</label>
                  <Input
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    placeholder="Enter preset name..."
                    className="mt-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleSavePreset();
                      if (e.key === 'Escape') setShowSaveDialog(false);
                    }}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={handleSavePreset}
                    disabled={!presetName.trim()}
                  >
                    Save
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setShowSaveDialog(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          )}
          
          <div className="max-h-64 overflow-y-auto">
            {presets.length === 0 ? (
              <div className="p-8 text-center text-muted-foreground">
                <Filter className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p className="text-sm">No saved presets</p>
                <p className="text-xs mt-1">Apply some filters and save them as presets</p>
              </div>
            ) : (
              <div className="p-2">
                {presets.map((preset) => (
                  <div
                    key={preset.id}
                    className="group flex items-start justify-between p-3 rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => handleApplyPreset(preset)}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h5 className="font-medium text-sm truncate">
                          {preset.name}
                        </h5>
                        {preset.isDefault && (
                          <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {getPresetDescription(preset)}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-1">
                        {preset.created.toLocaleDateString()}
                      </p>
                    </div>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeletePreset(preset.id, preset.name);
                      }}
                      className="opacity-0 group-hover:opacity-100 transition-opacity h-6 w-6 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}