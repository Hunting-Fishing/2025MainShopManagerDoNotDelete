
import React, { useState } from 'react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { ChevronRight, ChevronDown, Package } from 'lucide-react';

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
  const [expandedSectors, setExpandedSectors] = useState<Record<string, boolean>>({});
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [expandedSubcategories, setExpandedSubcategories] = useState<Record<string, boolean>>({});

  const toggleSector = (sectorId: string) => {
    setExpandedSectors(prev => ({
      ...prev,
      [sectorId]: !prev[sectorId]
    }));
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => ({
      ...prev,
      [categoryId]: !prev[categoryId]
    }));
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => ({
      ...prev,
      [subcategoryId]: !prev[subcategoryId]
    }));
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Check if service is already selected
    const isAlreadySelected = selectedServices.some(s => s.serviceId === service.id);
    if (isAlreadySelected) {
      return;
    }
    
    onServiceSelect(service, categoryName, subcategoryName);
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="max-h-96 overflow-y-auto">
        {sectors.map((sector) => (
          <div key={sector.id} className="border-b border-gray-100 last:border-b-0">
            {/* Sector Level */}
            <button
              onClick={() => toggleSector(sector.id)}
              className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center justify-between"
            >
              <div className="flex items-center space-x-2">
                {expandedSectors[sector.id] ? (
                  <ChevronDown className="h-4 w-4 text-gray-400" />
                ) : (
                  <ChevronRight className="h-4 w-4 text-gray-400" />
                )}
                <Package className="h-4 w-4 text-blue-500" />
                <span className="font-medium text-gray-900">{sector.name}</span>
              </div>
              <span className="text-xs text-gray-400">
                {sector.categories.length} categories
              </span>
            </button>

            {/* Categories Level */}
            {expandedSectors[sector.id] && (
              <div className="pl-6 bg-gray-50">
                {sector.categories.map((category) => (
                  <div key={category.id} className="border-b border-gray-200 last:border-b-0">
                    <button
                      onClick={() => toggleCategory(category.id)}
                      className="w-full px-4 py-2 text-left hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        {expandedCategories[category.id] ? (
                          <ChevronDown className="h-3 w-3 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-3 w-3 text-gray-400" />
                        )}
                        <span className="text-sm font-medium text-gray-800">{category.name}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {category.subcategories.length} subcategories
                      </span>
                    </button>

                    {/* Subcategories Level */}
                    {expandedCategories[category.id] && (
                      <div className="pl-6 bg-white">
                        {category.subcategories.map((subcategory) => (
                          <div key={subcategory.id} className="border-b border-gray-100 last:border-b-0">
                            <button
                              onClick={() => toggleSubcategory(subcategory.id)}
                              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between"
                            >
                              <div className="flex items-center space-x-2">
                                {expandedSubcategories[subcategory.id] ? (
                                  <ChevronDown className="h-3 w-3 text-gray-400" />
                                ) : (
                                  <ChevronRight className="h-3 w-3 text-gray-400" />
                                )}
                                <span className="text-sm text-gray-700">{subcategory.name}</span>
                              </div>
                              <span className="text-xs text-gray-400">
                                {subcategory.jobs.length} services
                              </span>
                            </button>

                            {/* Services Level */}
                            {expandedSubcategories[subcategory.id] && (
                              <div className="pl-6 py-2 space-y-1 bg-gray-50">
                                {subcategory.jobs.map((job) => {
                                  const isSelected = selectedServices.some(s => s.serviceId === job.id);
                                  return (
                                    <div
                                      key={job.id}
                                      className={`p-2 rounded border cursor-pointer transition-colors ${
                                        isSelected
                                          ? 'bg-blue-100 border-blue-300 cursor-not-allowed'
                                          : 'bg-white border-gray-200 hover:bg-blue-50 hover:border-blue-200'
                                      }`}
                                      onClick={() => !isSelected && handleServiceSelect(job, category.name, subcategory.name)}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <h4 className="text-sm font-medium text-gray-900">{job.name}</h4>
                                          {job.description && (
                                            <p className="text-xs text-gray-600 mt-1">{job.description}</p>
                                          )}
                                        </div>
                                        <div className="text-right text-xs text-gray-500 ml-2">
                                          {job.price && <div>${job.price}</div>}
                                          {job.estimatedTime && <div>{job.estimatedTime}min</div>}
                                        </div>
                                      </div>
                                      {isSelected && (
                                        <div className="mt-1 text-xs text-blue-600 font-medium">
                                          ✓ Already selected
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
