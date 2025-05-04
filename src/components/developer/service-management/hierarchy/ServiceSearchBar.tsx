
import React, { useState } from 'react';
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface ServiceSearchBarProps {
  onSearch: (query: string) => void;
}

export const ServiceSearchBar: React.FC<ServiceSearchBarProps> = ({ onSearch }) => {
  const [query, setQuery] = useState('');
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    onSearch(newQuery);
  };

  return (
    <div className="relative max-w-sm">
      <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input
        type="search"
        placeholder="Search categories, services..."
        className="pl-8"
        value={query}
        onChange={handleInputChange}
      />
    </div>
  );
};
