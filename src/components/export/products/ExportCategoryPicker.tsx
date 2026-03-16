import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Tag, Loader2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExportProductCategories, ExportCategory } from '@/hooks/export/useExportProductCategories';
import { useExportProductSubcategories, useCreateExportSubcategory } from '@/hooks/export/useExportProductSubcategories';

interface ExportCategoryPickerProps {
  categoryId: string;
  subcategoryId: string;
  onCategoryChange: (categoryId: string, categorySlug: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
}

export function ExportCategoryPicker({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: ExportCategoryPickerProps) {
  const [open, setOpen] = useState(false);
  const [newSubName, setNewSubName] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);
  const { data: categories = [], isLoading: catsLoading } = useExportProductCategories();
  const { data: subcategories = [], isLoading: subsLoading } = useExportProductSubcategories(categoryId || null);
  const createSub = useCreateExportSubcategory();

  const selectedCategory = categories.find(c => c.id === categoryId);

  const grouped = useMemo(() => {
    const groups: Record<string, ExportCategory[]> = {};
    const order = ['Food & Agriculture', 'Industrial', 'Consumer Goods', 'Raw Materials', 'Other'];
    categories.forEach(cat => {
      const group = cat.group_name || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cat);
    });
    return order.filter(g => groups[g]?.length).map(g => ({ group: g, items: groups[g] }));
  }, [categories]);

  const catByName = useMemo(() => {
    const map = new Map<string, ExportCategory>();
    categories.forEach(c => map.set(c.name.toLowerCase(), c));
    return map;
  }, [categories]);

  const handleSelect = (lowercasedName: string) => {
    const cat = catByName.get(lowercasedName);
    if (cat) {
      onCategoryChange(cat.id, cat.slug);
      onSubcategoryChange('');
      setShowAddSub(false);
      setNewSubName('');
    }
    setOpen(false);
  };

  const handleAddSubcategory = async () => {
    if (!newSubName.trim() || !categoryId) return;
    const result = await createSub.mutateAsync({ category_id: categoryId, name: newSubName.trim() });
    onSubcategoryChange(result.id);
    setNewSubName('');
    setShowAddSub(false);
  };

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Category</Label>
        <Popover open={open} onOpenChange={setOpen} modal={true}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-9 text-xs font-normal"
              type="button"
            >
              {catsLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : selectedCategory ? (
                <span className="flex items-center gap-1.5 truncate">
                  <Tag className="h-3 w-3 text-primary shrink-0" />
                  {selectedCategory.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Select category...</span>
              )}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[300px] p-0 pointer-events-auto" align="start" side="bottom" sideOffset={4}>
            <Command>
              <CommandInput placeholder="Search categories..." className="h-9 text-xs" />
              <CommandList className="max-h-[250px]">
                <CommandEmpty className="py-4 text-xs text-center text-muted-foreground">
                  No category found.
                </CommandEmpty>
                {grouped.map(({ group, items }) => (
                  <CommandGroup key={group} heading={group}>
                    {items.map(cat => (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={handleSelect}
                        className="text-xs cursor-pointer"
                      >
                        <Check className={cn('mr-1.5 h-3 w-3', categoryId === cat.id ? 'opacity-100' : 'opacity-0')} />
                        {cat.name}
                        {cat.is_system && (
                          <Badge variant="outline" className="ml-auto text-[9px] px-1 py-0 h-4">
                            System
                          </Badge>
                        )}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                ))}
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
          {categoryId && !showAddSub && (
            <button
              type="button"
              onClick={() => setShowAddSub(true)}
              className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
            >
              <Plus className="h-3 w-3" /> Add new
            </button>
          )}
        </div>

        {showAddSub && categoryId ? (
          <div className="flex gap-1.5">
            <Input
              value={newSubName}
              onChange={e => setNewSubName(e.target.value)}
              placeholder="New subcategory name..."
              className="h-9 text-xs flex-1"
              autoFocus
              onKeyDown={e => {
                if (e.key === 'Enter') { e.preventDefault(); handleAddSubcategory(); }
                if (e.key === 'Escape') { setShowAddSub(false); setNewSubName(''); }
              }}
            />
            <Button
              type="button"
              size="sm"
              className="h-9 px-2.5 text-xs"
              onClick={handleAddSubcategory}
              disabled={!newSubName.trim() || createSub.isPending}
            >
              {createSub.isPending ? <Loader2 className="h-3 w-3 animate-spin" /> : <Plus className="h-3 w-3" />}
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-9 px-2 text-xs text-muted-foreground"
              onClick={() => { setShowAddSub(false); setNewSubName(''); }}
            >
              ✕
            </Button>
          </div>
        ) : !categoryId ? (
          <div className="flex items-center h-9 px-3 border rounded-md bg-muted/30">
            <span className="text-xs text-muted-foreground">Select category first</span>
          </div>
        ) : subsLoading ? (
          <div className="flex items-center h-9 px-3 border rounded-md">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        ) : subcategories.length === 0 ? (
          <div className="flex items-center h-9 px-3 border rounded-md bg-muted/30">
            <span className="text-xs text-muted-foreground">No subcategories — add one above</span>
          </div>
        ) : (
          <Select value={subcategoryId || undefined} onValueChange={onSubcategoryChange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select subcategory..." />
            </SelectTrigger>
            <SelectContent className="pointer-events-auto">
              {subcategories.map(sub => (
                <SelectItem key={sub.id} value={sub.id} className="text-xs">
                  {sub.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>
    </div>
  );
}
