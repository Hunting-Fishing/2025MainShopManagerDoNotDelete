
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface Service {
  id: string;
  name: string;
  category: string;
  price?: number;
  description?: string;
}

interface Category {
  id: string;
  name: string;
  services: Service[];
}

interface HierarchicalServiceSelectorProps {
  onSelectService: (service: Service) => void;
}

export function HierarchicalServiceSelector({ onSelectService }: HierarchicalServiceSelectorProps) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    // In a real app, fetch from API - using mock data for now
    const mockCategories: Category[] = [
      {
        id: "1",
        name: "Engine Services",
        services: [
          { id: "101", name: "Oil Change", category: "Engine Services", price: 49.99 },
          { id: "102", name: "Spark Plug Replacement", category: "Engine Services", price: 129.99 },
          { id: "103", name: "Timing Belt Service", category: "Engine Services", price: 299.99 }
        ]
      },
      {
        id: "2",
        name: "Brake System",
        services: [
          { id: "201", name: "Brake Pad Replacement", category: "Brake System", price: 159.99 },
          { id: "202", name: "Brake Fluid Flush", category: "Brake System", price: 89.99 },
          { id: "203", name: "Rotor Replacement", category: "Brake System", price: 249.99 }
        ]
      },
      {
        id: "3",
        name: "Electrical",
        services: [
          { id: "301", name: "Battery Replacement", category: "Electrical", price: 129.99 },
          { id: "302", name: "Alternator Service", category: "Electrical", price: 299.99 },
          { id: "303", name: "Diagnostic Scan", category: "Electrical", price: 79.99 }
        ]
      }
    ];
    
    setCategories(mockCategories);
    if (mockCategories.length > 0) {
      setSelectedCategory(mockCategories[0].id);
    }
    setIsLoading(false);
  }, []);

  return (
    <div className="space-y-4">
      <h3 className="font-medium">Select a Service</h3>
      
      {isLoading ? (
        <div className="text-center py-4">Loading services...</div>
      ) : (
        <Tabs value={selectedCategory || ''} onValueChange={setSelectedCategory}>
          <TabsList className="grid grid-cols-3">
            {categories.map(category => (
              <TabsTrigger key={category.id} value={category.id}>
                {category.name}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {categories.map(category => (
            <TabsContent key={category.id} value={category.id}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {category.services.map(service => (
                  <Card key={service.id} className="p-3 hover:bg-slate-50 cursor-pointer">
                    <div 
                      onClick={() => onSelectService(service)}
                      className="flex justify-between"
                    >
                      <div>
                        <p className="font-medium">{service.name}</p>
                        <p className="text-sm text-slate-500">{service.category}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">${service.price?.toFixed(2)}</p>
                        <Button 
                          size="sm" 
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectService(service);
                          }}
                        >
                          Select
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}
    </div>
  );
}
