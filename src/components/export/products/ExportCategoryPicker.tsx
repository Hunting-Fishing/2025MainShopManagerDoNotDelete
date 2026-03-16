import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from '@/components/ui/command';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Check, ChevronsUpDown, Tag, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useExportProductCategories, ExportCategory } from '@/hooks/export/useExportProductCategories';
import { useExportProductSubcategories } from '@/hooks/export/useExportProductSubcategories';

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
  const { data: categories = [], isLoading: catsLoading } = useExportProductCategories();
  const { data: subcategories = [], isLoading: subsLoading } = useExportProductSubcategories(categoryId || null);

  const selectedCategory = categories.find(c => c.id === categoryId);

  // Group categories by group_name
  const grouped = useMemo(() => {
    const groups: Record<string, ExportCategory[]> = {};
    const order = ['Food & Agriculture', 'Industrial', 'Consumer Goods', 'Raw Materials', 'Other'];
    
    categories.forEach(cat => {
      const group = (cat as any).group_name || 'Other';
      if (!groups[group]) groups[group] = [];
      groups[group].push(cat);
    });

    return order
      .filter(g => groups[g]?.length)
      .map(g => ({ group: g, items: groups[g] }));
  }, [categories]);

  return (
    <div className="grid grid-cols-2 gap-3">
      <div className="space-y-1.5">
        <Label className="text-xs font-medium text-muted-foreground">Category</Label>
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between h-9 text-xs font-normal"
            >
              {catsLoading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : selectedCategory ? (
                <span className="flex items-center gap-1.5 truncate">
                  <Tag className="h-3 w-3 text-emerald-600 shrink-0" />
                  {selectedCategory.name}
                </span>
              ) : (
                <span className="text-muted-foreground">Select category...</span>
              )}
              <ChevronsUpDown className="ml-1 h-3 w-3 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-[280px] p-0" align="start">
            <Command>
              <CommandInput placeholder="Search categories..." className="h-8 text-xs" />
              <CommandList>
                <CommandEmpty className="py-4 text-xs text-center text-muted-foreground">
                  No category found.
                </CommandEmpty>
                {grouped.map(({ group, items }) => (
                  <CommandGroup key={group} heading={group}>
                    {items.map(cat => (
                      <CommandItem
                        key={cat.id}
                        value={cat.name}
                        onSelect={() => {
                          onCategoryChange(cat.id, cat.slug);
                          onSubcategoryChange('');
                          setOpen(false);
                        }}
                        className="text-xs"
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
        <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
        {!categoryId ? (
          <Select disabled>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select category first" />
            </SelectTrigger>
          </Select>
        ) : subsLoading ? (
          <div className="flex items-center h-9 px-3">
            <Loader2 className="h-3 w-3 animate-spin" />
          </div>
        ) : subcategories.length === 0 ? (
          <Select disabled>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="No subcategories" />
            </SelectTrigger>
          </Select>
        ) : (
          <Select value={subcategoryId} onValueChange={onSubcategoryChange}>
            <SelectTrigger className="h-9 text-xs">
              <SelectValue placeholder="Select subcategory..." />
            </SelectTrigger>
            <SelectContent>
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
