
import React, { useEffect, useState } from "react";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import HierarchicalServiceSelector from "./services/HierarchicalServiceSelector";
import { useServiceSelection } from "@/hooks/useServiceSelection";
import { ServiceMainCategory } from "@/types/serviceHierarchy";
import { fetchServiceCategories } from "@/lib/services/serviceApi";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Check, Loader2, Wrench, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface WorkOrderInfoSectionProps {
  form: any;
  serviceCategories: string[];
}

export const WorkOrderInfoSection: React.FC<WorkOrderInfoSectionProps> = ({
  form,
  serviceCategories
}) => {
  const { selectedService, clearSelectedService } = useServiceSelection();
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // When a service is selected from the Developer Portal, update the form values
  useEffect(() => {
    if (selectedService) {
      // Set service category to a formatted string that includes the full hierarchy
      form.setValue("serviceCategory", `${selectedService.mainCategory} - ${selectedService.subcategory} - ${selectedService.job}`);
      
      // If estimated time is provided, convert from minutes to hours
      if (selectedService.estimatedTime) {
        form.setValue("estimatedHours", selectedService.estimatedTime / 60);
      }
    }
  }, [selectedService, form]);

  // Load service categories from the database
  useEffect(() => {
    const loadCategories = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedCategories = await fetchServiceCategories();
        console.log("Loaded service categories:", fetchedCategories);
        setCategories(fetchedCategories);
      } catch (error: any) {
        console.error("Error loading service categories:", error);
        setError(error.message || "Failed to load service categories");
        toast.error("Failed to load service categories", {
          description: "Please try again or check your connection"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  // Handle selection from the hierarchical selector
  const handleServiceSelected = (service: {
    mainCategory: string;
    subcategory: string;
    job: string;
    estimatedTime?: number;
  }) => {
    // Update the form values
    form.setValue("serviceCategory", `${service.mainCategory} - ${service.subcategory} - ${service.job}`);
    
    // If we have an estimated time, update that field too
    if (service.estimatedTime) {
      form.setValue("estimatedHours", service.estimatedTime / 60);
    }
  };

  // Filter categories based on search term
  const filteredCategories = searchTerm.trim() === "" 
    ? categories 
    : categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.jobs.some(job => job.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-slate-900">Work Order Details</h3>
      
      <div className="grid grid-cols-1 gap-4">
        <FormField
          control={form.control}
          name="serviceCategory"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="flex items-center">
                Service
                {selectedService && (
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 border-green-200">
                    <Check className="h-3 w-3 mr-1" /> Selected
                  </Badge>
                )}
              </FormLabel>
              <FormControl>
                <div>
                  {/* This hidden input holds the actual form value */}
                  <input type="hidden" {...field} />
                  
                  {/* Our hierarchical selector provides the UI but updates the hidden field */}
                  <HierarchicalServiceSelector
                    onServiceSelected={handleServiceSelected}
                  />
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {isLoading ? (
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-center text-muted-foreground gap-2 py-6">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Loading service categories...</span>
              </div>
            </CardContent>
          </Card>
        ) : error ? (
          <Card className="border-red-200 bg-red-50 dark:bg-red-900/10">
            <CardContent className="pt-6">
              <div className="text-center text-red-600 dark:text-red-400 py-4">
                <p>Failed to load service categories</p>
                <Button 
                  variant="outline" 
                  className="mt-4 border-red-300 text-red-600"
                  onClick={() => window.location.reload()}
                >
                  Retry
                </Button>
              </div>
            </CardContent>
          </Card>
        ) : categories.length > 0 ? (
          <Card className="border border-slate-200 overflow-hidden shadow-sm">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-slate-100 py-4">
              <CardTitle className="text-base flex items-center justify-between">
                <span>Available Service Categories</span>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input 
                    placeholder="Search services..." 
                    className="pl-9 h-9 w-[200px] bg-white border-slate-200"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)} 
                  />
                </div>
              </CardTitle>
              <CardDescription>Select a category to browse available services</CardDescription>
            </CardHeader>
            <CardContent className="p-4 bg-white">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {filteredCategories.length > 0 ? (
                  filteredCategories.map((category) => (
                    <div 
                      key={category.id} 
                      className="flex flex-col p-3 border rounded-lg bg-white hover:border-blue-300 hover:bg-blue-50 transition-all cursor-pointer shadow-sm group"
                      onClick={() => {
                        const firstSubcat = category.subcategories[0];
                        const firstJob = firstSubcat?.jobs[0];
                        if (firstSubcat && firstJob) {
                          handleServiceSelected({
                            mainCategory: category.name,
                            subcategory: firstSubcat.name,
                            job: firstJob.name,
                            estimatedTime: firstJob.estimatedTime
                          });
                        }
                      }}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-medium text-slate-800 group-hover:text-blue-700">{category.name}</h4>
                        <Badge variant="outline" className="text-xs bg-slate-50 border-slate-200">
                          {category.subcategories.length} subcategories
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-1">
                        {category.description || `Service category for ${category.name}`}
                      </p>
                      <div className="mt-2 pt-2 border-t border-dashed border-slate-100">
                        <div className="flex flex-wrap gap-1 overflow-hidden max-h-10">
                          {category.subcategories.slice(0, 3).map(subcategory => (
                            <Badge 
                              key={subcategory.id} 
                              variant="secondary"
                              className="text-[10px] bg-slate-100 text-slate-700 hover:bg-blue-100 hover:text-blue-700 transition-colors"
                            >
                              {subcategory.name}
                            </Badge>
                          ))}
                          {category.subcategories.length > 3 && (
                            <Badge variant="outline" className="text-[10px]">
                              +{category.subcategories.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="mt-2 text-xs justify-start text-blue-600 p-0 h-auto font-normal group-hover:text-blue-800 group-hover:underline"
                      >
                        Browse services
                      </Button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full text-center py-8 text-muted-foreground">
                    <p>No matching service categories found.</p>
                    <p className="text-sm mt-1">Try adjusting your search terms.</p>
                    <Button
                      variant="outline"
                      className="mt-3"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear search
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="text-center text-muted-foreground py-8">
                <Wrench className="h-12 w-12 mx-auto mb-3 text-muted-foreground/50" />
                <p className="font-medium">No service categories found.</p>
                <p className="text-sm mt-1">Visit the Service Management page to create service categories.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => window.location.href = '/developer/service-management'}
                >
                  Go to Service Management
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        <FormField
          control={form.control}
          name="estimatedHours"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Estimated Hours</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  placeholder="Enter estimated hours"
                  className="bg-white"
                  {...field}
                  onChange={(e) => field.onChange(parseFloat(e.target.value))}
                  step="0.1" // Allow decimal hours for more precise estimates
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};
