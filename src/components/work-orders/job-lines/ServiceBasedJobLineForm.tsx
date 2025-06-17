
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServicesSection } from '@/components/work-orders/fields/ServicesSection';
import { SelectedService } from '@/types/selectedService';
import { ServiceJob } from '@/types/service';
import { Search } from 'lucide-react';

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
  const [searchQuery, setSearchQuery] = useState('');

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      estimated_hours: service.estimatedTime ? service.estimatedTime / 60 : 0, // Convert minutes to hours
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

  // Search statistics for feedback
  const searchStats = useMemo(() => {
    if (!searchQuery.trim()) return null;
    
    return {
      query: searchQuery,
      totalResults: selectedServices.length
    };
  }, [searchQuery, selectedServices.length]);

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Select Services</h3>
        <p className="text-sm text-muted-foreground">
          Choose from our service catalog to add job lines to this work order
        </p>
      </div>

      {/* Enhanced Search Input */}
      <div className="space-y-2">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services... (e.g., brake, oil, tire, caliper)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        {searchStats && (
          <div className="text-xs text-muted-foreground">
            {searchStats.totalResults > 0 ? (
              <span>Found services matching "{searchStats.query}"</span>
            ) : (
              <span>No services found for "{searchStats.query}"</span>
            )}
          </div>
        )}
      </div>

      <div className="max-h-96 overflow-y-auto">
        <ServicesSection
          onServiceSelect={handleServiceSelect}
          selectedServices={selectedServices}
          onUpdateServices={handleUpdateServices}
        />
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
