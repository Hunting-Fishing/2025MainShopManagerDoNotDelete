
import React from 'react';
import { Button } from '@/components/ui/button';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Badge } from '@/components/ui/badge';
import { Clock, DollarSign, Plus } from 'lucide-react';

interface ServiceCompactViewProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  maxItems?: number;
}

export function ServiceCompactView({
  categories,
  onServiceSelect,
  selectedServices,
  maxItems = 20
}: ServiceCompactViewProps) {
  // Get all services flattened
  const allServices = categories.flatMap(category =>
    category.subcategories.flatMap(subcategory =>
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name
      }))
    )
  ).slice(0, maxItems);

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Quick Service Selection</h4>
        <Badge variant="outline" className="text-xs">
          {allServices.length} of {categories.reduce((total, cat) => 
            total + cat.subcategories.reduce((subTotal, sub) => 
              subTotal + sub.jobs.length, 0), 0)} services
        </Badge>
      </div>

      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {allServices.map((service) => (
          <div
            key={service.id}
            className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-medium text-sm truncate">{service.name}</span>
                {isServiceSelected(service.id) && (
                  <Badge variant="secondary" className="text-xs">Selected</Badge>
                )}
              </div>
              
              <div className="text-xs text-gray-500 truncate">
                {service.categoryName} → {service.subcategoryName}
              </div>
              
              <div className="flex items-center gap-3 mt-1">
                {service.estimatedTime && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Clock className="h-3 w-3" />
                    {service.estimatedTime}min
                  </div>
                )}
                {service.price && (
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <DollarSign className="h-3 w-3" />
                    ${service.price}
                  </div>
                )}
              </div>
            </div>

            <Button
              size="sm"
              variant={isServiceSelected(service.id) ? "secondary" : "outline"}
              onClick={() => {
                if (!isServiceSelected(service.id)) {
                  onServiceSelect(service, service.categoryName, service.subcategoryName);
                }
              }}
              disabled={isServiceSelected(service.id)}
              className="ml-3 flex-shrink-0"
            >
              <Plus className="h-3 w-3" />
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
