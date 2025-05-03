
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceCategoryList } from "./ServiceCategoryList";
import { PlusCircle, Check, Wrench } from 'lucide-react';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import { fetchServiceCategories } from '@/lib/serviceHierarchy';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface HierarchicalServiceSelectorProps {
  onServiceSelected: (service: {
    mainCategory: string;
    subcategory: string;
    job: string;
    estimatedTime?: number;
  }) => void;
}

const HierarchicalServiceSelector: React.FC<HierarchicalServiceSelectorProps> = ({ onServiceSelected }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { selectedService, clearSelectedService } = useServiceSelection();

  useEffect(() => {
    // If there's a selected service from the management page, use it
    if (selectedService) {
      onServiceSelected(selectedService);
    }
  }, [selectedService, onServiceSelected]);

  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      try {
        const categories = await fetchServiceCategories();
        setServiceCategories(categories);
      } catch (error) {
        console.error('Error loading service categories:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const handleServiceSelect = (category: string, subcategory: string, service: string, estimatedTime?: number) => {
    onServiceSelected({
      mainCategory: category,
      subcategory: subcategory,
      job: service,
      estimatedTime: estimatedTime || 60 // Default to 1 hour if not provided
    });
    setIsOpen(false);
  };

  return (
    <div>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start text-left font-normal"
          >
            {selectedService ? (
              <div className="flex flex-col items-start text-left">
                <span className="font-medium">{selectedService.job}</span>
                <span className="text-xs text-muted-foreground">
                  {selectedService.mainCategory} - {selectedService.subcategory}
                </span>
              </div>
            ) : (
              <>
                <PlusCircle className="mr-2 h-4 w-4" />
                <span>Select Service</span>
              </>
            )}
          </Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Select a Service</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : serviceCategories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {serviceCategories.map((category) => (
                <div key={category.id} className="space-y-3">
                  <h3 className="font-medium text-lg">{category.name}</h3>
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="space-y-2">
                      <h4 className="text-sm font-medium text-muted-foreground">{subcategory.name}</h4>
                      <ul className="space-y-1">
                        {subcategory.jobs.map((job) => (
                          <li key={job.id}>
                            <Button
                              variant="ghost"
                              className="w-full justify-start text-sm h-8 px-2 group"
                              onClick={() => handleServiceSelect(category.name, subcategory.name, job.name, job.estimatedTime)}
                            >
                              <div className="flex items-center w-full justify-between">
                                <div className="flex items-center">
                                  <Check className="mr-2 h-3 w-3 opacity-0" />
                                  <span>{job.name}</span>
                                </div>
                                {job.estimatedTime && (
                                  <TooltipProvider>
                                    <Tooltip>
                                      <TooltipTrigger asChild>
                                        <span className="text-xs text-muted-foreground ml-2">
                                          ~{Math.round(job.estimatedTime / 60 * 10) / 10}h
                                        </span>
                                      </TooltipTrigger>
                                      <TooltipContent>
                                        <p>Estimated time: {job.estimatedTime} minutes</p>
                                      </TooltipContent>
                                    </Tooltip>
                                  </TooltipProvider>
                                )}
                              </div>
                            </Button>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <p>No service categories found.</p>
              <p className="text-sm mt-1">Visit the Service Management page to create service categories.</p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => window.location.href = '/developer/service-management'}
              >
                <Wrench className="mr-2 h-4 w-4" />
                Go to Service Management
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {selectedService && (
        <Button 
          variant="ghost" 
          size="sm" 
          className="mt-2 text-red-500 hover:text-red-700 w-full justify-start" 
          onClick={clearSelectedService}
        >
          Clear selection
        </Button>
      )}
    </div>
  );
};

export default HierarchicalServiceSelector;
