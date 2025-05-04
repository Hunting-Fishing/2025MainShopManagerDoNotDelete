
import React, { useState, Dispatch, SetStateAction } from 'react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";

interface ServiceSearchBarProps {
  onSearch: (query: string) => void;
  query?: string;
  onQueryChange?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
}

export const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({ 
  onSearch, 
  query = '', 
  onQueryChange,
  placeholder = "Search categories, services..." 
}) => {
  const [internalQuery, setInternalQuery] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    
    if (onQueryChange) {
      onQueryChange(newQuery);
    } else {
      setInternalQuery(newQuery);
    }
    
    onSearch(newQuery);
  };

  const clearSearch = () => {
    if (onQueryChange) {
      onQueryChange('');
    } else {
      setInternalQuery('');
    }
    onSearch('');
  };

  const currentQuery = query !== undefined ? query : internalQuery;

  return (
    <div className="relative">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8 pr-8"
        value={currentQuery}
        onChange={handleInputChange}
      />
      {currentQuery && (
        <Button
          variant="ghost"
          size="sm"
          className="absolute right-0 top-0 h-9 w-9 p-0"
          onClick={clearSearch}
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Clear search</span>
        </Button>
      )}
    </div>
  );
};
