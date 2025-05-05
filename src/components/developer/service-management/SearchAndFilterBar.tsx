
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

interface SearchAndFilterBarProps {
  onSearch: (query: string) => void;
  onFilterChange: (filters: string[]) => void;
  categories: string[];
}

export const SearchAndFilterBar: React.FC<SearchAndFilterBarProps> = ({
  onSearch,
  onFilterChange,
  categories = []
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<string[]>([]);
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    onSearch(value);
  };
  
  const handleFilterToggle = (category: string) => {
    const updatedFilters = selectedFilters.includes(category)
      ? selectedFilters.filter(filter => filter !== category)
      : [...selectedFilters, category];
    
    setSelectedFilters(updatedFilters);
    onFilterChange(updatedFilters);
  };
  
  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };
  
  const clearSearch = () => {
    setSearchQuery('');
    onSearch('');
  };

  return (
    <div className="flex flex-col gap-4 mb-6">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
          <Input
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search services, categories, or descriptions..."
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <button 
              onClick={clearSearch}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" />
              <span>Filter</span>
              {selectedFilters.length > 0 && (
                <Badge className="ml-1 bg-blue-500 text-white">{selectedFilters.length}</Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {categories.map((category) => (
              <DropdownMenuCheckboxItem
                key={category}
                checked={selectedFilters.includes(category)}
                onCheckedChange={() => handleFilterToggle(category)}
              >
                {category}
              </DropdownMenuCheckboxItem>
            ))}
            {selectedFilters.length > 0 && (
              <Button 
                variant="ghost" 
                className="w-full mt-2 text-sm text-gray-600" 
                onClick={clearFilters}
              >
                Clear all filters
              </Button>
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      
      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map(filter => (
            <Badge 
              key={filter} 
              className="px-3 py-1 bg-blue-100 text-blue-800 border border-blue-300 hover:bg-blue-200"
            >
              {filter}
              <X 
                className="ml-2 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterToggle(filter)} 
              />
            </Badge>
          ))}
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-sm text-gray-600" 
            onClick={clearFilters}
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
};
