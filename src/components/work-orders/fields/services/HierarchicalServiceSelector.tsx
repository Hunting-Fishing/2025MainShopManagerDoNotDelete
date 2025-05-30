
import React, { useState, useMemo } from "react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { ServiceCategoryList } from "./ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./ServiceSubcategoryGrid";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export const HierarchicalServiceSelector: React.FC<HierarchicalServiceSelectorProps> = ({
  categories,
  onServiceSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Filter categories, subcategories, and jobs based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) {
      return categories;
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    
    return categories.map(category => {
      const filteredSubcategories = category.subcategories.map(subcategory => {
        const filteredJobs = subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(lowerSearchTerm) ||
          (job.description && job.description.toLowerCase().includes(lowerSearchTerm))
        );

        // Include subcategory if it matches search or has matching jobs
        const subcategoryMatches = subcategory.name.toLowerCase().includes(lowerSearchTerm) ||
          (subcategory.description && subcategory.description.toLowerCase().includes(lowerSearchTerm));

        if (subcategoryMatches || filteredJobs.length > 0) {
          return {
            ...subcategory,
            jobs: subcategoryMatches ? subcategory.jobs : filteredJobs
          };
        }
        return null;
      }).filter(Boolean) as ServiceSubcategory[];

      // Include category if it matches search or has matching subcategories
      const categoryMatches = category.name.toLowerCase().includes(lowerSearchTerm) ||
        (category.description && category.description.toLowerCase().includes(lowerSearchTerm));

      if (categoryMatches || filteredSubcategories.length > 0) {
        return {
          ...category,
          subcategories: categoryMatches ? category.subcategories : filteredSubcategories
        };
      }
      return null;
    }).filter(Boolean) as ServiceMainCategory[];
  }, [categories, searchTerm]);

  // Get all matching jobs for quick selection
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];

    const results: Array<{ job: ServiceJob; categoryName: string; subcategoryName: string }> = [];
    const lowerSearchTerm = searchTerm.toLowerCase();

    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          if (
            job.name.toLowerCase().includes(lowerSearchTerm) ||
            (job.description && job.description.toLowerCase().includes(lowerSearchTerm))
          ) {
            results.push({
              job,
              categoryName: category.name,
              subcategoryName: subcategory.name
            });
          }
        });
      });
    });

    return results;
  }, [categories, searchTerm]);

  const selectedCategoryData = filteredData.find(cat => cat.name === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    sub => sub.name === selectedSubcategory
  );

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName?: string, subcategoryName?: string) => {
    // If called from search results, use provided category/subcategory names
    if (categoryName && subcategoryName) {
      onServiceSelect(service, categoryName, subcategoryName);
    } else if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory, selectedSubcategory);
    }
    
    // Reset selections and search
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm("");
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    // Reset selections when searching
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search for services (e.g., 'wheel', 'brake', 'oil change')..."
          value={searchTerm}
          onChange={handleSearchChange}
          className="pl-10 pr-4 py-2 w-full"
        />
      </div>

      {/* Search Results - Show when actively searching */}
      {searchTerm.trim() && (
        <div className="border rounded-lg bg-white p-4">
          <h3 className="font-medium text-sm mb-3">Search Results ({searchResults.length})</h3>
          {searchResults.length > 0 ? (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {searchResults.map((result, index) => (
                <Button
                  key={`${result.job.id}-${index}`}
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-left h-auto p-3 border border-gray-100 hover:border-gray-200"
                  onClick={() => handleServiceSelect(result.job, result.categoryName, result.subcategoryName)}
                >
                  <div className="flex flex-col items-start w-full">
                    <span className="font-medium text-sm">{result.job.name}</span>
                    <span className="text-xs text-gray-500">
                      {result.categoryName} → {result.subcategoryName}
                    </span>
                    <div className="flex gap-2 text-xs text-gray-500 mt-1">
                      {result.job.estimatedTime && (
                        <span>{result.job.estimatedTime} min</span>
                      )}
                      {result.job.price && (
                        <span>${result.job.price}</span>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-sm">No services found matching "{searchTerm}"</p>
          )}
        </div>
      )}

      {/* Original Three-Column Layout - Show when not searching */}
      {!searchTerm.trim() && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
          {/* Categories Column */}
          <div className="border rounded-lg bg-white">
            <ServiceCategoryList
              categories={filteredData.map(cat => cat.name)}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Subcategories Column */}
          <div className="border rounded-lg bg-white">
            {selectedCategoryData ? (
              <ServiceSubcategoryGrid
                category={selectedCategory!}
                subcategories={selectedCategoryData.subcategories.map(sub => sub.name)}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={handleSubcategorySelect}
              />
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Select a category to view subcategories</p>
              </div>
            )}
          </div>

          {/* Services Column */}
          <div className="border rounded-lg bg-white">
            {selectedSubcategoryData ? (
              <div className="h-full">
                <div className="p-2 border-b">
                  <h3 className="font-medium text-sm">Services</h3>
                </div>
                <div className="p-2 overflow-y-auto max-h-56">
                  <div className="space-y-2">
                    {selectedSubcategoryData.jobs.map((service) => (
                      <Button
                        key={service.id}
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start text-left h-auto p-2"
                        onClick={() => handleServiceSelect(service)}
                      >
                        <div className="flex flex-col items-start">
                          <span className="font-medium text-sm">{service.name}</span>
                          <div className="flex gap-2 text-xs text-gray-500">
                            {service.estimatedTime && (
                              <span>{service.estimatedTime} min</span>
                            )}
                            {service.price && (
                              <span>${service.price}</span>
                            )}
                          </div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 text-center text-gray-500">
                <p className="text-sm">Select a subcategory to view services</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
