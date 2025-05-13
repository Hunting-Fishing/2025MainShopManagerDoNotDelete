
import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Check, ChevronRight, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { useQuery } from "@tanstack/react-query";
import { fetchServiceCategories } from "@/lib/services/serviceApi";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    jobId: string;
    jobName: string;
    estimatedTime?: number;
    price?: number;
  }) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const [openCategory, setOpenCategory] = useState(false);
  const [openSubcategory, setOpenSubcategory] = useState(false);
  const [openJob, setOpenJob] = useState(false);

  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);

  // Fetch service categories from the developer portal
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['serviceHierarchy'],
    queryFn: fetchServiceCategories,
  });

  useEffect(() => {
    if (error) {
      toast.error("Failed to load service data");
      console.error("Error loading service hierarchy:", error);
    }
  }, [error]);

  // Reset selected subcategory when category changes
  useEffect(() => {
    setSelectedSubcategory(null);
    setSelectedJob(null);
  }, [selectedCategory]);

  // Reset selected job when subcategory changes
  useEffect(() => {
    setSelectedJob(null);
  }, [selectedSubcategory]);

  // When a job is selected, call the onServiceSelect callback
  useEffect(() => {
    if (selectedCategory && selectedSubcategory && selectedJob) {
      onServiceSelect({
        categoryId: selectedCategory.id,
        categoryName: selectedCategory.name,
        subcategoryId: selectedSubcategory.id,
        subcategoryName: selectedSubcategory.name,
        jobId: selectedJob.id,
        jobName: selectedJob.name,
        estimatedTime: selectedJob.estimatedTime,
        price: selectedJob.price
      });
    }
  }, [selectedJob, selectedCategory, selectedSubcategory, onServiceSelect]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Category Selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Service Category</label>
          <Popover open={openCategory} onOpenChange={setOpenCategory}>
            <PopoverTrigger asChild>
              <Button 
                variant="outline"
                role="combobox"
                aria-expanded={openCategory}
                className="w-full justify-start text-left font-normal"
              >
                {selectedCategory ? (
                  <span>{selectedCategory.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select category...</span>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              {isLoading ? (
                <div className="p-4 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              ) : (
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandList>
                    <CommandEmpty>No categories found</CommandEmpty>
                    <CommandGroup>
                      {categories?.map(category => (
                        <CommandItem
                          key={category.id}
                          value={category.name}
                          onSelect={() => {
                            setSelectedCategory(category);
                            setOpenCategory(false);
                          }}
                        >
                          <Check
                            className={cn(
                              "mr-2 h-4 w-4",
                              selectedCategory?.id === category.id ? "opacity-100" : "opacity-0"
                            )}
                          />
                          {category.name}
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              )}
            </PopoverContent>
          </Popover>
        </div>

        {/* Subcategory Selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Subcategory</label>
          <Popover open={openSubcategory} onOpenChange={setOpenSubcategory}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openSubcategory}
                className="w-full justify-start text-left font-normal"
                disabled={!selectedCategory}
              >
                {selectedSubcategory ? (
                  <span>{selectedSubcategory.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select subcategory...</span>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search subcategories..." />
                <CommandList>
                  <CommandEmpty>No subcategories found</CommandEmpty>
                  <CommandGroup>
                    {selectedCategory?.subcategories.map(subcategory => (
                      <CommandItem
                        key={subcategory.id}
                        value={subcategory.name}
                        onSelect={() => {
                          setSelectedSubcategory(subcategory);
                          setOpenSubcategory(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedSubcategory?.id === subcategory.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        {subcategory.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>

        {/* Job Selection */}
        <div>
          <label className="text-sm font-medium mb-1 block">Service/Job</label>
          <Popover open={openJob} onOpenChange={setOpenJob}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                aria-expanded={openJob}
                className="w-full justify-start text-left font-normal"
                disabled={!selectedSubcategory}
              >
                {selectedJob ? (
                  <span>{selectedJob.name}</span>
                ) : (
                  <span className="text-muted-foreground">Select service/job...</span>
                )}
                <ChevronsUpDown className="ml-auto h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-full p-0" align="start">
              <Command>
                <CommandInput placeholder="Search services/jobs..." />
                <CommandList>
                  <CommandEmpty>No services/jobs found</CommandEmpty>
                  <CommandGroup>
                    {selectedSubcategory?.jobs.map(job => (
                      <CommandItem
                        key={job.id}
                        value={job.name}
                        onSelect={() => {
                          setSelectedJob(job);
                          setOpenJob(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedJob?.id === job.id ? "opacity-100" : "opacity-0"
                          )}
                        />
                        <div className="flex flex-col">
                          <span>{job.name}</span>
                          {job.price && (
                            <span className="text-xs text-muted-foreground">${job.price.toFixed(2)}</span>
                          )}
                        </div>
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
        </div>
      </div>

      {selectedJob && (
        <div className="p-4 border rounded-md bg-slate-50 dark:bg-slate-900">
          <h4 className="font-medium mb-2">{selectedJob.name}</h4>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {selectedJob.description && (
              <div>
                <span className="text-muted-foreground">Description:</span> {selectedJob.description}
              </div>
            )}
            {selectedJob.estimatedTime && (
              <div>
                <span className="text-muted-foreground">Estimated Time:</span> {selectedJob.estimatedTime} mins
              </div>
            )}
            {selectedJob.price && (
              <div>
                <span className="text-muted-foreground">Price:</span> ${selectedJob.price.toFixed(2)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
