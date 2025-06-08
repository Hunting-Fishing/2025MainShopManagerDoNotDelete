import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { EnhancedServiceSearch } from './EnhancedServiceSearch';
import { ServiceCategoryList } from './ServiceCategoryList';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  // Auto-expand categories and subcategories when search finds matches
  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    if (value.trim()) {
      const query = value.toLowerCase();
      const categoriesToExpand: string[] = [];
      const subcategoriesToExpand: string[] = [];
      categories.forEach(category => {
        let categoryHasMatches = false;
        category.subcategories.forEach(subcategory => {
          const hasMatchingJobs = subcategory.jobs.some(job => job.name.toLowerCase().includes(query) || job.description?.toLowerCase().includes(query));
          if (hasMatchingJobs) {
            categoryHasMatches = true;
            subcategoriesToExpand.push(subcategory.id);
          }
        });
        if (categoryHasMatches) {
          categoriesToExpand.push(category.id);
        }
      });
      setExpandedCategories(categoriesToExpand);
      setExpandedSubcategories(subcategoriesToExpand);
    }
  };
  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
    setSearchTerm('');
  };
  const filteredCategories = React.useMemo(() => {
    if (!searchTerm.trim()) return categories;
    const query = searchTerm.toLowerCase();
    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job => job.name.toLowerCase().includes(query) || job.description?.toLowerCase().includes(query))
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0);
  }, [categories, searchTerm]);
  return <Card className="bg-card border shadow-sm">
      <CardHeader className="bg-card border-b">
        <CardTitle>Select Services</CardTitle>
        <Tabs defaultValue="search" className="w-full bg-white rounded-md">
          <TabsList className="grid w-full grid-cols-2 bg-muted">
            <TabsTrigger value="search" className="bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Smart Search</TabsTrigger>
            <TabsTrigger value="browse" className="bg-background data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">Browse Categories</TabsTrigger>
          </TabsList>
          
          <TabsContent value="search" className="space-y-4 bg-card">
            <div className="bg-card p-4 rounded-md border">
              <EnhancedServiceSearch value={searchTerm} onChange={handleSearchChange} categories={categories} onServiceSelect={handleServiceSelect} placeholder="Type to search services (e.g., 'brake line', 'oil change')..." />
            </div>
            
            {searchTerm.trim() && filteredCategories.length > 0 && <div className="mt-4 bg-card p-4 rounded-md border">
                <h4 className="text-sm font-medium mb-2">
                  Search Results in Categories:
                </h4>
                <ServiceCategoryList categories={filteredCategories} selectedServices={selectedServices} onServiceSelect={onServiceSelect} onRemoveService={onRemoveService || (() => {})} onUpdateServices={onUpdateServices || (() => {})} expandedCategories={expandedCategories} expandedSubcategories={expandedSubcategories} searchHighlight={searchTerm} />
              </div>}
          </TabsContent>
          
          <TabsContent value="browse" className="bg-card p-4 rounded-md border">
            <ServiceCategoryList categories={categories} selectedServices={selectedServices} onServiceSelect={onServiceSelect} onRemoveService={onRemoveService || (() => {})} onUpdateServices={onUpdateServices || (() => {})} />
          </TabsContent>
        </Tabs>
      </CardHeader>
    </Card>;
};