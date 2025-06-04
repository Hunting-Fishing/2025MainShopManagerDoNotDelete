
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { getCategoryColor } from '@/utils/categoryColors';
import { Search, Plus, Clock, DollarSign } from 'lucide-react';

interface CompactServiceSelectorProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function CompactServiceSelector({
  categories,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices
}: CompactServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');

  // Flatten all services for compact view
  const allServices = categories.flatMap(category =>
    category.subcategories.flatMap(subcategory =>
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name,
        categoryId: category.id,
        subcategoryId: subcategory.id
      }))
    )
  );

  // Filter services based on search
  const filteredServices = allServices.filter(service =>
    service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.categoryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.subcategoryName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  const handleServiceToggle = (service: any) => {
    if (isServiceSelected(service.id)) {
      const selectedService = selectedServices.find(s => s.serviceId === service.id);
      if (selectedService) {
        onRemoveService(selectedService.id);
      }
    } else {
      onServiceSelect(service, service.categoryName, service.subcategoryName);
    }
  };

  console.log('🔍 CompactServiceSelector:', {
    totalServices: allServices.length,
    filteredServices: filteredServices.length,
    selectedCount: selectedServices.length,
    searchTerm
  });

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Stats */}
      <div className="text-sm text-gray-600">
        Showing {filteredServices.length} of {allServices.length} services
        {selectedServices.length > 0 && ` • ${selectedServices.length} selected`}
      </div>

      {/* Compact Service Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 max-h-96 overflow-y-auto">
        {filteredServices.map((service) => {
          const isSelected = isServiceSelected(service.id);
          const categoryColorClasses = getCategoryColor(service.categoryName);

          return (
            <Card 
              key={service.id} 
              className={`cursor-pointer transition-all duration-200 hover:shadow-md ${
                isSelected ? 'ring-2 ring-blue-500 bg-blue-50' : ''
              }`}
              onClick={() => handleServiceToggle(service)}
            >
              <CardContent className="p-3">
                <div className="space-y-2">
                  {/* Category and Subcategory */}
                  <div className="flex items-center gap-1 flex-wrap">
                    <Badge className={`${categoryColorClasses} text-xs`}>
                      {service.categoryName}
                    </Badge>
                    <span className="text-xs text-gray-400">→</span>
                    <Badge variant="outline" className="text-xs">
                      {service.subcategoryName}
                    </Badge>
                  </div>

                  {/* Service Name */}
                  <h4 className="font-medium text-sm leading-tight">
                    {service.name}
                  </h4>

                  {/* Description */}
                  {service.description && (
                    <p className="text-xs text-gray-600 line-clamp-2">
                      {service.description}
                    </p>
                  )}

                  {/* Time and Price */}
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    {service.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{service.estimatedTime}m</span>
                      </div>
                    )}
                    {service.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        <span>${service.price}</span>
                      </div>
                    )}
                  </div>

                  {/* Action Button */}
                  <Button
                    size="sm"
                    variant={isSelected ? "secondary" : "outline"}
                    className="w-full text-xs h-7"
                  >
                    {isSelected ? (
                      <>✓ Selected</>
                    ) : (
                      <>
                        <Plus className="h-3 w-3 mr-1" />
                        Add
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredServices.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          {searchTerm ? 'No services found matching your search' : 'No services available'}
        </div>
      )}
    </div>
  );
}
