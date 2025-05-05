
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ServiceCategoryList } from "./ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./ServiceSubcategoryGrid";
import { PlusCircle, Check, Wrench, Loader2, Filter } from 'lucide-react';
import { useServiceSelection } from '@/hooks/useServiceSelection';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  const [searchQuery, setSearchQuery] = useState("");
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
            <DialogTitle>Service Hierarchy</DialogTitle>
          </DialogHeader>
          
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <span className="text-muted-foreground">Loading services...</span>
            </div>
          ) : serviceCategories.length > 0 ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div className="relative flex-1">
                  <Input
                    placeholder="Search services, categories, or descriptions..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-3 pr-10"
                  />
                </div>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="h-4 w-4" />
                  <span>Filter</span>
                </Button>
                <Badge variant="outline" className="bg-muted/70 text-xs">
                  {serviceCategories.length} Categories
                </Badge>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs">
                      {serviceCategories.reduce((total, cat) => 
                        total + cat.subcategories.reduce((subtotal, sub) => subtotal + sub.jobs.length, 0), 0)
                      } Services
                    </Badge>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Total number of services across all categories</p>
                  </TooltipContent>
                </Tooltip>
              </div>
              
              <Tabs defaultValue="categories" className="w-full">
                <TabsList className="bg-white rounded-full p-1 border shadow-sm mb-4">
                  <TabsTrigger value="categories" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    Categories
                  </TabsTrigger>
                  <TabsTrigger value="services" className="rounded-full text-sm px-4 py-2 data-[state=active]:bg-blue-600 data-[state=active]:text-white">
                    All Services
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="categories" className="mt-0">
                  <div className="flex flex-col md:flex-row h-[500px] md:h-[550px] overflow-hidden border rounded-lg">
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
                </TabsContent>
                
                <TabsContent value="services" className="mt-0">
                  <div className="h-[500px] md:h-[550px] overflow-auto border rounded-lg p-4">
                    <p className="text-sm text-muted-foreground text-center py-8">
                      Coming soon: View all services in a single list
                    </p>
                  </div>
                </TabsContent>
              </Tabs>
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
