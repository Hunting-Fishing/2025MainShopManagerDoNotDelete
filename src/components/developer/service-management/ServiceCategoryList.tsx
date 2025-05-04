
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Plus, ChevronRight, SortAsc } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  onSelectCategory: (category: ServiceMainCategory) => void;
  onAddCategory: () => void;
  isLoading?: boolean;
}

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
  
  // Modify this function to add a new category with all required properties
  const handleAddCategory = () => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: "New Category",
      description: "",
      position: categories.length > 0 
        ? Math.max(...categories.map(c => c.position || 0)) + 1
        : 0,
      subcategories: []
    };
    
    onAddCategory();
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
        <div className="space-y-2">
          {sortedCategories.map(category => (
            <Card
              key={category.id}
              className="cursor-pointer hover:bg-slate-50 transition-colors"
              onClick={() => onSelectCategory(category)}
            >
              <CardContent className={`p-3 ${isCompact ? 'py-2' : ''}`}>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium text-sm">{category.name}</h3>
                    {!isCompact && category.description && (
                      <p className="text-xs text-muted-foreground mt-1">{category.description}</p>
                    )}
                    {!isCompact && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {category.subcategories?.length || 0} subcategories
                      </p>
                    )}
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
          <Button
            variant="outline"
            className="w-full border-dashed"
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
