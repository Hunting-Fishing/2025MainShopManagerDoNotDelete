
import React, { useState } from 'react';
import { ServiceMainCategory, CategoryColorStyle } from '@/types/serviceHierarchy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ChevronRight, SortAsc } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { formatNumber } from '@/lib/formatters';

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onAddCategory: () => void;
  isLoading?: boolean;
}

// Color palette for category tags
const categoryColors: Record<number, CategoryColorStyle> = {
  0: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  1: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  2: { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  3: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  4: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  5: { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  6: { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  7: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
};

export const ServiceCategoryList: React.FC<ServiceCategoryListProps> = ({
  categories,
  onSelectCategory,
  onAddCategory,
  isLoading = false,
}) => {
  const [isCompact, setIsCompact] = useState(false);
  const [sortOrder, setSortOrder] = useState<'name' | 'position'>('position');

  const toggleCompactView = () => {
    setIsCompact(prev => !prev);
  };

  const toggleSortOrder = () => {
    setSortOrder(prev => prev === 'name' ? 'position' : 'name');
  };
  
  const getSortedCategories = () => {
    if (!categories || categories.length === 0) return [];
    
    return [...categories].sort((a, b) => {
      if (sortOrder === 'name') {
        return a.name.localeCompare(b.name);
      } else {
        return (a.position || 0) - (b.position || 0);
      }
    });
  };
  
  const getCategoryColorStyle = (index: number): CategoryColorStyle => {
    const colorIndex = index % Object.keys(categoryColors).length;
    return categoryColors[colorIndex];
  };

  const sortedCategories = getSortedCategories();

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array(5).fill(null).map((_, i) => (
          <div key={i} className="space-y-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="flex space-x-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={toggleSortOrder}
            className="text-xs flex items-center"
          >
            <SortAsc className="h-3 w-3 mr-1" />
            Sort by: {sortOrder === 'name' ? 'Name' : 'Position'}
          </Button>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCompactView}
          className="text-xs"
        >
          {isCompact ? 'Expand' : 'Compact'}
        </Button>
      </div>

      {sortedCategories.length === 0 ? (
        <div className="text-center p-4 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground mb-2">No service categories available</p>
          <Button size="sm" onClick={onAddCategory} className="mt-2">
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCategories.map((category, index) => {
            const colorStyle = getCategoryColorStyle(index);
            return (
              <Card
                key={category.id}
                className="cursor-pointer hover:bg-slate-50 transition-colors shadow-sm hover:shadow-md"
                onClick={() => onSelectCategory(category)}
              >
                <CardContent className={`p-3 ${isCompact ? 'py-2' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-sm">{category.name}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
                          Position: {formatNumber(category.position || 0)}
                        </span>
                      </div>
                      
                      {!isCompact && category.description && (
                        <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                      )}
                      
                      {!isCompact && (
                        <div className="flex items-center mt-2">
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colorStyle.bg} ${colorStyle.text} ${colorStyle.border}`}>
                            {category.subcategories?.length || 0} subcategories
                          </span>
                        </div>
                      )}
                    </div>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
          <Button
            variant="outline"
            className="w-full border-dashed rounded-xl py-3"
            size="sm"
            onClick={onAddCategory}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Category
          </Button>
        </div>
      )}
    </div>
  );
};
