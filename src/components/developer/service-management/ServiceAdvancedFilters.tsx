
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';
import { X, Filter, RefreshCw } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ServiceFilters {
  searchTerm: string;
  searchScope: 'all' | 'name' | 'description' | 'category';
  selectedCategories: string[];
  priceRange: [number, number];
  timeRange: [number, number];
  hasPrice: boolean | null;
  hasEstimatedTime: boolean | null;
  sortBy: 'name' | 'price' | 'time' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface ServiceAdvancedFiltersProps {
  categories: ServiceMainCategory[];
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  onReset: () => void;
  isExpanded: boolean;
  onToggleExpanded: () => void;
}

export const ServiceAdvancedFilters: React.FC<ServiceAdvancedFiltersProps> = ({
  categories,
  filters,
  onFiltersChange,
  onReset,
  isExpanded,
  onToggleExpanded
}) => {
  const updateFilter = (key: keyof ServiceFilters, value: any) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter(id => id !== categoryId)
      : [...filters.selectedCategories, categoryId];
    updateFilter('selectedCategories', newCategories);
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (filters.searchTerm) count++;
    if (filters.selectedCategories.length > 0) count++;
    if (filters.priceRange[0] > 0 || filters.priceRange[1] < 1000) count++;
    if (filters.timeRange[0] > 0 || filters.timeRange[1] < 480) count++;
    if (filters.hasPrice !== null) count++;
    if (filters.hasEstimatedTime !== null) count++;
    return count;
  };

  return (
    <Card className="mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            <CardTitle className="text-lg">Advanced Filters</CardTitle>
            {getActiveFiltersCount() > 0 && (
              <Badge variant="secondary" className="ml-2">
                {getActiveFiltersCount()} active
              </Badge>
            )}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={onReset}
              disabled={getActiveFiltersCount() === 0}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Reset
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onToggleExpanded}
            >
              {isExpanded ? 'Collapse' : 'Expand'}
            </Button>
          </div>
        </div>
      </CardHeader>

      {isExpanded && (
        <CardContent className="space-y-6">
          {/* Search Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Search</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Search services..."
                value={filters.searchTerm}
                onChange={(e) => updateFilter('searchTerm', e.target.value)}
                className="flex-1"
              />
              <Select
                value={filters.searchScope}
                onValueChange={(value) => updateFilter('searchScope', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Fields</SelectItem>
                  <SelectItem value="name">Name Only</SelectItem>
                  <SelectItem value="description">Description</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          {/* Categories Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Categories</Label>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
              {categories.map((category) => (
                <div key={category.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={`category-${category.id}`}
                    checked={filters.selectedCategories.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <Label
                    htmlFor={`category-${category.id}`}
                    className="text-sm cursor-pointer truncate"
                    title={category.name}
                  >
                    {category.name}
                  </Label>
                </div>
              ))}
            </div>
            {filters.selectedCategories.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {filters.selectedCategories.map((categoryId) => {
                  const category = categories.find(c => c.id === categoryId);
                  return category ? (
                    <Badge key={categoryId} variant="secondary" className="text-xs">
                      {category.name}
                      <X 
                        className="h-3 w-3 ml-1 cursor-pointer" 
                        onClick={() => toggleCategory(categoryId)}
                      />
                    </Badge>
                  ) : null;
                })}
              </div>
            )}
          </div>

          <Separator />

          {/* Price Range Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}
            </Label>
            <Slider
              value={filters.priceRange}
              onValueChange={(value) => updateFilter('priceRange', value)}
              max={1000}
              min={0}
              step={5}
              className="w-full"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-price"
                checked={filters.hasPrice === true}
                onCheckedChange={(checked) => 
                  updateFilter('hasPrice', checked ? true : null)
                }
              />
              <Label htmlFor="has-price" className="text-sm">
                Only show services with pricing
              </Label>
            </div>
          </div>

          <Separator />

          {/* Time Range Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">
              Estimated Time: {filters.timeRange[0]}min - {filters.timeRange[1]}min
            </Label>
            <Slider
              value={filters.timeRange}
              onValueChange={(value) => updateFilter('timeRange', value)}
              max={480}
              min={0}
              step={15}
              className="w-full"
            />
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-time"
                checked={filters.hasEstimatedTime === true}
                onCheckedChange={(checked) => 
                  updateFilter('hasEstimatedTime', checked ? true : null)
                }
              />
              <Label htmlFor="has-time" className="text-sm">
                Only show services with time estimates
              </Label>
            </div>
          </div>

          <Separator />

          {/* Sorting Section */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sort Options</Label>
            <div className="flex gap-2">
              <Select
                value={filters.sortBy}
                onValueChange={(value) => updateFilter('sortBy', value)}
              >
                <SelectTrigger className="flex-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="price">Price</SelectItem>
                  <SelectItem value="time">Estimated Time</SelectItem>
                  <SelectItem value="category">Category</SelectItem>
                </SelectContent>
              </Select>
              <Select
                value={filters.sortOrder}
                onValueChange={(value) => updateFilter('sortOrder', value)}
              >
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="asc">Ascending</SelectItem>
                  <SelectItem value="desc">Descending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
};

export default ServiceAdvancedFilters;
