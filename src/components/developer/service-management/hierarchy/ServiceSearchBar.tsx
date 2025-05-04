
import React, { useState, Dispatch, SetStateAction } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServiceSearchBarProps {
  onSearch: (query: string) => void;
  query?: string;
  onQueryChange?: Dispatch<SetStateAction<string>>;
  placeholder?: string;
}

export const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({ 
  onSearch, 
  query, 
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

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder={placeholder}
        className="pl-8"
        value={query !== undefined ? query : internalQuery}
        onChange={handleInputChange}
      />
    </div>
  );
};
