
import React, { useState, useMemo } from 'react';
import { ServiceSector, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { SearchInput } from './SearchInput';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Get selected items for display
  const selectedSector = selectedSectorId ? sectors.find(s => s.id === selectedSectorId) : null;
  const selectedCategory = selectedCategoryId && selectedSector 
    ? selectedSector.categories.find(c => c.id === selectedCategoryId) 
    : null;
  const selectedSubcategory = selectedSubcategoryId && selectedCategory
    ? selectedCategory.subcategories.find(sc => sc.id === selectedSubcategoryId)
    : null;

  // Filter sectors by search
  const filteredSectors = useMemo(() => {
    if (!searchTerm) return sectors;
    return sectors.filter(sector =>
      sector.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sector.categories.some(category =>
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(subcategory =>
          subcategory.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subcategory.jobs.some(job =>
            job.name.toLowerCase().includes(searchTerm.toLowerCase())
          )
        )
      )
    );
  }, [sectors, searchTerm]);

  // Reset selections when parent changes
  const handleSectorSelect = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  };

  const handleServiceClick = (service: ServiceJob) => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    // Check if already selected
    const isSelected = selectedServices.some(s => s.serviceId === service.id || s.id === service.id);
    if (isSelected) return;

    onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
  };

  return (
    <div className="space-y-4">
      {/* Search */}
      <SearchInput
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search sectors, categories, subcategories, or services..."
      />

      {/* 4-Tier Grid */}
      <div className="grid grid-cols-4 gap-4 h-96">
        {/* Column 1: Sectors */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Sectors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-80">
              {filteredSectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => handleSectorSelect(sector.id)}
                  className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                    selectedSectorId === sector.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                >
                  <div className="font-medium text-sm">{sector.name}</div>
                  {sector.description && (
                    <div className="text-xs text-gray-500 mt-1">{sector.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {sector.categories.length} categories
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Column 2: Categories */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedSector ? `${selectedSector.name} Categories` : 'Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-80">
              {selectedSector ? (
                selectedSector.categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedCategoryId === category.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{category.name}</div>
                    {category.description && (
                      <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {category.subcategories.length} subcategories
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a sector to view categories
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Column 3: Subcategories */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedCategory ? `${selectedCategory.name} Subcategories` : 'Subcategories'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-80">
              {selectedCategory ? (
                selectedCategory.subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    onClick={() => handleSubcategorySelect(subcategory.id)}
                    className={`w-full text-left p-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${
                      selectedSubcategoryId === subcategory.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                    }`}
                  >
                    <div className="font-medium text-sm">{subcategory.name}</div>
                    {subcategory.description && (
                      <div className="text-xs text-gray-500 mt-1">{subcategory.description}</div>
                    )}
                    <div className="text-xs text-gray-400 mt-1">
                      {subcategory.jobs.length} services
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a category to view subcategories
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Column 4: Services */}
        <Card className="overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedSubcategory ? `${selectedSubcategory.name} Services` : 'Services'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-y-auto h-80">
              {selectedSubcategory ? (
                selectedSubcategory.jobs.map(service => {
                  const isSelected = selectedServices.some(s => s.serviceId === service.id || s.id === service.id);
                  
                  return (
                    <button
                      key={service.id}
                      onClick={() => handleServiceClick(service)}
                      disabled={isSelected}
                      className={`w-full text-left p-3 border-b border-gray-100 transition-colors ${
                        isSelected 
                          ? 'bg-green-50 text-green-700 cursor-not-allowed' 
                          : 'hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{service.name}</div>
                        {isSelected && (
                          <Badge variant="secondary" className="text-xs">
                            Added
                          </Badge>
                        )}
                      </div>
                      {service.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {service.description}
                        </div>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        {service.estimatedTime && (
                          <span className="text-xs text-blue-600">
                            {service.estimatedTime} min
                          </span>
                        )}
                        {service.price && (
                          <span className="text-xs text-green-600 font-medium">
                            ${service.price}
                          </span>
                        )}
                      </div>
                    </button>
                  );
                })
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a subcategory to view services
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Breadcrumb Navigation */}
      {(selectedSector || selectedCategory || selectedSubcategory) && (
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Path:</span>
          {selectedSector && (
            <>
              <Badge variant="outline">{selectedSector.name}</Badge>
              {selectedCategory && (
                <>
                  <span>→</span>
                  <Badge variant="outline">{selectedCategory.name}</Badge>
                  {selectedSubcategory && (
                    <>
                      <span>→</span>
                      <Badge variant="outline">{selectedSubcategory.name}</Badge>
                    </>
                  )}
                </>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
};
