
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSearch } from './ServiceSearch';
import { ServiceDebugPanel } from './ServiceDebugPanel';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Grid, List, Bug } from 'lucide-react';

interface HierarchicalServiceSelectorProps {
  sectors: ServiceSector[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function HierarchicalServiceSelector({
  sectors,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices
}: HierarchicalServiceSelectorProps) {
  const [activeView, setActiveView] = useState<'search' | 'browse' | 'debug'>('search');
  const [searchQuery, setSearchQuery] = useState('');

  // Get all categories from all sectors
  const allCategories = useMemo(() => {
    return sectors.flatMap(sector => sector.categories);
  }, [sectors]);

  const totalServices = useMemo(() => {
    return allCategories.reduce((total, category) => 
      total + category.subcategories.reduce((subTotal, subcategory) => 
        subTotal + subcategory.jobs.length, 0), 0);
  }, [allCategories]);

  console.log('HierarchicalServiceSelector render:', {
    sectorsCount: sectors.length,
    categoriesCount: allCategories.length,
    totalServices,
    selectedServicesCount: selectedServices.length,
    activeView
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h4 className="text-sm font-medium text-slate-700">Service Selection</h4>
          <Badge variant="outline" className="text-xs">
            {totalServices} services available
          </Badge>
        </div>
      </div>

      <Tabs value={activeView} onValueChange={(value) => setActiveView(value as any)}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="h-4 w-4" />
            Search
          </TabsTrigger>
          <TabsTrigger value="browse" className="flex items-center gap-2">
            <Grid className="h-4 w-4" />
            Browse
          </TabsTrigger>
          <TabsTrigger value="debug" className="flex items-center gap-2">
            <Bug className="h-4 w-4" />
            Debug
          </TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-4">
          <ServiceSearch
            categories={allCategories}
            onServiceSelect={onServiceSelect}
            selectedServices={selectedServices}
          />
        </TabsContent>

        <TabsContent value="browse" className="space-y-4">
          <ServiceCategoryList
            categories={allCategories}
            onServiceSelect={onServiceSelect}
            selectedServices={selectedServices}
          />
        </TabsContent>

        <TabsContent value="debug" className="space-y-4">
          <ServiceDebugPanel
            sectors={sectors}
            selectedServices={selectedServices}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
