import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Loader2, Plus, Tag, ChevronRight } from 'lucide-react';
import { useExportProductCategories, ExportCategory } from '@/hooks/export/useExportProductCategories';
import { useExportProductSubcategories, useCreateExportSubcategory } from '@/hooks/export/useExportProductSubcategories';

interface ExportCategoryPickerProps {
  categoryId: string;
  subcategoryId: string;
  onCategoryChange: (categoryId: string, categorySlug: string) => void;
  onSubcategoryChange: (subcategoryId: string) => void;
}

const MAIN_CATEGORY_ORDER = ['Food & Agriculture', 'Industrial', 'Consumer Goods', 'Raw Materials', 'Other'];

export function ExportCategoryPicker({
  categoryId,
  subcategoryId,
  onCategoryChange,
  onSubcategoryChange,
}: ExportCategoryPickerProps) {
  const [newSubName, setNewSubName] = useState('');
  const [showAddSub, setShowAddSub] = useState(false);
  const { data: categories = [], isLoading: catsLoading } = useExportProductCategories();
  const { data: subcategories = [], isLoading: subsLoading } = useExportProductSubcategories(categoryId || null);
  const createSub = useCreateExportSubcategory();

  // Derive the selected category and its main group
  const selectedCategory = categories.find(c => c.id === categoryId);
  const [mainCategory, setMainCategory] = useState<string>('');

  // Auto-sync main category from selected category (for edit mode hydration)
  const effectiveMainCategory = useMemo(() => {
    if (selectedCategory) return selectedCategory.group_name || 'Other';
    return mainCategory;
  }, [selectedCategory, mainCategory]);

  // Get available main categories from data
  const availableMainCategories = useMemo(() => {
    const groups = new Set<string>();
    categories.forEach(c => groups.add(c.group_name || 'Other'));
    return MAIN_CATEGORY_ORDER.filter(g => groups.has(g));
  }, [categories]);

  // Filter categories by selected main category
  const filteredCategories = useMemo(() => {
    if (!effectiveMainCategory) return [];
    return categories.filter(c => (c.group_name || 'Other') === effectiveMainCategory);
  }, [categories, effectiveMainCategory]);

  const handleMainCategoryChange = (value: string) => {
    setMainCategory(value);
    // Reset category and subcategory when main changes
    onCategoryChange('', '');
    onSubcategoryChange('');
    setShowAddSub(false);
    setNewSubName('');
  };

  const handleCategorySelect = (catId: string) => {
    const cat = categories.find(c => c.id === catId);
    if (cat) {
      onCategoryChange(cat.id, cat.slug);
      onSubcategoryChange('');
      setShowAddSub(false);
      setNewSubName('');
    }
  };

  const handleAddSubcategory = async () => {
    if (!newSubName.trim() || !categoryId) return;
    const result = await createSub.mutateAsync({ category_id: categoryId, name: newSubName.trim() });
    onSubcategoryChange(result.id);
    setNewSubName('');
    setShowAddSub(false);
  };

  return (
    <div className="space-y-3">
      {/* Breadcrumb indicator */}
      {(effectiveMainCategory || selectedCategory) && (
        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
          <Tag className="h-3 w-3 text-primary" />
          {effectiveMainCategory && <span>{effectiveMainCategory}</span>}
          {selectedCategory && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">{selectedCategory.name}</span>
            </>
          )}
          {subcategoryId && subcategories.find(s => s.id === subcategoryId) && (
            <>
              <ChevronRight className="h-3 w-3" />
              <span className="text-foreground font-medium">
                {subcategories.find(s => s.id === subcategoryId)?.name}
              </span>
            </>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* 1. Main Category */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Main Category *</Label>
          {catsLoading ? (
            <div className="flex items-center h-9 px-3 border rounded-md">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          ) : (
            <Select value={effectiveMainCategory || undefined} onValueChange={handleMainCategoryChange}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select main category..." />
              </SelectTrigger>
              <SelectContent>
                {availableMainCategories.map(group => (
                  <SelectItem key={group} value={group} className="text-xs">
                    {group}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 2. Category */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-muted-foreground">Category *</Label>
          {!effectiveMainCategory ? (
            <div className="flex items-center h-9 px-3 border rounded-md bg-muted/30">
              <span className="text-xs text-muted-foreground">Select main category first</span>
            </div>
          ) : (
            <Select value={categoryId || undefined} onValueChange={handleCategorySelect}>
              <SelectTrigger className="h-9 text-xs">
                <SelectValue placeholder="Select category..." />
              </SelectTrigger>
              <SelectContent>
                {filteredCategories.map(cat => (
                  <SelectItem key={cat.id} value={cat.id} className="text-xs">
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* 3. Subcategory */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-medium text-muted-foreground">Subcategory</Label>
            {categoryId && !showAddSub && (
              <button
                type="button"
                onClick={() => setShowAddSub(true)}
                className="text-[10px] text-primary hover:underline flex items-center gap-0.5"
              >
                <Plus className="h-3 w-3" /> Add
              </button>
            )}
          </div>

          {showAddSub && categoryId ? (
            <div className="flex gap-1.5">
              <Input
                value={newSubName}
                onChange={e => setNewSubName(e.target.value)}
                placeholder="New subcategory..."
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
              <span className="text-xs text-muted-foreground">No subcategories — add one</span>
            </div>
          ) : (
            <Select value={subcategoryId || undefined} onValueChange={onSubcategoryChange}>
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
    </div>
  );
}
