
import React, { useState } from 'react';
import { ProductCategory } from '@/types/shopping';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface HierarchicalCategoryMenuProps {
  categories: ProductCategory[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  isLoading?: boolean;
}

export const HierarchicalCategoryMenu: React.FC<HierarchicalCategoryMenuProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }
    
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  // Show skeletons during loading
  if (isLoading) {
    return (
      <div className="space-y-2">
        {[1, 2, 3, 4, 5].map(i => (
          <div key={i} className="h-8 w-full animate-pulse rounded bg-muted"></div>
        ))}
      </div>
    );
  }

  // Show message if no categories
  if (categories.length === 0) {
    return <div className="text-muted-foreground py-2">No categories available</div>;
  }

  const renderCategory = (category: ProductCategory, level = 0) => {
    const hasSubcategories = category.subcategories && category.subcategories.length > 0;
    const isExpanded = expandedCategories[category.id];
    const isSelected = selectedCategoryId === category.id;
    
    return (
      <div key={category.id} className="category-item">
        <div 
          className={cn(
            "flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-secondary/30 transition-colors",
            isSelected ? "bg-secondary/50 text-primary font-medium" : "text-foreground",
            level === 0 ? "font-medium" : "text-sm"
          )}
          style={{ marginLeft: level > 0 ? `${level * 12}px` : '0' }}
          onClick={() => onCategoryChange(category.id)}
        >
          {hasSubcategories && (
            <button 
              onClick={(e) => toggleCategory(category.id, e)}
              className="mr-1 p-1 rounded-full hover:bg-secondary/50"
              aria-label={isExpanded ? "Collapse category" : "Expand category"}
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </button>
          )}
          <span className={`${!hasSubcategories ? 'ml-6' : ''} truncate`}>{category.name}</span>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="subcategories">
            {category.subcategories!.map(subCategory => renderCategory(subCategory, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="category-menu space-y-1">
      <div 
        className={cn(
          "flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-secondary/30 transition-colors",
          !selectedCategoryId ? "bg-secondary/50 text-primary font-medium" : "text-foreground",
          "font-medium"
        )}
        onClick={() => onCategoryChange('')}
      >
        <span className="ml-6">All Products</span>
      </div>
      
      {categories.map(category => renderCategory(category))}
    </div>
  );
};
