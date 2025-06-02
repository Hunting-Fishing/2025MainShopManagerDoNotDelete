
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, Plus, Clock, DollarSign } from 'lucide-react';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const data = await fetchServiceCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load service categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const filteredCategories = categories.filter(category =>
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
    // Reset selections after adding a service
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleBackToSubcategories = () => {
    setSelectedSubcategory(null);
  };

  if (isLoading) {
    return (
      <div className="text-center py-8">
        <p className="text-blue-600">Loading services...</p>
      </div>
    );
  }

  const selectedCategoryData = categories.find(cat => cat.id === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(sub => sub.id === selectedSubcategory);

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-400 h-4 w-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 border-blue-200 focus:border-blue-400 focus:ring-blue-400"
        />
      </div>

      {/* Navigation Breadcrumb */}
      {(selectedCategory || selectedSubcategory) && (
        <div className="flex items-center gap-2 text-sm">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToCategories}
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
          >
            Categories
          </Button>
          {selectedCategory && (
            <>
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleBackToSubcategories}
                className="text-blue-600 hover:text-blue-800 hover:bg-blue-100"
              >
                {selectedCategoryData?.name}
              </Button>
            </>
          )}
          {selectedSubcategory && (
            <>
              <ChevronRight className="h-4 w-4 text-blue-400" />
              <span className="text-blue-800 font-medium">{selectedSubcategoryData?.name}</span>
            </>
          )}
        </div>
      )}

      {/* Categories View */}
      {!selectedCategory && (
        <div className="grid gap-3">
          {filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              className="cursor-pointer hover:shadow-md transition-all border-blue-200 hover:border-blue-300"
              onClick={() => handleCategorySelect(category.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-lg text-blue-900">{category.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">{category.description}</p>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {category.subcategories.length} subcategories
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Subcategories View */}
      {selectedCategory && !selectedSubcategory && selectedCategoryData && (
        <div className="grid gap-3">
          {selectedCategoryData.subcategories.map((subcategory) => (
            <Card 
              key={subcategory.id} 
              className="cursor-pointer hover:shadow-md transition-all border-blue-200 hover:border-blue-300"
              onClick={() => handleSubcategorySelect(subcategory.id)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-base text-blue-900">{subcategory.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <p className="text-sm text-blue-700">{subcategory.description}</p>
                  <Badge variant="outline" className="border-blue-300 text-blue-700">
                    {subcategory.services.length} services
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Services View */}
      {selectedSubcategory && selectedSubcategoryData && (
        <div className="grid gap-3">
          {selectedSubcategoryData.services.map((service) => (
            <Card 
              key={service.id} 
              className="cursor-pointer hover:shadow-md transition-all border-blue-200 hover:border-blue-300"
              onClick={() => handleServiceSelect(service, selectedCategoryData!.name, selectedSubcategoryData.name)}
            >
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <h4 className="font-semibold text-blue-900 mb-1">{service.name}</h4>
                    {service.description && (
                      <p className="text-sm text-blue-700 mb-2">{service.description}</p>
                    )}
                    
                    <div className="flex items-center gap-4 text-xs text-blue-600">
                      {service.estimatedTime && (
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>{formatEstimatedTime(service.estimatedTime)}</span>
                        </div>
                      )}
                      {service.price && (
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-3 w-3" />
                          <span>{formatPrice(service.price)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button size="sm" className="ml-4 bg-blue-600 hover:bg-blue-700">
                    <Plus className="h-4 w-4 mr-1" />
                    Add
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
