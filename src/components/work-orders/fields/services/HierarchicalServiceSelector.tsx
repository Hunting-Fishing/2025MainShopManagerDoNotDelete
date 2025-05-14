
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Search, ChevronRight } from "lucide-react";

interface ServiceItem {
  id: string;
  categoryId: string;
  categoryName: string;
  subcategoryId: string;
  subcategoryName: string;
  jobId: string;
  jobName: string;
  estimatedTime?: number;
  price?: number;
}

export interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: Omit<ServiceItem, "id" | "quantity">) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Mock service data - in a real app, this would come from the database
  const categories = [
    { id: "cat1", name: "Engine" },
    { id: "cat2", name: "Brakes" },
    { id: "cat3", name: "Electrical" },
    { id: "cat4", name: "Transmission" },
  ];

  const subcategories = [
    { id: "sub1", categoryId: "cat1", name: "Engine Repair" },
    { id: "sub2", categoryId: "cat1", name: "Engine Replacement" },
    { id: "sub3", categoryId: "cat2", name: "Brake Pads" },
    { id: "sub4", categoryId: "cat2", name: "Brake Calipers" },
    { id: "sub5", categoryId: "cat3", name: "Wiring" },
    { id: "sub6", categoryId: "cat3", name: "Battery" },
    { id: "sub7", categoryId: "cat4", name: "Transmission Flush" },
    { id: "sub8", categoryId: "cat4", name: "Transmission Repair" },
  ];

  const services = [
    { id: "svc1", categoryId: "cat1", subcategoryId: "sub1", name: "Oil Change", price: 49.99, estimatedTime: 30 },
    { id: "svc2", categoryId: "cat1", subcategoryId: "sub1", name: "Oil Filter Replacement", price: 19.99, estimatedTime: 15 },
    { id: "svc3", categoryId: "cat1", subcategoryId: "sub2", name: "Engine Overhaul", price: 1299.99, estimatedTime: 480 },
    { id: "svc4", categoryId: "cat2", subcategoryId: "sub3", name: "Front Brake Pads", price: 149.99, estimatedTime: 60 },
    { id: "svc5", categoryId: "cat2", subcategoryId: "sub3", name: "Rear Brake Pads", price: 149.99, estimatedTime: 60 },
    { id: "svc6", categoryId: "cat2", subcategoryId: "sub4", name: "Replace Caliper", price: 199.99, estimatedTime: 90 },
    { id: "svc7", categoryId: "cat3", subcategoryId: "sub5", name: "Diagnostic", price: 89.99, estimatedTime: 45 },
    { id: "svc8", categoryId: "cat3", subcategoryId: "sub6", name: "Battery Replacement", price: 129.99, estimatedTime: 30 },
    { id: "svc9", categoryId: "cat4", subcategoryId: "sub7", name: "Transmission Fluid Change", price: 149.99, estimatedTime: 45 },
    { id: "svc10", categoryId: "cat4", subcategoryId: "sub8", name: "Rebuild Transmission", price: 1799.99, estimatedTime: 540 },
  ];

  const filteredCategories = categories.filter(category => 
    category.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredSubcategories = subcategories.filter(subcategory => 
    (selectedCategory === null || subcategory.categoryId === selectedCategory) && 
    subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredServices = services.filter(service => 
    (selectedCategory === null || service.categoryId === selectedCategory) &&
    (selectedSubcategory === null || service.subcategoryId === selectedSubcategory) &&
    service.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleServiceSelect = (service: any) => {
    const category = categories.find(c => c.id === service.categoryId);
    const subcategory = subcategories.find(s => s.id === service.subcategoryId);
    
    if (category && subcategory) {
      onServiceSelect({
        categoryId: service.categoryId,
        categoryName: category.name,
        subcategoryId: service.subcategoryId,
        subcategoryName: subcategory.name,
        jobId: service.id,
        jobName: service.name,
        price: service.price,
        estimatedTime: service.estimatedTime
      });
    }
  };

  const handleBack = () => {
    if (selectedSubcategory !== null) {
      setSelectedSubcategory(null);
    } else if (selectedCategory !== null) {
      setSelectedCategory(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search services..."
          className="pl-9"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Navigation breadcrumb */}
      {(selectedCategory !== null || selectedSubcategory !== null) && (
        <div className="flex items-center space-x-2 text-sm">
          <Button variant="ghost" size="sm" onClick={handleBack}>
            Back
          </Button>
          <span className="text-muted-foreground">
            {selectedCategory !== null && categories.find(c => c.id === selectedCategory)?.name}
            {selectedSubcategory !== null && (
              <>
                <ChevronRight className="inline h-4 w-4 mx-1" />
                {subcategories.find(s => s.id === selectedSubcategory)?.name}
              </>
            )}
          </span>
        </div>
      )}
      
      {/* Display categories if no selection yet */}
      {selectedCategory === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredCategories.map((category) => (
            <Card 
              key={category.id} 
              className="p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => handleCategorySelect(category.id)}
            >
              {category.name}
            </Card>
          ))}
        </div>
      )}
      
      {/* Display subcategories if category selected */}
      {selectedCategory !== null && selectedSubcategory === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {filteredSubcategories.map((subcategory) => (
            <Card 
              key={subcategory.id} 
              className="p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => handleSubcategorySelect(subcategory.id)}
            >
              {subcategory.name}
            </Card>
          ))}
        </div>
      )}
      
      {/* Display services if subcategory selected */}
      {selectedSubcategory !== null && (
        <div className="space-y-2">
          {filteredServices.map((service) => (
            <Card 
              key={service.id} 
              className="p-3 cursor-pointer hover:bg-slate-50"
              onClick={() => handleServiceSelect(service)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <div className="font-medium">{service.name}</div>
                  <div className="text-sm text-muted-foreground">{service.estimatedTime} min</div>
                </div>
                <div className="text-right font-semibold">${service.price.toFixed(2)}</div>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Search results if searching */}
      {searchTerm && (
        <div className="space-y-2 mt-4">
          <h3 className="text-sm font-medium">Search Results</h3>
          {filteredServices.length === 0 ? (
            <p className="text-sm text-muted-foreground">No services found</p>
          ) : (
            filteredServices.map((service) => (
              <Card 
                key={service.id} 
                className="p-3 cursor-pointer hover:bg-slate-50"
                onClick={() => handleServiceSelect(service)}
              >
                <div className="flex justify-between">
                  <div>
                    <div className="font-medium">{service.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {categories.find(c => c.id === service.categoryId)?.name} &gt; 
                      {subcategories.find(s => s.id === service.subcategoryId)?.name}
                    </div>
                  </div>
                  <div className="text-right font-semibold">${service.price.toFixed(2)}</div>
                </div>
              </Card>
            ))
          )}
        </div>
      )}
    </div>
  );
}
