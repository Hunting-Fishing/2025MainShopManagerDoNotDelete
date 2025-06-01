
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Search, ArrowLeft, Clock, DollarSign } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { useServiceCategories } from '@/hooks/useServiceCategories';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob & { categoryName: string; subcategoryName: string }) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const { categories, loading, error } = useServiceCategories();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [viewLevel, setViewLevel] = useState<'categories' | 'subcategories' | 'jobs'>('categories');

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-sm text-muted-foreground">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <p className="text-red-600 mb-2">Error loading services</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    category.subcategories.some(sub =>
      sub.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      sub.jobs.some(job =>
        job.name.toLowerCase().includes(searchQuery.toLowerCase())
      )
    )
  );

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setViewLevel('subcategories');
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setViewLevel('jobs');
  };

  const handleJobSelect = (job: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect({
        ...job,
        categoryName: selectedCategory.name,
        subcategoryName: selectedSubcategory.name
      });
    }
  };

  const handleBack = () => {
    if (viewLevel === 'jobs') {
      setViewLevel('subcategories');
      setSelectedSubcategory(null);
    } else if (viewLevel === 'subcategories') {
      setViewLevel('categories');
      setSelectedCategory(null);
    }
  };

  const renderBreadcrumb = () => (
    <div className="flex items-center gap-2 mb-4 text-sm text-muted-foreground">
      <span className={viewLevel === 'categories' ? 'font-medium text-foreground' : 'cursor-pointer hover:text-foreground'} 
            onClick={() => {
              setViewLevel('categories');
              setSelectedCategory(null);
              setSelectedSubcategory(null);
            }}>
        Categories
      </span>
      {selectedCategory && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className={viewLevel === 'subcategories' ? 'font-medium text-foreground' : 'cursor-pointer hover:text-foreground'}
                onClick={() => {
                  setViewLevel('subcategories');
                  setSelectedSubcategory(null);
                }}>
            {selectedCategory.name}
          </span>
        </>
      )}
      {selectedSubcategory && (
        <>
          <ChevronRight className="h-4 w-4" />
          <span className="font-medium text-foreground">{selectedSubcategory.name}</span>
        </>
      )}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Breadcrumb Navigation */}
      {renderBreadcrumb()}

      {/* Back Button */}
      {viewLevel !== 'categories' && (
        <Button variant="ghost" onClick={handleBack} className="mb-2">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      )}

      {/* Categories View */}
      {viewLevel === 'categories' && (
        <div className="grid gap-3">
          {filteredCategories.map((category) => (
            <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleCategorySelect(category)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{category.name}</h3>
                    {category.description && (
                      <p className="text-sm text-muted-foreground mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {category.subcategories.length} subcategories
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subcategories View */}
      {viewLevel === 'subcategories' && selectedCategory && (
        <div className="grid gap-3">
          {selectedCategory.subcategories.map((subcategory) => (
            <Card key={subcategory.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleSubcategorySelect(subcategory)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">{subcategory.name}</h3>
                    {subcategory.description && (
                      <p className="text-sm text-muted-foreground mt-1">{subcategory.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary">
                      {subcategory.jobs.length} services
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Jobs/Services View */}
      {viewLevel === 'jobs' && selectedSubcategory && (
        <div className="grid gap-3">
          {selectedSubcategory.jobs.map((job) => (
            <Card key={job.id} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => handleJobSelect(job)}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium">{job.name}</h3>
                    {job.description && (
                      <p className="text-sm text-muted-foreground mt-1">{job.description}</p>
                    )}
                    <div className="flex items-center gap-4 mt-2">
                      {job.estimatedTime && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{job.estimatedTime} min</span>
                        </div>
                      )}
                      {job.price && (
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <DollarSign className="h-3 w-3" />
                          <span>${job.price}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Empty State */}
      {((viewLevel === 'categories' && filteredCategories.length === 0) ||
        (viewLevel === 'subcategories' && selectedCategory?.subcategories.length === 0) ||
        (viewLevel === 'jobs' && selectedSubcategory?.jobs.length === 0)) && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No items found</p>
        </div>
      )}
    </div>
  );
}
