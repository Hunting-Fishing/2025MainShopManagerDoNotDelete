
import React, { useState, useMemo } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SmartServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  categories,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  // Filter categories based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.jobs.some(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [categories, searchTerm]);

  // Get subcategories for selected category
  const subcategories = useMemo(() => {
    if (!selectedCategoryId) return [];
    const category = filteredCategories.find(c => c.id === selectedCategoryId);
    return category?.subcategories || [];
  }, [filteredCategories, selectedCategoryId]);

  // Get services for selected subcategory
  const services = useMemo(() => {
    if (!selectedSubcategoryId) return [];
    const subcategory = subcategories.find(s => s.id === selectedSubcategoryId);
    return subcategory?.jobs || [];
  }, [subcategories, selectedSubcategoryId]);

  // Filter services based on search
  const filteredServices = useMemo(() => {
    if (!searchTerm) return services;
    return services.filter(service =>
      service.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [services, searchTerm]);

  const handleServiceAdd = (service: ServiceJob) => {
    const category = filteredCategories.find(c => c.id === selectedCategoryId);
    const subcategory = subcategories.find(s => s.id === selectedSubcategoryId);
    
    if (category && subcategory) {
      onServiceSelect(service, category.name, subcategory.name);
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId);
  };

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search for services..."
          className="pl-9"
        />
      </div>

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-muted-foreground bg-yellow-50 p-3 rounded-md border border-yellow-200">
          <div>Found {filteredServices.length} services in {subcategories.length} subcategories across {filteredCategories.length} categories</div>
          <div>Searching for: "{searchTerm}"</div>
          {searchTerm && (
            <div className="text-orange-700 mt-1">
              🔍 Enhanced search active - finding services with "{searchTerm}" even when surrounded by other words
            </div>
          )}
        </div>
      )}

      {/* Three Column Layout */}
      <div className="grid grid-cols-3 gap-4 h-96">
        {/* Categories Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Categories ({filteredCategories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {filteredCategories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedSubcategoryId(null);
                  }}
                  className={`w-full text-left p-3 text-sm hover:bg-muted transition-colors ${
                    selectedCategoryId === category.id ? 'bg-blue-50 border-l-4 border-blue-500' : ''
                  }`}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground">
                    Services for {category.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {category.subcategories.length} subcategories
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Subcategories Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Subcategories ({subcategories.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-80 overflow-y-auto">
              {subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  className={`w-full text-left p-3 text-sm hover:bg-muted transition-colors ${
                    selectedSubcategoryId === subcategory.id ? 'bg-green-50 border-l-4 border-green-500' : ''
                  }`}
                >
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="text-xs text-muted-foreground">
                    {subcategory.name} services
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {subcategory.jobs.length} services
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Services Column */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Services ({filteredServices.length})</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 max-h-80 overflow-y-auto p-3">
              {filteredServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-card hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{service.name}</div>
                    {service.description && (
                      <div className="text-xs text-muted-foreground">{service.description}</div>
                    )}
                    <div className="flex items-center gap-2 mt-1">
                      {service.estimatedTime && (
                        <span className="text-xs text-muted-foreground">
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
                  
                  <Button
                    size="sm"
                    variant={isServiceSelected(service.id) ? "secondary" : "outline"}
                    onClick={() => handleServiceAdd(service)}
                    disabled={isServiceSelected(service.id)}
                    className="h-8 w-8 p-0"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
