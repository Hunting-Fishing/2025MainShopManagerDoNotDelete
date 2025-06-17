
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EnhancedServiceSelector } from '@/components/work-orders/fields/services/EnhancedServiceSelector';
import { SelectedService } from '@/types/selectedService';
import { ServiceJob } from '@/types/service';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { SearchInput } from '@/components/work-orders/fields/services/SearchInput';
import { useServiceSearch } from '@/hooks/useServiceSearch';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSubmit,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const { sectors, loading, error } = useServiceSectors();

  // Convert sectors to categories for search hook
  const categories = sectors.flatMap(sector => sector.categories);
  
  // Use the search hook for filtering
  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(categories);

  // Convert filtered categories back to sectors format for EnhancedServiceSelector
  const filteredSectors = sectors.map(sector => ({
    ...sector,
    categories: filteredCategories.filter(category => 
      sector.categories.some(originalCategory => originalCategory.id === category.id)
    )
  })).filter(sector => sector.categories.length > 0);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      estimated_hours: service.estimatedTime ? service.estimatedTime / 60 : 0,
      labor_rate: service.price || 0,
      total_amount: service.price || 0,
      category: categoryName,
      subcategory: subcategoryName,
      categoryName: categoryName,
      subcategoryName: subcategoryName,
      status: 'pending',
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    setSelectedServices(prev => [...prev, newService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    const jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[] = selectedServices.map((service, index) => ({
      work_order_id: workOrderId,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory,
      description: service.description,
      estimated_hours: service.estimated_hours,
      labor_rate: service.labor_rate,
      labor_rate_type: 'standard',
      total_amount: service.total_amount,
      status: 'pending',
      display_order: index,
      notes: ''
    }));

    onSubmit(jobLines);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Select Services</h3>
        <p className="text-sm text-muted-foreground">
          Choose from our service catalog to add job lines to this work order
        </p>
      </div>

      {/* Enhanced Search Bar */}
      <div className="space-y-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search services (e.g., caliper, brake, oil change)..."
          suggestions={suggestions}
          onSuggestionSelect={setSearchQuery}
        />
        
        {/* Search Stats */}
        {searchStats && (
          <div className="text-xs text-gray-500 flex items-center gap-4">
            <span>Found: {searchStats.jobs} services</span>
            <span>in {searchStats.subcategories} subcategories</span>
            <span>across {searchStats.categories} categories</span>
            {searchStats.highRelevanceJobs > 0 && (
              <span className="text-green-600 font-medium">
                {searchStats.highRelevanceJobs} exact matches
              </span>
            )}
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        {filteredSectors.length > 0 ? (
          <EnhancedServiceSelector
            sectors={filteredSectors}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            onRemoveService={handleRemoveService}
            onUpdateServices={handleUpdateServices}
          />
        ) : isSearching ? (
          <div className="text-center py-8 text-gray-500">
            <p>No services found matching "{searchQuery}"</p>
            <p className="text-sm">Try different keywords or check spelling</p>
          </div>
        ) : (
          <EnhancedServiceSelector
            sectors={sectors}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            onRemoveService={handleRemoveService}
            onUpdateServices={handleUpdateServices}
          />
        )}
      </div>

      {selectedServices.length > 0 && (
        <div className="border-t pt-4">
          <h4 className="font-medium mb-2">Selected Services ({selectedServices.length})</h4>
          <div className="space-y-2 max-h-32 overflow-y-auto">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex justify-between items-center text-sm p-2 bg-muted rounded">
                <div>
                  <span className="font-medium">{service.name}</span>
                  <span className="text-muted-foreground ml-2">
                    {service.category} › {service.subcategory}
                  </span>
                </div>
                <span className="font-medium">${service.total_amount}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedServices.length === 0}
        >
          Add {selectedServices.length} Job Line{selectedServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
