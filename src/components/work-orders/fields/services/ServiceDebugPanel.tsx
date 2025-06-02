
import React, { useState } from 'react';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, Bug } from 'lucide-react';

interface ServiceDebugPanelProps {
  categories: ServiceMainCategory[];
}

export function ServiceDebugPanel({ categories }: ServiceDebugPanelProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const totalServices = categories.reduce((total, category) => 
    total + category.subcategories.reduce((subTotal, subcategory) => 
      subTotal + subcategory.jobs.length, 0), 0);

  const allJobs = categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => 
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name
      }))
    )
  );

  // Search for belt-related services
  const beltServices = allJobs.filter(job => 
    job.name.toLowerCase().includes('belt') ||
    job.description?.toLowerCase().includes('belt')
  );

  // Search for serpentine-related services
  const serpentineServices = allJobs.filter(job => 
    job.name.toLowerCase().includes('serpentine') ||
    job.description?.toLowerCase().includes('serpentine')
  );

  if (!isOpen) {
    return (
      <Button 
        variant="outline" 
        size="sm" 
        onClick={() => setIsOpen(true)}
        className="mb-4"
      >
        <Bug className="h-4 w-4 mr-2" />
        Debug Services ({totalServices} total)
      </Button>
    );
  }

  return (
    <Card className="mb-4 border-yellow-200 bg-yellow-50">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-yellow-800">
            Service Debug Panel
          </CardTitle>
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setIsOpen(false)}
          >
            Close
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-2 rounded border">
            <div className="font-medium">Total Categories</div>
            <div className="text-lg">{categories.length}</div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-medium">Total Subcategories</div>
            <div className="text-lg">
              {categories.reduce((total, cat) => total + cat.subcategories.length, 0)}
            </div>
          </div>
          <div className="bg-white p-2 rounded border">
            <div className="font-medium">Total Services</div>
            <div className="text-lg">{totalServices}</div>
          </div>
        </div>

        {/* Search Results for Missing Services */}
        <div className="space-y-2">
          <div className="font-medium text-sm">Belt-related services ({beltServices.length}):</div>
          {beltServices.length > 0 ? (
            <div className="bg-white p-2 rounded border text-xs max-h-32 overflow-y-auto">
              {beltServices.map(service => (
                <div key={service.id} className="mb-1">
                  <strong>{service.name}</strong> - {service.categoryName} &gt; {service.subcategoryName}
                  {service.description && <div className="text-gray-600">{service.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 p-2 rounded border text-red-700 text-xs">
              No belt-related services found!
            </div>
          )}

          <div className="font-medium text-sm">Serpentine-related services ({serpentineServices.length}):</div>
          {serpentineServices.length > 0 ? (
            <div className="bg-white p-2 rounded border text-xs max-h-32 overflow-y-auto">
              {serpentineServices.map(service => (
                <div key={service.id} className="mb-1">
                  <strong>{service.name}</strong> - {service.categoryName} &gt; {service.subcategoryName}
                  {service.description && <div className="text-gray-600">{service.description}</div>}
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-red-50 p-2 rounded border text-red-700 text-xs">
              No serpentine-related services found!
            </div>
          )}
        </div>

        {/* Full Category Breakdown */}
        <div className="space-y-2">
          <div className="font-medium text-sm">Full Category Breakdown:</div>
          <div className="max-h-64 overflow-y-auto bg-white border rounded">
            {categories.map((category) => (
              <div key={category.id}>
                <Collapsible>
                  <CollapsibleTrigger 
                    onClick={() => toggleCategory(category.id)}
                    className="flex items-center w-full p-2 text-left hover:bg-gray-50 text-xs"
                  >
                    {expandedCategories.includes(category.id) ? (
                      <ChevronDown className="h-3 w-3 mr-1" />
                    ) : (
                      <ChevronRight className="h-3 w-3 mr-1" />
                    )}
                    <strong>{category.name}</strong> 
                    <span className="ml-auto text-gray-500">
                      ({category.subcategories.length} subcategories, {
                        category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)
                      } services)
                    </span>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    {category.subcategories.map((subcategory) => (
                      <div key={subcategory.id} className="ml-4 p-1 border-l border-gray-200">
                        <div className="text-xs font-medium text-gray-700">
                          {subcategory.name} ({subcategory.jobs.length} services)
                        </div>
                        <div className="ml-2 text-xs text-gray-600">
                          {subcategory.jobs.map(job => job.name).join(', ')}
                        </div>
                      </div>
                    ))}
                  </CollapsibleContent>
                </Collapsible>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
