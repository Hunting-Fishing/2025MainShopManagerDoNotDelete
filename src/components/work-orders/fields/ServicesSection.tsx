
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Check, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { HierarchicalServiceSelector } from './services/HierarchicalServiceSelector';
import { ServiceItem } from '@/types/services';

interface ServicesSectionProps {
  services: ServiceItem[];
  setServices: (services: ServiceItem[]) => void;
}

export function ServicesSection({ services, setServices }: ServicesSectionProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [customService, setCustomService] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('General');
  
  // Add a new custom service
  const handleAddCustomService = (e: React.FormEvent) => {
    // Prevent default form submission behavior which causes page jumps
    e.preventDefault();
    
    if (customService.trim()) {
      const newService: ServiceItem = {
        name: customService.trim(),
        services: [],
        quantity: 1
      };
      setServices([...services, newService]);
      setCustomService('');
      // Don't close the add panel to allow adding multiple services
      // setIsAdding(false);
    }
  };
  
  // Delete a service
  const handleDeleteService = (e: React.MouseEvent, index: number) => {
    // Prevent default button behavior
    e.preventDefault();
    
    const updatedServices = [...services];
    updatedServices.splice(index, 1);
    setServices(updatedServices);
  };
  
  // Handle service selection from the hierarchical selector
  const handleServiceSelect = (service: ServiceItem) => {
    // Add quantity property to the service if it doesn't exist
    const serviceWithQuantity = {
      ...service,
      quantity: service.quantity || 1
    };
    setServices([...services, serviceWithQuantity]);
    // Don't close the add panel to allow adding multiple services
    // setIsAdding(false);
  };
  
  return (
    <Card className="shadow-sm">
      <CardHeader className="bg-blue-50/70 border-b px-4 py-3 flex flex-row justify-between items-center space-y-0">
        <CardTitle className="text-lg font-medium">Services</CardTitle>
        {!isAdding && (
          <Button 
            variant="outline" 
            size="sm" 
            onClick={(e) => {
              e.preventDefault(); // Prevent page jumping
              setIsAdding(true);
            }}
            className="h-8 rounded-full text-sm bg-white border-blue-200"
          >
            <PlusCircle className="mr-1 h-3.5 w-3.5" />
            Add Service
          </Button>
        )}
      </CardHeader>
      
      <CardContent className="p-0">
        {isAdding && (
          <div className="p-4 border-b">
            <HierarchicalServiceSelector onSelectService={handleServiceSelect} />
            
            <div className="mt-4 pt-4 border-t">
              <p className="text-sm font-medium mb-2">Or add a custom service:</p>
              <form onSubmit={handleAddCustomService} className="flex space-x-2">
                <div className="flex-1">
                  <Input
                    placeholder="Enter custom service name"
                    value={customService}
                    onChange={(e) => setCustomService(e.target.value)}
                    className="h-9"
                  />
                </div>
                <Button 
                  type="button"
                  size="sm"
                  variant="ghost"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsAdding(false);
                  }}
                  className="h-9 px-2"
                >
                  <X className="h-4 w-4" />
                </Button>
                <Button 
                  type="submit"
                  size="sm"
                  variant="default"
                  disabled={!customService.trim()}
                  className="h-9"
                >
                  <Check className="h-4 w-4 mr-1" />
                  Add
                </Button>
              </form>
            </div>
            
            {/* Show selected services even while adding mode is active */}
            {services.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <h3 className="text-sm font-medium mb-2">Selected Services:</h3>
                <ul className="divide-y border rounded-md">
                  {services.map((service, index) => (
                    <li key={index} className="px-4 py-3 flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{service.name}</h4>
                        {service.category && (
                          <p className="text-sm text-muted-foreground">{service.category}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {service.price !== undefined && (
                          <span className="text-blue-600 font-medium">${service.price}</span>
                        )}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-8 w-8 p-0" 
                          onClick={(e) => handleDeleteService(e, index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex justify-end">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={(e) => {
                      e.preventDefault();
                      setIsAdding(false);
                    }}
                    className="h-8"
                  >
                    Done Adding Services
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
        
        {!isAdding && (
          services.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <p>No services have been added yet</p>
              <Button 
                variant="link" 
                onClick={(e) => {
                  e.preventDefault(); // Prevent page jumping
                  setIsAdding(true);
                }}
                className="mt-2"
              >
                Add your first service
              </Button>
            </div>
          ) : (
            <ul className="divide-y">
              {services.map((service, index) => (
                <li key={index} className="px-4 py-3 flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">{service.name}</h4>
                    {service.category && (
                      <p className="text-sm text-muted-foreground">{service.category}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {service.price !== undefined && (
                      <span className="text-blue-600 font-medium">${service.price}</span>
                    )}
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-8 w-8 p-0" 
                      onClick={(e) => handleDeleteService(e, index)}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )
        )}
      </CardContent>
    </Card>
  );
}
