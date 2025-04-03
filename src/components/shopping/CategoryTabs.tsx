
import React from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { ProductCategory } from '@/types/shopping';
import { Badge } from '@/components/ui/badge';
import { useCategories } from '@/hooks/useCategories';

interface CategoryTabsProps {
  selectedCategoryId?: string;
  onCategoryChange: (categoryId?: string) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({
  selectedCategoryId,
  onCategoryChange
}) => {
  const { categories, isLoading } = useCategories();
  
  if (isLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    );
  }
  
  return (
    <Tabs 
      defaultValue={selectedCategoryId || 'all'} 
      value={selectedCategoryId || 'all'}
      onValueChange={(value) => onCategoryChange(value === 'all' ? undefined : value)}
      className="w-full"
    >
      <div className="border-b overflow-x-auto">
        <TabsList className="h-12 bg-transparent">
          <TabsTrigger 
            value="all" 
            className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
          >
            All Products
          </TabsTrigger>
          
          {categories.map((category) => (
            <TabsTrigger 
              key={category.id} 
              value={category.id}
              className="data-[state=active]:border-b-2 data-[state=active]:border-primary data-[state=active]:shadow-none rounded-none h-12"
            >
              {category.name}
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
    </Tabs>
  );
};
