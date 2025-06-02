
import React from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ServiceCompactViewProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function ServiceCompactView({ 
  categories, 
  selectedServices, 
  onServiceSelect 
}: ServiceCompactViewProps) {
  const allJobs = categories.flatMap(category =>
    category.subcategories.flatMap(subcategory =>
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name
      }))
    )
  );

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  return (
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground mb-4">
        {allJobs.length} services available
      </div>
      
      <div className="grid gap-2 max-h-96 overflow-y-auto">
        {allJobs.map((job) => (
          <div
            key={job.id}
            className={`flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors ${
              isSelected(job.id) ? 'bg-blue-50 border-blue-200' : ''
            }`}
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-medium text-sm truncate">{job.name}</h4>
                <span className="text-xs text-muted-foreground">
                  {job.categoryName} → {job.subcategoryName}
                </span>
              </div>
              {job.description && (
                <p className="text-xs text-muted-foreground mt-1 truncate">
                  {job.description}
                </p>
              )}
              <div className="flex items-center gap-4 mt-1">
                {job.estimatedTime && (
                  <span className="text-xs text-muted-foreground">
                    {job.estimatedTime} min
                  </span>
                )}
                {job.price && (
                  <span className="text-xs font-medium text-green-600">
                    ${job.price}
                  </span>
                )}
              </div>
            </div>
            
            <Button
              size="sm"
              variant={isSelected(job.id) ? "secondary" : "outline"}
              onClick={() => onServiceSelect(job, job.categoryName, job.subcategoryName)}
              disabled={isSelected(job.id)}
              className="ml-2 shrink-0"
            >
              {isSelected(job.id) ? 'Added' : <Plus className="h-4 w-4" />}
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}
