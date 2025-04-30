import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProductFilterOptions } from '@/types/shopping';
import { Separator } from '@/components/ui/separator';

interface ProductFiltersProps {
  filters: ProductFilterOptions;
  onUpdateFilters: (newFilters: Partial<ProductFilterOptions>) => void;
}

export function ProductFilters({ filters, onUpdateFilters }: ProductFiltersProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  
  const handlePriceChange = (values: number[]) => {
    setPriceRange([values[0], values[1]]);
    onUpdateFilters({
      minPrice: values[0],
      maxPrice: values[1]
    });
  };
  
  const handleSortChange = (value: string) => {
    onUpdateFilters({
      sortBy: value as any
    });
  };

  const handleAvailabilityChange = (checked: boolean | string) => {
    if (typeof checked === 'boolean') {
      onUpdateFilters({
        // This would be implemented depending on your data structure
      });
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Sort By</CardTitle>
        </CardHeader>
        <CardContent>
          <Select 
            value={filters.sortBy || 'popularity'} 
            onValueChange={handleSortChange}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="popularity">Popularity</SelectItem>
              <SelectItem value="price_asc">Price: Low to High</SelectItem>
              <SelectItem value="price_desc">Price: High to Low</SelectItem>
              <SelectItem value="newest">Newest First</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Price Range</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Slider 
              defaultValue={[priceRange[0], priceRange[1]]} 
              max={1000}
              step={5}
              onValueChange={handlePriceChange}
              className="py-6"
            />
            <div className="flex items-center justify-between">
              <span>${priceRange[0]}</span>
              <span>${priceRange[1]}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Availability</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="in-stock" 
                onCheckedChange={handleAvailabilityChange}
              />
              <Label htmlFor="in-stock">In Stock</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="on-sale" 
                onCheckedChange={handleAvailabilityChange}
              />
              <Label htmlFor="on-sale">On Sale</Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Product Type</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="affiliate" 
                onCheckedChange={(checked) => {
                  // Implementation would depend on your filters structure
                }}
              />
              <Label htmlFor="affiliate">Amazon Products</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="suggested" 
                onCheckedChange={(checked) => {
                  // Implementation would depend on your filters structure
                }}
              />
              <Label htmlFor="suggested">User Suggestions</Label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
