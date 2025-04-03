
import React, { useState } from 'react';
import { ProductCategory } from '@/types/shopping';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CategoryMenuProps {
  categories: ProductCategory[];
  selectedCategoryId?: string;
  onCategoryChange: (categoryId: string) => void;
  isLoading?: boolean;
}

export const CategoryMenu: React.FC<CategoryMenuProps> = ({
  categories,
  selectedCategoryId,
  onCategoryChange,
  isLoading = false
}) => {
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
        <div className="h-8 w-full animate-pulse rounded bg-muted"></div>
      </div>
    );
  }

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
            "flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-secondary/30",
            isSelected ? "bg-secondary/50 text-primary font-medium" : "text-foreground",
            level === 0 ? "font-medium" : "text-sm",
            level > 0 ? `ml-${level * 3}` : ""
          )}
          onClick={() => {
            onCategoryChange(category.id);
            if (hasSubcategories) toggleCategory(category.id);
          }}
        >
          {hasSubcategories && (
            <button 
              onClick={(e) => {
                e.stopPropagation();
                toggleCategory(category.id);
              }}
              className="mr-1 p-1 rounded-full hover:bg-secondary/50"
            >
              {isExpanded ? 
                <ChevronDown className="h-4 w-4" /> : 
                <ChevronRight className="h-4 w-4" />
              }
            </button>
          )}
          <span className={`${!hasSubcategories ? 'ml-6' : ''}`}>{category.name}</span>
        </div>
        
        {hasSubcategories && isExpanded && (
          <div className="subcategories ml-3">
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
          "flex items-center py-2 px-3 rounded-md cursor-pointer hover:bg-secondary/30",
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
