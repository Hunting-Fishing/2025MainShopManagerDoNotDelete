
import React, { useState, useMemo } from 'react';
import { Search, X, ChevronRight, Clock, DollarSign } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { useDebounce } from '@/hooks/useDebounce';
import { Card, CardContent } from '@/components/ui/card';

interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function IntegratedServiceSelector({
  categories,
  onServiceSelect
}: IntegratedServiceSelectorProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());
  
  const debouncedSearch = useDebounce(searchQuery, 300);

  // Search logic that filters and highlights matches
  const searchResults = useMemo(() => {
    if (!debouncedSearch.trim()) {
      return { categories: categories, hasResults: false };
    }

    const query = debouncedSearch.toLowerCase();
    const filteredCategories = categories.map(category => {
      const categoryMatches = category.name.toLowerCase().includes(query) ||
                             (category.description?.toLowerCase().includes(query) ?? false);

      const filteredSubcategories = category.subcategories.map(subcategory => {
        const subcategoryMatches = subcategory.name.toLowerCase().includes(query) ||
                                  (subcategory.description?.toLowerCase().includes(query) ?? false);

        const filteredJobs = subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(query) ||
          (job.description?.toLowerCase().includes(query) ?? false)
        );

        if (subcategoryMatches || filteredJobs.length > 0) {
          return { ...subcategory, jobs: filteredJobs, isMatch: subcategoryMatches };
        }
        return null;
      }).filter(Boolean) as ServiceSubcategory[];

      if (categoryMatches || filteredSubcategories.length > 0) {
        return { 
          ...category, 
          subcategories: filteredSubcategories,
          isMatch: categoryMatches 
        };
      }
      return null;
    }).filter(Boolean) as ServiceMainCategory[];

    return { categories: filteredCategories, hasResults: true };
  }, [categories, debouncedSearch]);

  // Auto-expand categories with search results
  React.useEffect(() => {
    if (debouncedSearch && searchResults.hasResults) {
      const newExpandedCategories = new Set<string>();
      const newExpandedSubcategories = new Set<string>();
      
      searchResults.categories.forEach(category => {
        newExpandedCategories.add(category.id);
        category.subcategories.forEach(subcategory => {
          if (subcategory.jobs.length > 0) {
            newExpandedSubcategories.add(subcategory.id);
          }
        });
      });
      
      setExpandedCategories(newExpandedCategories);
      setExpandedSubcategories(newExpandedSubcategories);
    }
  }, [debouncedSearch, searchResults]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(categoryId)) {
        newSet.delete(categoryId);
      } else {
        newSet.add(categoryId);
      }
      return newSet;
    });
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => {
      const newSet = new Set(prev);
      if (newSet.has(subcategoryId)) {
        newSet.delete(subcategoryId);
      } else {
        newSet.add(subcategoryId);
      }
      return newSet;
    });
  };

  const highlightText = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 text-yellow-900 rounded px-1">
          {part}
        </mark>
      ) : part
    );
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  return (
    <div className="space-y-4">
      {/* Always-visible search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search services, categories, or descriptions..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchQuery && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {/* Search status */}
      {searchQuery && (
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {searchResults.categories.length > 0 
              ? `Found results in ${searchResults.categories.length} categor${searchResults.categories.length === 1 ? 'y' : 'ies'}`
              : 'No services found'
            }
          </span>
          {searchResults.categories.length > 0 && (
            <Badge variant="secondary" className="text-xs">
              Search: "{searchQuery}"
            </Badge>
          )}
        </div>
      )}

      {/* Service categories with integrated search results */}
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {(searchQuery ? searchResults.categories : categories).map((category) => {
          const isExpanded = expandedCategories.has(category.id);
          const hasVisibleServices = category.subcategories.some(sub => sub.jobs.length > 0);
          
          return (
            <Card key={category.id} className={`border transition-all ${searchQuery && (category as any).isMatch ? 'ring-2 ring-blue-200' : ''}`}>
              <CardContent className="p-0">
                <button
                  onClick={() => toggleCategory(category.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                  disabled={!hasVisibleServices}
                >
                  <div className="flex items-center space-x-3">
                    <ChevronRight 
                      className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-90' : ''} ${!hasVisibleServices ? 'opacity-50' : ''}`} 
                    />
                    <div className="text-left">
                      <h3 className="font-medium text-gray-900">
                        {highlightText(category.name, searchQuery)}
                      </h3>
                      {category.description && (
                        <p className="text-sm text-gray-500">
                          {highlightText(category.description, searchQuery)}
                        </p>
                      )}
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                  </Badge>
                </button>

                {isExpanded && hasVisibleServices && (
                  <div className="border-t bg-gray-50/50">
                    {category.subcategories.map((subcategory) => {
                      const subIsExpanded = expandedSubcategories.has(subcategory.id);
                      
                      if (subcategory.jobs.length === 0) return null;
                      
                      return (
                        <div key={subcategory.id} className="border-b last:border-b-0">
                          <button
                            onClick={() => toggleSubcategory(subcategory.id)}
                            className="w-full flex items-center justify-between p-3 pl-12 hover:bg-gray-100 transition-colors"
                          >
                            <div className="flex items-center space-x-2">
                              <ChevronRight 
                                className={`h-3 w-3 transition-transform ${subIsExpanded ? 'rotate-90' : ''}`} 
                              />
                              <span className="text-sm font-medium text-gray-700">
                                {highlightText(subcategory.name, searchQuery)}
                              </span>
                            </div>
                            <Badge variant="secondary" className="text-xs">
                              {subcategory.jobs.length}
                            </Badge>
                          </button>

                          {subIsExpanded && (
                            <div className="bg-white">
                              {subcategory.jobs.map((job) => (
                                <div
                                  key={job.id}
                                  className="flex items-center justify-between p-3 pl-16 hover:bg-blue-50 border-b last:border-b-0"
                                >
                                  <div className="flex-1">
                                    <h4 className="text-sm font-medium text-gray-900">
                                      {highlightText(job.name, searchQuery)}
                                    </h4>
                                    {job.description && (
                                      <p className="text-xs text-gray-500 mt-1">
                                        {highlightText(job.description, searchQuery)}
                                      </p>
                                    )}
                                    <div className="flex items-center space-x-3 mt-1">
                                      {job.estimatedTime && (
                                        <div className="flex items-center space-x-1 text-xs text-gray-500">
                                          <Clock className="h-3 w-3" />
                                          <span>{job.estimatedTime} min</span>
                                        </div>
                                      )}
                                      {job.price && (
                                        <div className="flex items-center space-x-1 text-xs text-green-600">
                                          <DollarSign className="h-3 w-3" />
                                          <span>${job.price}</span>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                  <Button
                                    size="sm"
                                    onClick={() => handleServiceSelect(job, category.name, subcategory.name)}
                                    className="ml-3"
                                  >
                                    Add
                                  </Button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* No results state */}
      {searchQuery && searchResults.categories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>No services found for "{searchQuery}"</p>
          <p className="text-sm">Try searching for different keywords or browse categories above</p>
        </div>
      )}
    </div>
  );
}
