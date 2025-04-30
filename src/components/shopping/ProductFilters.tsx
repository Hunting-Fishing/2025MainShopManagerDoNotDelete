
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { ProductFilterOptions } from '@/types/shopping';
import { formatCurrency } from '@/lib/formatters';
import { Filter, SlidersHorizontal, X, Tag, Check, Star } from 'lucide-react';

interface ProductFiltersProps {
  filters: ProductFilterOptions;
  onUpdateFilters: (filters: Partial<ProductFilterOptions>) => void;
}

export const ProductFilters: React.FC<ProductFiltersProps> = ({ 
  filters, 
  onUpdateFilters 
}) => {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
  };
  
  const applyPriceFilter = () => {
    onUpdateFilters({ 
      minPrice: priceRange[0], 
      maxPrice: priceRange[1] 
    });
  };

  const handleFilterTypeChange = (filterType: ProductFilterOptions['filterType']) => {
    onUpdateFilters({ filterType });
  };

  const handleSortChange = (sortBy: ProductFilterOptions['sortBy']) => {
    onUpdateFilters({ sortBy });
  };
  
  const resetFilters = () => {
    setPriceRange([0, 1000]);
    onUpdateFilters({
      minPrice: undefined,
      maxPrice: undefined,
      filterType: 'all',
      sortBy: 'popularity'
    });
  };

  // Toggle mobile filters panel
  const toggleMobileFilters = () => {
    setShowMobileFilters(!showMobileFilters);
  };

  return (
    <>
      {/* Mobile Filter Toggle */}
      <div className="md:hidden mb-4">
        <Button 
          onClick={toggleMobileFilters} 
          variant="outline"
          className="w-full flex items-center justify-between"
        >
          <span className="flex items-center">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </span>
          {(filters.filterType !== 'all' || filters.minPrice || filters.maxPrice) && (
            <Badge className="ml-2 bg-primary">Active</Badge>
          )}
        </Button>
      </div>

      {/* Filters Content - Hidden on mobile unless toggled */}
      <div className={`${showMobileFilters ? 'block' : 'hidden'} md:block space-y-6`}>
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex justify-between items-center">
              <span className="flex items-center">
                <Filter className="h-5 w-5 mr-2" /> 
                Filters
              </span>
              {(filters.filterType !== 'all' || filters.minPrice || filters.maxPrice) && (
                <Button 
                  size="sm" 
                  variant="ghost"
                  onClick={resetFilters}
                  className="h-8 text-xs flex items-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Reset
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Product Types */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Product Type</h3>
              <div className="space-y-1">
                {[
                  { label: 'All Products', value: 'all' },
                  { label: 'Bestsellers', value: 'bestsellers' },
                  { label: 'Featured', value: 'featured' },
                  { label: 'Newest Arrivals', value: 'newest' },
                  { label: 'Community Suggestions', value: 'suggested' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`filter-${option.value}`} 
                      checked={filters.filterType === option.value}
                      onCheckedChange={() => handleFilterTypeChange(option.value as any)}
                    />
                    <Label 
                      htmlFor={`filter-${option.value}`}
                      className="text-sm cursor-pointer flex items-center"
                    >
                      {option.label}
                      {option.value === 'bestsellers' && <Star className="h-3 w-3 ml-1 fill-amber-400 text-amber-400" />}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Price Range</h3>
              <div className="pt-4 px-1">
                <Slider 
                  defaultValue={[0, 1000]} 
                  min={0} 
                  max={1000} 
                  step={1} 
                  value={priceRange}
                  onValueChange={handlePriceChange}
                />
              </div>
              <div className="flex items-center justify-between pt-2 pb-4">
                <span className="text-xs">{formatCurrency(priceRange[0])}</span>
                <span className="text-xs">{formatCurrency(priceRange[1])}</span>
              </div>
              <Button 
                onClick={applyPriceFilter} 
                size="sm" 
                className="w-full"
              >
                Apply Price Filter
              </Button>
            </div>

            {/* Sort Options */}
            <div className="space-y-2">
              <h3 className="font-medium text-sm">Sort By</h3>
              <div className="space-y-1">
                {[
                  { label: 'Popularity', value: 'popularity' },
                  { label: 'Price: Low to High', value: 'price_asc' },
                  { label: 'Price: High to Low', value: 'price_desc' },
                  { label: 'Newest First', value: 'newest' }
                ].map(option => (
                  <div key={option.value} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`sort-${option.value}`} 
                      checked={filters.sortBy === option.value}
                      onCheckedChange={() => handleSortChange(option.value as any)}
                    />
                    <Label 
                      htmlFor={`sort-${option.value}`}
                      className="text-sm cursor-pointer"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Filters Display */}
            {(filters.filterType !== 'all' || 
              filters.minPrice || 
              filters.maxPrice || 
              filters.sortBy !== 'popularity') && (
              <div className="pt-2 space-y-2">
                <h3 className="font-medium text-sm">Active Filters</h3>
                <div className="flex flex-wrap gap-2">
                  {filters.filterType !== 'all' && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-blue-100 text-blue-800 border-blue-300">
                      {filters.filterType === 'bestsellers' ? 'Bestsellers' : 
                       filters.filterType === 'featured' ? 'Featured' :
                       filters.filterType === 'newest' ? 'Newest' :
                       filters.filterType === 'suggested' ? 'Suggested' : ''}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleFilterTypeChange('all')}
                      />
                    </Badge>
                  )}
                  
                  {(filters.minPrice !== undefined || filters.maxPrice !== undefined) && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-green-100 text-green-800 border-green-300">
                      Price: {formatCurrency(filters.minPrice || 0)} - {formatCurrency(filters.maxPrice || 1000)}
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => onUpdateFilters({ minPrice: undefined, maxPrice: undefined })}
                      />
                    </Badge>
                  )}
                  
                  {filters.sortBy !== 'popularity' && (
                    <Badge variant="secondary" className="flex items-center gap-1 bg-purple-100 text-purple-800 border-purple-300">
                      Sort: {
                        filters.sortBy === 'price_asc' ? 'Price ↑' : 
                        filters.sortBy === 'price_desc' ? 'Price ↓' : 
                        filters.sortBy === 'newest' ? 'Newest' : ''
                      }
                      <X 
                        className="h-3 w-3 cursor-pointer" 
                        onClick={() => handleSortChange('popularity')}
                      />
                    </Badge>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  );
};
