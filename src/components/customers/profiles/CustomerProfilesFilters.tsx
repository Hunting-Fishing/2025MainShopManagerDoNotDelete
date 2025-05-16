
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, X } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CustomerFilters } from '@/components/customers/filters/CustomerFilterControls';

interface CustomerProfilesFiltersProps {
  filters: CustomerFilters;
  onFilterChange: (filters: CustomerFilters) => void;
}

export function CustomerProfilesFilters({ filters, onFilterChange }: CustomerProfilesFiltersProps) {
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  
  // Handle search input changes
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value
    });
  };
  
  // Add a tag filter
  const handleAddTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      onFilterChange({
        ...filters,
        tags: [...filters.tags, tag]
      });
    }
  };
  
  // Remove a tag filter
  const handleRemoveTag = (tag: string) => {
    onFilterChange({
      ...filters,
      tags: filters.tags.filter(t => t !== tag)
    });
  };
  
  // Clear all filters
  const clearFilters = () => {
    onFilterChange({
      searchQuery: '',
      tags: []
    });
  };
  
  // Common tag options
  const commonTags = ['VIP', 'New', 'Fleet', 'Business', 'Residential', 'Inactive'];
  
  return (
    <div className="bg-white dark:bg-slate-800 shadow-md rounded-xl border border-gray-100 dark:border-gray-700 p-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4">
        {/* Search input */}
        <div className="relative flex-grow">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search customers..."
            value={filters.searchQuery}
            onChange={handleSearchChange}
            className="pl-10 bg-gray-50 dark:bg-slate-900 border-gray-200 dark:border-gray-700"
          />
        </div>
        
        {/* Tag filter dropdown */}
        <Popover open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="outline" 
              className="flex items-center"
              aria-label="Filter by tags"
            >
              <Filter className="mr-2 h-4 w-4" />
              Filter Tags
              {filters.tags.length > 0 && (
                <Badge className="ml-2 bg-primary text-white" variant="secondary">
                  {filters.tags.length}
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-4" align="end">
            <div className="space-y-4">
              <h4 className="font-medium text-sm">Filter by tags</h4>
              <div className="flex flex-wrap gap-2">
                {commonTags.map(tag => (
                  <Badge 
                    key={tag}
                    variant={filters.tags.includes(tag) ? "default" : "outline"}
                    className={`cursor-pointer hover:bg-primary/90 ${
                      filters.tags.includes(tag) 
                        ? "bg-primary text-white" 
                        : "bg-gray-50 text-gray-700 hover:text-white"
                    }`}
                    onClick={() => 
                      filters.tags.includes(tag) 
                        ? handleRemoveTag(tag) 
                        : handleAddTag(tag)
                    }
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
              
              <div className="flex justify-between pt-2 border-t">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={clearFilters}
                  disabled={!filters.searchQuery && filters.tags.length === 0}
                >
                  Clear all
                </Button>
                <Button size="sm" onClick={() => setIsFiltersOpen(false)}>
                  Apply
                </Button>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      
      {/* Active filter badges */}
      {(filters.tags.length > 0) && (
        <div className="flex flex-wrap gap-2 mt-4">
          {filters.tags.map(tag => (
            <Badge key={tag} variant="secondary" className="bg-blue-100 text-blue-800 border border-blue-300 px-3 py-1">
              {tag}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleRemoveTag(tag)}
              />
            </Badge>
          ))}
          
          {(filters.searchQuery || filters.tags.length > 0) && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-xs h-7 px-2" 
              onClick={clearFilters}
            >
              Clear all
            </Button>
          )}
        </div>
      )}
    </div>
  );
}
