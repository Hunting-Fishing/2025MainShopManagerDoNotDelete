import React, { useState, useMemo } from 'react';
import { Search, X } from 'lucide-react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Badge } from '@/components/ui/badge';

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
  const [selectedSector, setSelectedSector] = useState<ServiceSector | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredSectors = useMemo(() => {
    if (!searchTerm) return sectors;

    return sectors.map(sector => ({
      ...sector,
      categories: sector.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          jobs: subcategory.jobs.filter(job =>
            job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase())
          )
        })).filter(subcategory => subcategory.jobs.length > 0)
      })).filter(category => category.subcategories.length > 0)
    })).filter(sector => sector.categories.length > 0);
  }, [sectors, searchTerm]);

  const handleSectorClick = (sector: ServiceSector) => {
    setSelectedSector(sector);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategoryClick = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceClick = (service: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId || s.id === serviceId);
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Service Selection Interface */}
      <div className="flex h-96">
        {/* Sectors Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="p-3 border-b bg-gradient-to-r from-slate-100 to-slate-200">
            <h3 className="font-medium text-slate-700">Sectors</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
            {filteredSectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleSectorClick(sector)}
                className={`w-full text-left p-3 hover:bg-slate-200 transition-colors border-b border-slate-200 ${
                  selectedSector?.id === sector.id 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-slate-800">{sector.name}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {sector.categories.length} categories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Categories Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-emerald-50 to-teal-100">
          <div className="p-3 border-b bg-gradient-to-r from-emerald-100 to-teal-200">
            <h3 className="font-medium text-emerald-700">Categories</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-emerald-100 scrollbar-thumb-emerald-300 hover:scrollbar-thumb-emerald-400">
            {selectedSector?.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`w-full text-left p-3 hover:bg-emerald-200 transition-colors border-b border-emerald-200 ${
                  selectedCategory?.id === category.id 
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-l-4 border-l-emerald-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-emerald-800">{category.name}</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-amber-50 to-orange-100">
          <div className="p-3 border-b bg-gradient-to-r from-amber-100 to-orange-200">
            <h3 className="font-medium text-amber-700">Subcategories</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-amber-100 scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400">
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory)}
                className={`w-full text-left p-3 hover:bg-amber-200 transition-colors border-b border-amber-200 ${
                  selectedSubcategory?.id === subcategory.id 
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-l-amber-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-amber-800">{subcategory.name}</div>
                <div className="text-xs text-amber-600 mt-1">
                  {subcategory.jobs.length} services
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Services Column */}
        <div className="w-1/4 bg-gradient-to-b from-purple-50 to-violet-100">
          <div className="p-3 border-b bg-gradient-to-r from-purple-100 to-violet-200">
            <h3 className="font-medium text-purple-700">Services</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-purple-100 scrollbar-thumb-purple-300 hover:scrollbar-thumb-purple-400">
            {selectedSubcategory?.jobs.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                disabled={isServiceSelected(service.id)}
                className={`w-full text-left p-3 transition-colors border-b border-purple-200 ${
                  isServiceSelected(service.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-purple-200 text-purple-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{service.name}</div>
                  {isServiceSelected(service.id) && (
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                {service.description && (
                  <div className="text-xs text-purple-600 mt-1 line-clamp-2">
                    {service.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {service.estimatedTime && (
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                      {service.estimatedTime} min
                    </Badge>
                  )}
                  {service.price && (
                    <Badge variant="success" className="text-xs">
                      ${service.price}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* No Results Message */}
      {searchTerm && filteredSectors.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No services found</div>
          <div className="text-sm">Try adjusting your search terms</div>
        </div>
      )}
    </div>
  );
};
