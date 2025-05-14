
import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

// Define the component props
export interface HierarchicalServiceSelectorProps {
  onSelectService: (service: any) => void;
}

// Mock data - in a real app this would come from an API or context
const mockServiceData: ServiceMainCategory[] = [
  {
    id: "engine",
    name: "Engine",
    subcategories: [
      {
        id: "tune-up",
        name: "Tune-Up",
        jobs: [
          { id: "spark-plugs", name: "Spark Plug Replacement", estimatedTime: 60, price: 120 },
          { id: "oil-change", name: "Oil Change", estimatedTime: 30, price: 45 },
          { id: "filter-change", name: "Filter Replacement", estimatedTime: 20, price: 35 }
        ]
      },
      {
        id: "diagnostics",
        name: "Diagnostics",
        jobs: [
          { id: "computer-scan", name: "Computer Scan", estimatedTime: 45, price: 85 },
          { id: "engine-inspection", name: "Engine Inspection", estimatedTime: 90, price: 150 }
        ]
      }
    ]
  },
  {
    id: "brake",
    name: "Brake System",
    subcategories: [
      {
        id: "brake-service",
        name: "Brake Service",
        jobs: [
          { id: "brake-pad", name: "Brake Pad Replacement", estimatedTime: 120, price: 220 },
          { id: "rotor", name: "Rotor Resurfacing", estimatedTime: 90, price: 180 },
          { id: "fluid-flush", name: "Brake Fluid Flush", estimatedTime: 60, price: 95 }
        ]
      }
    ]
  },
  {
    id: "electrical",
    name: "Electrical",
    subcategories: [
      {
        id: "battery",
        name: "Battery Service",
        jobs: [
          { id: "battery-replace", name: "Battery Replacement", estimatedTime: 30, price: 150 },
          { id: "alternator", name: "Alternator Replacement", estimatedTime: 120, price: 320 }
        ]
      },
      {
        id: "lighting",
        name: "Lighting",
        jobs: [
          { id: "headlight", name: "Headlight Replacement", estimatedTime: 40, price: 60 },
          { id: "tail-light", name: "Tail Light Replacement", estimatedTime: 30, price: 50 }
        ]
      }
    ]
  }
];

export function HierarchicalServiceSelector({ onSelectService }: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  
  // Function to handle service job selection
  const handleJobSelect = (job: ServiceJob) => {
    const category = selectedCategory?.name || '';
    const subcategory = selectedSubcategory?.name || '';
    
    onSelectService({
      name: job.name,
      category: `${category} > ${subcategory}`,
      price: job.price,
      estimatedTime: job.estimatedTime,
    });
  };
  
  return (
    <Card className="border shadow-sm">
      <CardContent className="p-0">
        <Tabs defaultValue="categories" className="w-full">
          <TabsList className="grid grid-cols-3 rounded-none border-b">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger 
              value="subcategories" 
              disabled={!selectedCategory}
            >
              Subcategories
            </TabsTrigger>
            <TabsTrigger 
              value="services" 
              disabled={!selectedSubcategory}
            >
              Services
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="p-0">
            <div className="grid grid-cols-1 divide-y">
              {mockServiceData.map(category => (
                <button
                  key={category.id}
                  className="text-left p-3 hover:bg-slate-50 transition-colors"
                  onClick={() => {
                    setSelectedCategory(category);
                    setSelectedSubcategory(null);
                  }}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {category.subcategories.length} subcategories
                  </div>
                </button>
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="subcategories" className="p-0">
            {selectedCategory && (
              <div className="grid grid-cols-1 divide-y">
                {selectedCategory.subcategories.map(subcategory => (
                  <button
                    key={subcategory.id}
                    className="text-left p-3 hover:bg-slate-50 transition-colors"
                    onClick={() => setSelectedSubcategory(subcategory)}
                  >
                    <div className="font-medium">{subcategory.name}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {subcategory.jobs.length} services
                    </div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="services" className="p-0">
            {selectedSubcategory && (
              <div className="grid grid-cols-1 divide-y">
                {selectedSubcategory.jobs.map(job => (
                  <button
                    key={job.id}
                    className="text-left p-3 hover:bg-slate-50 transition-colors flex justify-between items-center"
                    onClick={() => handleJobSelect(job)}
                  >
                    <div>
                      <div className="font-medium">{job.name}</div>
                      <div className="text-xs text-muted-foreground mt-1">
                        Est. time: {job.estimatedTime} min
                      </div>
                    </div>
                    <div className="text-blue-600 font-medium">${job.price}</div>
                  </button>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
