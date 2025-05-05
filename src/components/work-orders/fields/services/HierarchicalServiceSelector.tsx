
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceCategoryList } from "./ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./ServiceSubcategoryGrid";
import { PlusCircle, Check, Wrench, Loader2 } from 'lucide-react';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';

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
  const [checkedServices, setCheckedServices] = useState<Record<string, boolean>>({});
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
        console.log("Loaded categories for selector:", categories);
        setServiceCategories(categories);
        
        // Select the first category by default if available
        if (categories.length > 0 && !selectedCategory) {
          setSelectedCategory(categories[0].name);
        }
      } catch (error) {
        console.error('Error loading service categories:', error);
        toast.error("Failed to load service categories", {
          description: "Please try again or contact support"
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      loadCategories();
    }
  }, [isOpen]);

  const handleCategorySelect = (categoryName: string) => {
    console.log("Selected category:", categoryName);
    setSelectedCategory(categoryName);
  };

  const handleServiceCheck = (serviceName: string, checked: boolean) => {
    console.log(`Service ${serviceName} checked: ${checked}`);
    
    setCheckedServices(prev => ({
      ...prev,
      [serviceName]: checked
    }));

    if (checked && selectedCategory) {
      // Find the selected category and subcategory
      const category = serviceCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        // Find which subcategory this service belongs to
        let foundSubcategory = null;
        
        for (const subcategory of category.subcategories) {
          const matchingJob = subcategory.jobs.find(job => job.name === serviceName);
          if (matchingJob) {
            foundSubcategory = subcategory;
            onServiceSelected({
              mainCategory: category.name,
              subcategory: subcategory.name,
              job: serviceName,
              estimatedTime: matchingJob.estimatedTime
            });
            setIsOpen(false);
            break;
          }
        }
      }
    }
  };

  const getSelectedCategoryObject = () => {
    if (!selectedCategory) return null;
    return serviceCategories.find(cat => cat.name === selectedCategory) || null;
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
        <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-hidden w-[95vw]">
          <DialogHeader>
            <DialogTitle>Select a Service</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : serviceCategories.length > 0 ? (
            <div className="flex flex-col md:flex-row h-[500px] md:h-[550px] overflow-hidden">
              <ServiceCategoryList 
                categories={serviceCategories}
                selectedCategory={selectedCategory}
                onCategorySelect={handleCategorySelect}
              />
              
              {selectedCategory && getSelectedCategoryObject() && (
                <ServiceSubcategoryGrid 
                  category={getSelectedCategoryObject()!}
                  checkedServices={checkedServices}
                  onServiceCheck={handleServiceCheck}
                />
              )}
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
