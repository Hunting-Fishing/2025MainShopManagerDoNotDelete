
import React, { useState, useMemo } from 'react';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchResultItem {
  type: 'service' | 'subcategory' | 'category';
  item: ServiceJob | ServiceSubcategory | ServiceMainCategory;
  categoryName: string;
  subcategoryName?: string;
  matchScore: number;
}

interface EnhancedServiceSearchProps {
  value: string;
  onChange: (value: string) => void;
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  placeholder?: string;
}

export const EnhancedServiceSearch: React.FC<EnhancedServiceSearchProps> = ({
  value,
  onChange,
  categories,
  onServiceSelect,
  placeholder = "Search services..."
}) => {
  const [showResults, setShowResults] = useState(false);

  const searchResults = useMemo(() => {
    if (!value.trim()) return [];
    
    const query = value.toLowerCase();
    const results: SearchResultItem[] = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          const nameMatch = job.name.toLowerCase().includes(query);
          const descMatch = job.description?.toLowerCase().includes(query);
          
          if (nameMatch || descMatch) {
            let score = 0;
            if (nameMatch) score += job.name.toLowerCase().indexOf(query) === 0 ? 100 : 50;
            if (descMatch) score += 25;
            
            results.push({
              type: 'service',
              item: job,
              categoryName: category.name,
              subcategoryName: subcategory.name,
              matchScore: score
            });
          }
        });
      });
    });
    
    return results.sort((a, b) => b.matchScore - a.matchScore).slice(0, 10);
  }, [value, categories]);

  const handleServiceSelect = (result: SearchResultItem) => {
    if (result.type === 'service' && result.subcategoryName) {
      onServiceSelect(result.item as ServiceJob, result.categoryName, result.subcategoryName);
      onChange('');
      setShowResults(false);
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    
    const index = text.toLowerCase().indexOf(query.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-yellow-200 px-1 rounded">
          {text.substring(index, index + query.length)}
        </mark>
        {text.substring(index + query.length)}
      </>
    );
  };

  return (
    <div className="relative">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setShowResults(true);
          }}
          onFocus={() => setShowResults(true)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-9"
        />
      </div>

      {showResults && searchResults.length > 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-80 overflow-y-auto">
          <div className="p-2 border-b bg-gray-50">
            <span className="text-xs text-gray-600">
              {searchResults.length} service{searchResults.length !== 1 ? 's' : ''} found
            </span>
          </div>
          
          {searchResults.map((result, index) => {
            const service = result.item as ServiceJob;
            return (
              <Button
                key={`${result.categoryName}-${result.subcategoryName}-${service.id}`}
                variant="ghost"
                className="w-full justify-start p-3 h-auto text-left hover:bg-gray-50"
                onClick={() => handleServiceSelect(result)}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm">
                    {highlightMatch(service.name, value)}
                  </div>
                  {service.description && (
                    <div className="text-xs text-gray-500 mt-1">
                      {highlightMatch(service.description, value)}
                    </div>
                  )}
                  <div className="flex items-center gap-2 mt-2">
                    <Badge variant="outline" className="text-xs">
                      {result.categoryName}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {result.subcategoryName}
                    </Badge>
                    {service.estimatedTime && (
                      <span className="text-xs text-gray-500">
                        {service.estimatedTime} min
                      </span>
                    )}
                    {service.price && (
                      <span className="text-xs font-medium text-green-600">
                        ${service.price}
                      </span>
                    )}
                  </div>
                </div>
              </Button>
            );
          })}
        </div>
      )}

      {showResults && value.trim() && searchResults.length === 0 && (
        <div className="absolute top-full left-0 right-0 z-50 mt-1 bg-white border border-gray-200 rounded-md shadow-lg p-4 text-center text-gray-500">
          No services found for "{value}"
        </div>
      )}
    </div>
  );
};
