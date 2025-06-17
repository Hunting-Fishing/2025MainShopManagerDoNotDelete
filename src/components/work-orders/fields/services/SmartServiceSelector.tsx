
import React, { useState, useMemo } from 'react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';

interface SmartServiceSelectorProps {
  sectors?: ServiceSector[];
  categories?: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  sectors = [],
  categories = [],
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Use sectors if available, otherwise fallback to categories
  const displaySectors = useMemo(() => {
    if (sectors.length > 0) {
      return sectors;
    }
    // Convert categories to a single sector for backward compatibility
    if (categories.length > 0) {
      return [{
        id: 'default-sector',
        name: 'Services',
        description: 'All available services',
        categories: categories,
        position: 1,
        is_active: true
      }];
    }
    return [];
  }, [sectors, categories]);

  // Filter services based on search term
  const filteredData = useMemo(() => {
    if (!debouncedSearchTerm) {
      return displaySectors;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return displaySectors.map(sector => ({
      ...sector,
      categories: sector.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          jobs: subcategory.jobs.filter(job =>
            job.name.toLowerCase().includes(searchLower) ||
            job.description?.toLowerCase().includes(searchLower) ||
            category.name.toLowerCase().includes(searchLower) ||
            subcategory.name.toLowerCase().includes(searchLower)
          )
        })).filter(subcategory => subcategory.jobs.length > 0)
      })).filter(category => category.subcategories.length > 0)
    })).filter(sector => sector.categories.length > 0);
  }, [displaySectors, debouncedSearchTerm]);

  // Get filtered sectors, categories, subcategories based on selection
  const visibleSectors = filteredData;
  
  const visibleCategories = selectedSectorId 
    ? filteredData.find(s => s.id === selectedSectorId)?.categories || []
    : [];

  const visibleSubcategories = selectedCategoryId
    ? visibleCategories.find(c => c.id === selectedCategoryId)?.subcategories || []
    : [];

  const visibleServices = selectedSubcategoryId
    ? visibleSubcategories.find(s => s.id === selectedSubcategoryId)?.jobs || []
    : [];

  const handleServiceSelect = (service: ServiceJob) => {
    const selectedCategory = visibleCategories.find(c => c.id === selectedCategoryId);
    const selectedSubcategory = visibleSubcategories.find(s => s.id === selectedSubcategoryId);
    
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId || s.id === serviceId);
  };

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search services (e.g., caliper, brake, oil change...)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* 4-Column Layout */}
      <div className="grid grid-cols-4 gap-4 min-h-[400px]">
        {/* Column 1: Sectors */}
        <div className="border rounded-lg p-2 space-y-1">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Sectors</h4>
          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {visibleSectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => {
                  setSelectedSectorId(sector.id);
                  setSelectedCategoryId(null);
                  setSelectedSubcategoryId(null);
                }}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedSectorId === sector.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{sector.name}</div>
                <div className="text-xs text-muted-foreground">
                  {sector.categories.length} categories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 2: Categories */}
        <div className="border rounded-lg p-2 space-y-1">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Categories</h4>
          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {visibleCategories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedSubcategoryId(null);
                }}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-xs text-muted-foreground">
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 3: Subcategories */}
        <div className="border rounded-lg p-2 space-y-1">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Subcategories</h4>
          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {visibleSubcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => setSelectedSubcategoryId(subcategory.id)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedSubcategoryId === subcategory.id
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-muted'
                }`}
              >
                <div className="font-medium">{subcategory.name}</div>
                <div className="text-xs text-muted-foreground">
                  {subcategory.jobs.length} services
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Column 4: Services */}
        <div className="border rounded-lg p-2 space-y-1">
          <h4 className="font-medium text-sm text-muted-foreground mb-2">Services</h4>
          <div className="space-y-1 max-h-[350px] overflow-y-auto">
            {visibleServices.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceSelect(service)}
                disabled={isServiceSelected(service.id)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  isServiceSelected(service.id)
                    ? 'bg-green-100 text-green-800 cursor-not-allowed'
                    : 'hover:bg-muted border-2 border-transparent hover:border-primary'
                }`}
              >
                <div className="font-medium">{service.name}</div>
                {service.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {service.description}
                  </div>
                )}
                <div className="flex items-center justify-between mt-1">
                  {service.estimatedTime && (
                    <span className="text-xs text-muted-foreground">
                      {service.estimatedTime} min
                    </span>
                  )}
                  {service.price && (
                    <span className="text-xs font-medium text-green-600">
                      ${service.price}
                    </span>
                  )}
                </div>
                {isServiceSelected(service.id) && (
                  <div className="text-xs text-green-600 font-medium mt-1">
                    ✓ Selected
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Search Results Info */}
      {debouncedSearchTerm && (
        <div className="text-sm text-muted-foreground">
          Found {filteredData.reduce((acc, sector) => 
            acc + sector.categories.reduce((catAcc, category) => 
              catAcc + category.subcategories.reduce((subAcc, subcategory) => 
                subAcc + subcategory.jobs.length, 0), 0), 0)} services matching "{debouncedSearchTerm}"
        </div>
      )}
    </div>
  );
};
