
import { useState } from 'react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Filter, X } from "lucide-react";

interface FilterProps {
  onFilterChange: (filters: any) => void;
  activeFilters?: string[];
}

export function EnhancedProductFilters({ onFilterChange, activeFilters = [] }: FilterProps) {
  const [selectedFilters, setSelectedFilters] = useState<string[]>(activeFilters);

  const categories = [
    "Electronics", "Clothing", "Home & Garden", "Books", "Sports"
  ];

  const handleFilterSelect = (category: string) => {
    const newFilters = selectedFilters.includes(category)
      ? selectedFilters.filter(f => f !== category)
      : [...selectedFilters, category];
    
    setSelectedFilters(newFilters);
    onFilterChange(newFilters);
  };

  const clearFilters = () => {
    setSelectedFilters([]);
    onFilterChange([]);
  };

  return (
    <div className="sticky top-0 z-10 mb-6 flex flex-wrap items-center gap-2 bg-white/80 backdrop-blur-sm p-3 shadow-sm border border-gray-200 rounded-xl">
      <div className="relative flex-1 min-w-[200px]">
        <Input 
          placeholder="Search products..." 
          className="pl-9 rounded-full border-gray-200 hover:border-gray-300 transition-colors"
        />
        <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
      </div>
      
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button 
            variant="outline" 
            className="rounded-full border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-all"
          >
            <Filter className="mr-2 h-4 w-4" />
            Categories
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          <DropdownMenuLabel>Select Categories</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {categories.map((category) => (
            <DropdownMenuItem
              key={category}
              onClick={() => handleFilterSelect(category)}
              className="cursor-pointer"
            >
              {category}
              {selectedFilters.includes(category) && (
                <span className="ml-auto">✓</span>
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>

      {selectedFilters.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedFilters.map(filter => (
            <Badge 
              key={filter}
              variant="secondary" 
              className="rounded-full bg-gray-100 text-gray-800 hover:bg-gray-200"
            >
              {filter}
              <X 
                className="ml-1 h-3 w-3 cursor-pointer" 
                onClick={() => handleFilterSelect(filter)}
              />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            Clear all
          </Button>
        </div>
      )}
    </div>
  );
}
