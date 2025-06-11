
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { useDocumentCategories } from '@/hooks/useDocumentCategories';
import { DocumentSearchParams } from '@/types/document';

interface DocumentSearchFiltersProps {
  onFilterChange: (filters: Partial<DocumentSearchParams>) => void;
  currentFilters: DocumentSearchParams;
}

export function DocumentSearchFilters({ onFilterChange, currentFilters }: DocumentSearchFiltersProps) {
  const { categories } = useDocumentCategories();

  const handleCategoryChange = (value: string) => {
    onFilterChange({ category_id: value === 'all' ? undefined : value });
  };

  const handleTypeChange = (value: string) => {
    onFilterChange({ document_type: value === 'all' ? undefined : value as any });
  };

  const clearAllFilters = () => {
    onFilterChange({
      category_id: undefined,
      document_type: undefined,
      tags: undefined
    });
  };

  const hasActiveFilters = currentFilters.category_id || currentFilters.document_type || (currentFilters.tags && currentFilters.tags.length > 0);

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-4">
        <Select
          value={currentFilters.category_id || 'all'}
          onValueChange={handleCategoryChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category.id} value={category.id}>
                {category.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={currentFilters.document_type || 'all'}
          onValueChange={handleTypeChange}
        >
          <SelectTrigger className="w-48">
            <SelectValue placeholder="All Types" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="pdf">PDF Documents</SelectItem>
            <SelectItem value="image">Images</SelectItem>
            <SelectItem value="weblink">Web Links</SelectItem>
            <SelectItem value="internal_link">Internal Links</SelectItem>
          </SelectContent>
        </Select>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={clearAllFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear Filters
          </Button>
        )}
      </div>

      {hasActiveFilters && (
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-500">Active filters:</span>
          {currentFilters.category_id && (
            <Badge variant="secondary">
              Category: {categories.find(c => c.id === currentFilters.category_id)?.name}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFilterChange({ category_id: undefined })}
              />
            </Badge>
          )}
          {currentFilters.document_type && (
            <Badge variant="secondary">
              Type: {currentFilters.document_type}
              <X 
                className="h-3 w-3 ml-1 cursor-pointer" 
                onClick={() => onFilterChange({ document_type: undefined })}
              />
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}
