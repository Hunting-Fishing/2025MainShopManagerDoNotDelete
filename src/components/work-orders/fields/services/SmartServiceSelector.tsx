
import React, { useState, useMemo } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { ServiceSearch } from './ServiceSearch';
import { ServiceCategoryList } from './ServiceCategoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface SmartServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  categories,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Filter and highlight categories based on search term
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    const query = searchTerm.toLowerCase();
    
    return categories.map(category => {
      const filteredSubcategories = category.subcategories.map(subcategory => {
        const matchingJobs = subcategory.jobs.filter(job => 
          job.name.toLowerCase().includes(query) || 
          job.description?.toLowerCase().includes(query)
        );
        
        // Include subcategory if it has matching jobs or its name matches
        const subcategoryMatches = subcategory.name.toLowerCase().includes(query);
        
        return {
          ...subcategory,
          jobs: matchingJobs.length > 0 ? matchingJobs : (subcategoryMatches ? subcategory.jobs : [])
        };
      }).filter(sub => sub.jobs.length > 0);

      // Include category if it has matching subcategories or its name matches
      const categoryMatches = category.name.toLowerCase().includes(query);
      
      return {
        ...category,
        subcategories: filteredSubcategories.length > 0 ? filteredSubcategories : (categoryMatches ? category.subcategories : [])
      };
    }).filter(cat => cat.subcategories.length > 0);
  }, [categories, searchTerm]);

  // Auto-expand categories and subcategories that have matches
  const expandedCategories = useMemo(() => {
    if (!searchTerm.trim()) return [];
    return filteredCategories.map(cat => cat.id);
  }, [filteredCategories, searchTerm]);

  const expandedSubcategories = useMemo(() => {
    if (!searchTerm.trim()) return [];
    const expanded: string[] = [];
    filteredCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        expanded.push(subcategory.id);
      });
    });
    return expanded;
  }, [filteredCategories, searchTerm]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
    // Don't clear search on selection to allow multiple selections
  };

  return (
    <Card className="bg-card border shadow-sm">
      <CardHeader className="bg-card border-b">
        <CardTitle>Select Services</CardTitle>
        <div className="space-y-4">
          <ServiceSearch
            value={searchTerm}
            onChange={setSearchTerm}
            placeholder="Search services by name or category..."
          />
          {searchTerm && (
            <div className="text-sm text-muted-foreground">
              {filteredCategories.length > 0 
                ? `Found ${filteredCategories.reduce((total, cat) => 
                    total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0
                  )} services in ${filteredCategories.length} categories`
                : 'No services found matching your search'
              }
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className="bg-card p-6">
        <ServiceCategoryList
          categories={filteredCategories}
          selectedServices={selectedServices}
          onServiceSelect={onServiceSelect}
          onRemoveService={onRemoveService || (() => {})}
          onUpdateServices={onUpdateServices || (() => {})}
          expandedCategories={expandedCategories}
          expandedSubcategories={expandedSubcategories}
          searchHighlight={searchTerm}
        />
      </CardContent>
    </Card>
  );
};
