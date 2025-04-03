
import React, { useState } from 'react';
import { ProductCategory, ProductFilterOptions } from '@/types/shopping';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Slider } from '@/components/ui/slider';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { useCategories } from '@/hooks/useCategories';
import { useIsMobile } from '@/hooks/use-mobile';

interface ProductFiltersProps {
  filterOptions: ProductFilterOptions;
  onFilterChange: (newFilters: Partial<ProductFilterOptions>) => void;
  minPrice?: number;
  maxPrice?: number;
  onMobileClose?: () => void;
  isMobileVisible?: boolean;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({
  filterOptions,
  onFilterChange,
  minPrice = 0,
  maxPrice = 1000,
  onMobileClose,
  isMobileVisible = false
}) => {
  const { categories } = useCategories();
  const isMobile = useIsMobile();
  const [search, setSearch] = useState(filterOptions.search || '');
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filterOptions.minPrice || minPrice,
    filterOptions.maxPrice || maxPrice
  ]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange({ search });
  };

  const handleCategoryChange = (categoryId: string | undefined) => {
    onFilterChange({ categoryId });
  };

  const handleSortChange = (sortBy: string) => {
    onFilterChange({ sortBy: sortBy as ProductFilterOptions['sortBy'] });
  };

  const handleFilterTypeChange = (filterType: string) => {
    onFilterChange({ filterType: filterType as ProductFilterOptions['filterType'] });
  };

  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };

  const applyPriceFilter = () => {
    onFilterChange({ minPrice: priceRange[0], maxPrice: priceRange[1] });
  };

  const resetFilters = () => {
    setSearch('');
    setPriceRange([minPrice, maxPrice]);
    onFilterChange({
      search: '',
      categoryId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      filterType: 'all',
      sortBy: 'popularity'
    });
  };

  // Determine if any filters are active
  const hasActiveFilters = filterOptions.search ||
    filterOptions.categoryId ||
    filterOptions.minPrice !== undefined ||
    filterOptions.maxPrice !== undefined ||
    filterOptions.filterType !== 'all';

  const containerClasses = isMobile
    ? `fixed inset-0 bg-white z-50 overflow-auto transition-transform p-4 ${isMobileVisible ? 'translate-x-0' : '-translate-x-full'}`
    : 'w-full sticky top-20 max-h-[calc(100vh-5rem)] overflow-auto';

  return (
    <div className={containerClasses}>
      {isMobile && (
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Filters</h2>
          <Button variant="ghost" size="icon" onClick={onMobileClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      )}

      <form onSubmit={handleSearchSubmit} className="mb-4">
        <div className="relative">
          <Input
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pr-10"
          />
          <Button 
            type="submit" 
            variant="ghost" 
            size="icon" 
            className="absolute right-0 top-0 h-10"
          >
            <Search className="h-4 w-4" />
          </Button>
        </div>
      </form>

      <Accordion type="single" collapsible defaultValue="categories">
        <AccordionItem value="categories">
          <AccordionTrigger>Categories</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-1">
              <Button
                variant={!filterOptions.categoryId ? "secondary" : "outline"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleCategoryChange(undefined)}
              >
                All Categories
              </Button>
              
              {categories.map((category) => (
                <React.Fragment key={category.id}>
                  <Button
                    variant={filterOptions.categoryId === category.id ? "secondary" : "outline"}
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => handleCategoryChange(category.id)}
                  >
                    {category.name}
                  </Button>
                  
                  {category.subcategories?.map((subCategory) => (
                    <Button
                      key={subCategory.id}
                      variant={filterOptions.categoryId === subCategory.id ? "secondary" : "outline"}
                      size="sm"
                      className="w-full justify-start pl-6"
                      onClick={() => handleCategoryChange(subCategory.id)}
                    >
                      {subCategory.name}
                    </Button>
                  ))}
                </React.Fragment>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="price">
          <AccordionTrigger>Price Range</AccordionTrigger>
          <AccordionContent>
            <div className="space-y-4">
              <div className="pt-4">
                <Slider
                  value={[priceRange[0], priceRange[1]]}
                  min={minPrice}
                  max={maxPrice}
                  step={1}
                  onValueChange={handlePriceChange}
                />
              </div>
              
              <div className="flex justify-between">
                <span>${priceRange[0]}</span>
                <span>${priceRange[1]}</span>
              </div>
              
              <Button 
                variant="outline" 
                className="w-full"
                onClick={applyPriceFilter}
              >
                Apply Price Range
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="sort">
          <AccordionTrigger>Sort By</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filterOptions.sortBy || 'popularity'}
              onValueChange={handleSortChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="price_asc">Price: Low to High</SelectItem>
                <SelectItem value="price_desc">Price: High to Low</SelectItem>
                <SelectItem value="newest">Newest First</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="filters">
          <AccordionTrigger>Filter Type</AccordionTrigger>
          <AccordionContent>
            <Select
              value={filterOptions.filterType || 'all'}
              onValueChange={handleFilterTypeChange}
            >
              <SelectTrigger>
                <SelectValue placeholder="Filter by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Products</SelectItem>
                <SelectItem value="bestsellers">Bestsellers</SelectItem>
                <SelectItem value="featured">Featured Items</SelectItem>
                <SelectItem value="newest">New Arrivals</SelectItem>
                <SelectItem value="suggested">User Suggestions</SelectItem>
              </SelectContent>
            </Select>
          </AccordionContent>
        </AccordionItem>
      </Accordion>

      {hasActiveFilters && (
        <Button 
          variant="ghost" 
          className="mt-4 w-full"
          onClick={resetFilters}
        >
          Reset All Filters
        </Button>
      )}

      {isMobile && (
        <Button 
          className="mt-4 w-full"
          onClick={onMobileClose}
        >
          Apply Filters
        </Button>
      )}
    </div>
  );
};
