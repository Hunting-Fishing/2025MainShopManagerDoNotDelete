
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { X, Filter, RotateCcw } from 'lucide-react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface ServiceFilters {
  searchQuery: string;
  selectedCategories: string[];
  priceRange: [number, number];
  hasEstimatedTime: boolean;
  hasPrice: boolean;
  subcategoryFilter: string;
  sortBy: 'name' | 'price' | 'estimatedTime' | 'category';
  sortOrder: 'asc' | 'desc';
}

interface ServiceAdvancedFiltersProps {
  filters: ServiceFilters;
  onFiltersChange: (filters: ServiceFilters) => void;
  categories: ServiceMainCategory[];
  onReset: () => void;
}

export const ServiceAdvancedFilters: React.FC<ServiceAdvancedFiltersProps> = ({
  filters,
  onFiltersChange,
  categories,
  onReset
}) => {
  const updateFilter = <K extends keyof ServiceFilters>(key: K, value: ServiceFilters[K]) => {
    onFiltersChange({
      ...filters,
      [key]: value
    });
  };

  const toggleCategory = (categoryId: string) => {
    const newCategories = filters.selectedCategories.includes(categoryId)
      ? filters.selectedCategories.filter(id => id !== categoryId)
      : [...filters.selectedCategories, categoryId];
    updateFilter('selectedCategories', newCategories);
  };

  const removeCategory = (categoryId: string) => {
    updateFilter('selectedCategories', filters.selectedCategories.filter(id => id !== categoryId));
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Advanced Filters
          </CardTitle>
          <Button variant="outline" size="sm" onClick={onReset}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Reset
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label htmlFor="search">Search Services</Label>
          <Input
            id="search"
            placeholder="Search by name, description..."
            value={filters.searchQuery}
            onChange={(e) => updateFilter('searchQuery', e.target.value)}
          />
        </div>

        {/* Category Selection */}
        <div className="space-y-3">
          <Label>Categories</Label>
          <Select onValueChange={(value) => toggleCategory(value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select categories to filter" />
            </SelectTrigger>
            <SelectContent>
              {categories.map((category) => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {/* Selected Categories */}
          {filters.selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {filters.selectedCategories.map((categoryId) => {
                const category = categories.find(c => c.id === categoryId);
                return (
                  <Badge key={categoryId} variant="secondary" className="pr-1">
                    {category?.name}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-4 w-4 p-0 ml-1"
                      onClick={() => removeCategory(categoryId)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                );
              })}
            </div>
          )}
        </div>

        {/* Price Range */}
        <div className="space-y-3">
          <Label>Price Range: ${filters.priceRange[0]} - ${filters.priceRange[1]}</Label>
          <Slider
            value={filters.priceRange}
            onValueChange={(value) => updateFilter('priceRange', value as [number, number])}
            max={1000}
            min={0}
            step={10}
            className="w-full"
          />
        </div>

        {/* Toggle Filters */}
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="hasPrice">Has Price Set</Label>
            <Switch
              id="hasPrice"
              checked={filters.hasPrice}
              onCheckedChange={(checked) => updateFilter('hasPrice', checked)}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="hasTime">Has Estimated Time</Label>
            <Switch
              id="hasTime"
              checked={filters.hasEstimatedTime}
              onCheckedChange={(checked) => updateFilter('hasEstimatedTime', checked)}
            />
          </div>
        </div>

        {/* Sorting */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Sort By</Label>
            <Select value={filters.sortBy} onValueChange={(value) => updateFilter('sortBy', value as any)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="name">Name</SelectItem>
                <SelectItem value="price">Price</SelectItem>
                <SelectItem value="estimatedTime">Estimated Time</SelectItem>
                <SelectItem value="category">Category</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Sort Order</Label>
            <Select value={filters.sortOrder} onValueChange={(value) => updateFilter('sortOrder', value as any)}>
              <SelectTrigger>
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
    </Card>
  );
};
