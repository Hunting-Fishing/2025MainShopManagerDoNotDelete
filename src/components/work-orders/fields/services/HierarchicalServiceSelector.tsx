
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, ArrowLeft } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { useDebounce } from '@/hooks/use-debounce';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

interface SearchResult {
  service: ServiceJob;
  categoryName: string;
  subcategoryName: string;
  categoryId: string;
  subcategoryId: string;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const { categories, loading, error } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Debounce search term to avoid excessive filtering
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Flatten all services for search
  const allServices = useMemo(() => {
    const results: SearchResult[] = [];
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(service => {
          results.push({
            service,
            categoryName: category.name,
            subcategoryName: subcategory.name,
            categoryId: category.id,
            subcategoryId: subcategory.id
          });
        });
      });
    });
    return results;
  }, [categories]);

  // Filter services based on search term
  const filteredServices = useMemo(() => {
    if (!debouncedSearchTerm.trim()) return [];
    
    const searchLower = debouncedSearchTerm.toLowerCase();
    return allServices.filter(result => 
      result.service.name.toLowerCase().includes(searchLower) ||
      result.service.description?.toLowerCase().includes(searchLower) ||
      result.categoryName.toLowerCase().includes(searchLower) ||
      result.subcategoryName.toLowerCase().includes(searchLower)
    );
  }, [allServices, debouncedSearchTerm]);

  const handleServiceSelect = (result: SearchResult) => {
    onServiceSelect(result.service, result.categoryName, result.subcategoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-slate-500">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-sm text-red-500">Error loading services: {error}</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search services, categories, or descriptions..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-4"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearSearch}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0"
          >
            ×
          </Button>
        )}
      </div>

      {/* Search Results */}
      {debouncedSearchTerm.trim() && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">
              Search Results ({filteredServices.length})
            </h4>
            {filteredServices.length > 0 && (
              <Button variant="outline" size="sm" onClick={clearSearch}>
                Browse Categories
              </Button>
            )}
          </div>
          
          {filteredServices.length === 0 ? (
            <div className="text-center py-6 text-slate-500">
              <Search className="h-8 w-8 mx-auto mb-2 text-slate-300" />
              <p className="text-sm">No services found for "{debouncedSearchTerm}"</p>
            </div>
          ) : (
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {filteredServices.map((result, index) => (
                <Card key={`${result.categoryId}-${result.subcategoryId}-${result.service.id}-${index}`} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <CardContent className="p-3" onClick={() => handleServiceSelect(result)}>
                    <div className="space-y-1">
                      <div className="flex items-center text-xs text-slate-500">
                        <span>{result.categoryName}</span>
                        <ChevronRight className="h-3 w-3 mx-1" />
                        <span>{result.subcategoryName}</span>
                      </div>
                      <h5 className="font-medium text-slate-900">{result.service.name}</h5>
                      {result.service.description && (
                        <p className="text-sm text-slate-600">{result.service.description}</p>
                      )}
                      <div className="flex items-center justify-between text-xs text-slate-500">
                        {result.service.estimatedTime && (
                          <span>{result.service.estimatedTime} min</span>
                        )}
                        {result.service.price && (
                          <span>${result.service.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Hierarchical Navigation (when not searching) */}
      {!debouncedSearchTerm.trim() && (
        <div className="space-y-4">
          {/* Navigation Breadcrumbs */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="flex items-center space-x-2 text-sm text-slate-600">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleBackToCategories}
                className="p-0 h-auto"
              >
                Categories
              </Button>
              {selectedCategory && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={selectedSubcategory ? handleBackToSubcategories : undefined}
                    className="p-0 h-auto"
                  >
                    {selectedCategory.name}
                  </Button>
                </>
              )}
              {selectedSubcategory && (
                <>
                  <ChevronRight className="h-3 w-3" />
                  <span>{selectedSubcategory.name}</span>
                </>
              )}
            </div>
          )}

          {/* Back Button */}
          {(selectedCategory || selectedSubcategory) && (
            <Button 
              variant="outline" 
              size="sm" 
              onClick={selectedSubcategory ? handleBackToSubcategories : handleBackToCategories}
              className="mb-4"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          )}

          {/* Main Categories */}
          {!selectedCategory && (
            <div className="grid grid-cols-1 gap-2">
              {categories.map((category) => (
                <Card key={category.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <CardContent className="p-4" onClick={() => setSelectedCategory(category)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium text-slate-900">{category.name}</h4>
                        {category.description && (
                          <p className="text-sm text-slate-600 mt-1">{category.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {category.subcategories.length} subcategories
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Subcategories */}
          {selectedCategory && !selectedSubcategory && (
            <div className="grid grid-cols-1 gap-2">
              {selectedCategory.subcategories.map((subcategory) => (
                <Card key={subcategory.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <CardContent className="p-4" onClick={() => setSelectedSubcategory(subcategory)}>
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-slate-900">{subcategory.name}</h5>
                        {subcategory.description && (
                          <p className="text-sm text-slate-600 mt-1">{subcategory.description}</p>
                        )}
                        <p className="text-xs text-slate-500 mt-2">
                          {subcategory.jobs.length} services
                        </p>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {/* Services */}
          {selectedSubcategory && (
            <div className="grid grid-cols-1 gap-2">
              {selectedSubcategory.jobs.map((service) => (
                <Card key={service.id} className="hover:bg-slate-50 cursor-pointer transition-colors">
                  <CardContent 
                    className="p-4" 
                    onClick={() => onServiceSelect(service, selectedCategory!.name, selectedSubcategory.name)}
                  >
                    <div className="space-y-2">
                      <h6 className="font-medium text-slate-900">{service.name}</h6>
                      {service.description && (
                        <p className="text-sm text-slate-600">{service.description}</p>
                      )}
                      <div className="flex items-center justify-between text-sm text-slate-500">
                        {service.estimatedTime && (
                          <span>Est. {service.estimatedTime} minutes</span>
                        )}
                        {service.price && (
                          <span className="font-medium">${service.price.toFixed(2)}</span>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
