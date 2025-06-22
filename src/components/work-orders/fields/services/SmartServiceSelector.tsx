
import React, { useState, useMemo } from 'react';
import { Search, ChevronRight, Star, Clock, DollarSign } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function SmartServiceSelector({
  sectors,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: SmartServiceSelectorProps) {
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Get filtered data based on search
  const filteredSectors = useMemo(() => {
    if (!searchQuery.trim()) return sectors;
    
    return sectors.map(sector => ({
      ...sector,
      categories: sector.categories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          jobs: subcategory.jobs.filter(job =>
            job.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchQuery.toLowerCase())
          )
        })).filter(subcategory => subcategory.jobs.length > 0)
      })).filter(category => category.subcategories.length > 0)
    })).filter(sector => sector.categories.length > 0);
  }, [sectors, searchQuery]);

  const selectedSector = selectedSectorId ? sectors.find(s => s.id === selectedSectorId) : null;
  const selectedCategory = selectedCategoryId && selectedSector 
    ? selectedSector.categories.find(c => c.id === selectedCategoryId) 
    : null;
  const selectedSubcategory = selectedSubcategoryId && selectedCategory 
    ? selectedCategory.subcategories.find(s => s.id === selectedSubcategoryId) 
    : null;

  // Get tier colors for visual hierarchy
  const getTierColor = (tier: number) => {
    const colors = [
      'from-blue-500/20 to-indigo-600/20 border-blue-200',
      'from-emerald-500/20 to-teal-600/20 border-emerald-200', 
      'from-amber-500/20 to-orange-600/20 border-amber-200',
      'from-purple-500/20 to-violet-600/20 border-purple-200'
    ];
    return colors[tier] || colors[0];
  };

  const handleServiceSelect = (service: ServiceJob) => {
    if (!selectedCategory || !selectedSubcategory) return;
    
    const newSelectedService: SelectedService = {
      id: service.id,
      name: service.name,
      description: service.description || '',
      estimated_hours: service.estimatedTime ? service.estimatedTime / 60 : 1,
      labor_rate: 75,
      total_amount: service.price || 75,
      status: 'pending',
      category: selectedCategory.name,
      subcategory: selectedSubcategory.name,
      categoryName: selectedCategory.name,
      subcategoryName: selectedSubcategory.name
    };

    const updated = [...selectedServices, newSelectedService];
    onUpdateServices(updated);
    onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
  };

  const handleRemoveSelected = (serviceId: string) => {
    onRemoveService(serviceId);
  };

  const resetSelection = () => {
    setSelectedSectorId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
  };

  return (
    <div className="w-full space-y-6">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50 border border-slate-200 p-6">
        <div className="absolute inset-0 bg-grid-slate-100 [mask-image:linear-gradient(0deg,transparent,black)]" />
        <div className="relative">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                Smart Service Selector
              </h3>
              <p className="text-sm text-slate-600 mt-1">
                Navigate through our comprehensive 4-tier service catalog
              </p>
            </div>
            {(selectedSectorId || selectedCategoryId || selectedSubcategoryId) && (
              <button
                onClick={resetSelection}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-900 hover:bg-white/60 rounded-lg transition-all duration-200"
              >
                Reset Selection
              </button>
            )}
          </div>

          {/* Enhanced Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search services across all categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 bg-white/70 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300 transition-all duration-200"
            />
          </div>
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      {(selectedSector || selectedCategory || selectedSubcategory) && (
        <div className="flex items-center space-x-2 text-sm text-slate-600 bg-white/60 backdrop-blur-sm rounded-lg p-3 border border-slate-200">
          <span>Path:</span>
          {selectedSector && (
            <>
              <span className="font-medium text-blue-600">{selectedSector.name}</span>
              {selectedCategory && <ChevronRight className="h-4 w-4" />}
            </>
          )}
          {selectedCategory && (
            <>
              <span className="font-medium text-emerald-600">{selectedCategory.name}</span>
              {selectedSubcategory && <ChevronRight className="h-4 w-4" />}
            </>
          )}
          {selectedSubcategory && (
            <span className="font-medium text-amber-600">{selectedSubcategory.name}</span>
          )}
        </div>
      )}

      {/* 4-Tier Navigation Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Tier 1: Sectors */}
        <div className={`rounded-xl bg-gradient-to-br ${getTierColor(0)} backdrop-blur-sm border p-4`}>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-blue-500 mr-2" />
            Sectors
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {filteredSectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => {
                  setSelectedSectorId(sector.id);
                  setSelectedCategoryId(null);
                  setSelectedSubcategoryId(null);
                }}
                className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                  selectedSectorId === sector.id
                    ? 'bg-blue-100 text-blue-900 shadow-sm border border-blue-200'
                    : 'bg-white/50 hover:bg-white/80 text-slate-700 hover:text-slate-900'
                }`}
              >
                <div className="font-medium">{sector.name}</div>
                <div className="text-xs text-slate-500 mt-1">
                  {sector.categories.length} categories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Tier 2: Main Categories */}
        <div className={`rounded-xl bg-gradient-to-br ${getTierColor(1)} backdrop-blur-sm border p-4`}>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-emerald-500 mr-2" />
            Categories
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {selectedSector ? (
              selectedSector.categories.map((category) => (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategoryId(category.id);
                    setSelectedSubcategoryId(null);
                  }}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedCategoryId === category.id
                      ? 'bg-emerald-100 text-emerald-900 shadow-sm border border-emerald-200'
                      : 'bg-white/50 hover:bg-white/80 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {category.subcategories.length} subcategories
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <div className="text-2xl mb-2">🎯</div>
                <p className="text-sm">Select a sector first</p>
              </div>
            )}
          </div>
        </div>

        {/* Tier 3: Subcategories */}
        <div className={`rounded-xl bg-gradient-to-br ${getTierColor(2)} backdrop-blur-sm border p-4`}>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-amber-500 mr-2" />
            Subcategories
          </h4>
          <div className="space-y-2 max-h-64 overflow-y-auto custom-scrollbar">
            {selectedCategory ? (
              selectedCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  className={`w-full text-left p-3 rounded-lg transition-all duration-200 ${
                    selectedSubcategoryId === subcategory.id
                      ? 'bg-amber-100 text-amber-900 shadow-sm border border-amber-200'
                      : 'bg-white/50 hover:bg-white/80 text-slate-700 hover:text-slate-900'
                  }`}
                >
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="text-xs text-slate-500 mt-1">
                    {subcategory.jobs.length} services
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-slate-500 py-8">
                <div className="text-2xl mb-2">📂</div>
                <p className="text-sm">Select a category first</p>
              </div>
            )}
          </div>
        </div>

        {/* Tier 4: Services/Jobs */}
        <div className={`rounded-xl bg-gradient-to-br ${getTierColor(3)} backdrop-blur-sm border p-4`}>
          <h4 className="font-semibold text-slate-900 mb-3 flex items-center">
            <div className="w-2 h-2 rounded-full bg-purple-500 mr-2" />
            Services
          </h4>
          <div className="space-y-3 max-h-64 overflow-y-auto custom-scrollbar">
            {selectedSubcategory ? (
              selectedSubcategory.jobs.map((service) => {
                const isSelected = selectedServices.some(s => s.id === service.id);
                return (
                  <div
                    key={service.id}
                    className={`p-3 rounded-lg border transition-all duration-200 ${
                      isSelected 
                        ? 'bg-purple-50 border-purple-200 shadow-sm' 
                        : 'bg-white/70 border-slate-200 hover:bg-white hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h5 className="font-medium text-slate-900 text-sm leading-tight">
                        {service.name}
                      </h5>
                      {!isSelected && (
                        <button
                          onClick={() => handleServiceSelect(service)}
                          className="ml-2 px-2 py-1 text-xs bg-purple-600 text-white rounded hover:bg-purple-700 transition-colors flex-shrink-0"
                        >
                          Add
                        </button>
                      )}
                    </div>
                    
                    {service.description && (
                      <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                        {service.description}
                      </p>
                    )}
                    
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center space-x-3">
                        {service.estimatedTime && (
                          <div className="flex items-center text-slate-500">
                            <Clock className="h-3 w-3 mr-1" />
                            {Math.round(service.estimatedTime / 60)}h
                          </div>
                        )}
                        {service.price && (
                          <div className="flex items-center text-slate-500">
                            <DollarSign className="h-3 w-3 mr-1" />
                            ${service.price}
                          </div>
                        )}
                      </div>
                      {isSelected && (
                        <Badge variant="success" className="text-xs">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="text-center text-slate-500 py-8">
                <div className="text-2xl mb-2">⚙️</div>
                <p className="text-sm">Select a subcategory first</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <div className="rounded-xl bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-green-900 flex items-center">
              <Star className="h-4 w-4 mr-2" />
              Selected Services ({selectedServices.length})
            </h4>
            <div className="text-sm text-green-700">
              Total: ${selectedServices.reduce((sum, service) => sum + service.total_amount, 0).toLocaleString()}
            </div>
          </div>
          
          <div className="grid gap-3">
            {selectedServices.map((service) => (
              <div key={service.id} className="flex items-center justify-between p-3 bg-white/70 rounded-lg border border-green-100">
                <div className="flex-1">
                  <div className="font-medium text-slate-900">{service.name}</div>
                  <div className="text-xs text-slate-600">
                    {service.categoryName} → {service.subcategoryName}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="text-sm font-medium text-slate-900">
                    ${service.total_amount}
                  </div>
                  <button
                    onClick={() => handleRemoveSelected(service.id)}
                    className="text-xs text-red-600 hover:text-red-800 px-2 py-1 rounded hover:bg-red-50 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <style jsx>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgb(203 213 225) transparent;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgb(203 213 225);
          border-radius: 2px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background-color: rgb(148 163 184);
        }
        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
        .bg-grid-slate-100 {
          background-image: url("data:image/svg+xml,%3csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3e%3cdefs%3e%3cpattern id='smallGrid' width='8' height='8' patternUnits='userSpaceOnUse'%3e%3cpath d='M 8 0 L 0 0 0 8' fill='none' stroke='%23f1f5f9' stroke-width='0.5'/%3e%3c/pattern%3e%3cpattern id='grid' width='40' height='40' patternUnits='userSpaceOnUse'%3e%3crect width='40' height='40' fill='url(%23smallGrid)'/%3e%3cpath d='M 40 0 L 0 0 0 40' fill='none' stroke='%23f1f5f9' stroke-width='1'/%3e%3c/pattern%3e%3c/defs%3e%3crect width='100%25' height='100%25' fill='url(%23grid)'/%3e%3c/svg%3e");
        }
      `}</style>
    </div>
  );
}
