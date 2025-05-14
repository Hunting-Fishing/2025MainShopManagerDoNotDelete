
import React, { useState, useEffect } from 'react';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSubcategoryGrid } from './ServiceSubcategoryGrid';
import { ServiceItem } from '@/types/services';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/lib/supabase';
import { Loader2 } from "lucide-react";

export interface HierarchicalServiceSelectorProps {
  onSelectService: (service: ServiceItem) => void;
}

export function HierarchicalServiceSelector({ onSelectService }: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [categoryNames, setCategoryNames] = useState<string[]>([]);
  const [subcategoryNames, setSubcategoryNames] = useState<string[]>([]);
  const [services, setServices] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch service hierarchy data from Supabase
  useEffect(() => {
    const fetchServiceHierarchy = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        const { data, error } = await supabase
          .from('service_hierarchy')
          .select('*')
          .order('position');
          
        if (error) {
          throw new Error(error.message);
        }
        
        if (data) {
          setServiceCategories(data);
          
          // Extract category names
          const categories = data.map(category => category.name);
          setCategoryNames(categories);
          
          // If there are categories, select the first one by default
          if (categories.length > 0) {
            setSelectedCategory(categories[0]);
          }
        }
      } catch (err: any) {
        console.error("Error fetching service hierarchy:", err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchServiceHierarchy();
  }, []);
  
  // Update subcategories when a category is selected
  useEffect(() => {
    if (selectedCategory) {
      const category = serviceCategories.find(cat => cat.name === selectedCategory);
      if (category && category.subcategories) {
        // Extract subcategory names
        const subcategories = category.subcategories.map(sub => sub.name);
        setSubcategoryNames(subcategories);
        setSelectedSubcategory(null); // Reset selected subcategory
        setServices([]); // Reset services
      } else {
        setSubcategoryNames([]);
      }
    }
  }, [selectedCategory, serviceCategories]);
  
  // Update services when a subcategory is selected
  useEffect(() => {
    if (selectedCategory && selectedSubcategory) {
      const category = serviceCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        const subcategory = category.subcategories.find(sub => sub.name === selectedSubcategory);
        if (subcategory && subcategory.jobs) {
          // Extract service names from jobs
          const serviceList = subcategory.jobs.map(job => job.name);
          setServices(serviceList);
        } else {
          setServices([]);
        }
      }
    }
  }, [selectedSubcategory, selectedCategory, serviceCategories]);

  // Handle service selection
  const handleServiceSelect = (serviceName: string) => {
    if (selectedCategory && selectedSubcategory) {
      // Find the service/job details
      const category = serviceCategories.find(cat => cat.name === selectedCategory);
      if (category) {
        const subcategory = category.subcategories.find(sub => sub.name === selectedSubcategory);
        if (subcategory) {
          const job = subcategory.jobs.find(job => job.name === serviceName);
          
          const newService: ServiceItem = {
            name: serviceName,
            services: [], // This is required by the ServiceItem type
            category: `${selectedCategory} > ${selectedSubcategory}`,
            price: job?.price || 0, // Use job price if available
            quantity: 1 // Default quantity
          };
          
          onSelectService(newService);
        }
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading services: {error}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left column - Main Categories */}
      <div className="border rounded-md overflow-hidden">
        <ServiceCategoryList 
          categories={categoryNames}
          selectedCategory={selectedCategory}
          onCategorySelect={setSelectedCategory}
        />
      </div>
      
      {/* Middle column - Subcategories */}
      <div className="border rounded-md overflow-hidden">
        {selectedCategory ? (
          <ServiceSubcategoryGrid
            category={selectedCategory}
            subcategories={subcategoryNames}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
          />
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Select a category first
          </div>
        )}
      </div>
      
      {/* Right column - Individual Services */}
      <div className="border rounded-md overflow-hidden">
        {selectedCategory && selectedSubcategory ? (
          <div className="p-4">
            <h3 className="font-medium mb-2">Services</h3>
            <ul className="space-y-1">
              {services.map((service, i) => (
                <li key={i}>
                  <button
                    className="w-full text-left px-2 py-1.5 hover:bg-blue-50 rounded-md text-sm transition"
                    onClick={() => handleServiceSelect(service)}
                  >
                    {service}
                  </button>
                </li>
              ))}
              {services.length === 0 && (
                <li className="text-center text-gray-500 p-2">
                  No services available
                </li>
              )}
            </ul>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Select a subcategory to view services
          </div>
        )}
      </div>
    </div>
  );
}
