
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Skeleton } from '@/components/ui/skeleton';

interface ServiceSelectorProps {
  onServiceSelect: (service: {
    categoryId: string;
    categoryName: string;
    subcategoryId: string;
    subcategoryName: string;
    jobId: string;
    jobName: string;
    estimatedTime?: number;
    price?: number;
  }) => void;
}

// Mock service data - replace with API call in production
const fetchServiceHierarchy = async (): Promise<ServiceMainCategory[]> => {
  // This would be an API call in production
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        {
          id: 'cat1',
          name: 'Engine Service',
          description: 'Engine service and repair',
          position: 1,
          subcategories: [
            {
              id: 'sub1',
              name: 'Oil Change',
              description: 'Oil change services',
              jobs: [
                {
                  id: 'job1',
                  name: 'Standard Oil Change',
                  description: 'Standard oil change with filter replacement',
                  estimatedTime: 30,
                  price: 49.99
                },
                {
                  id: 'job2',
                  name: 'Synthetic Oil Change',
                  description: 'Full synthetic oil change with premium filter',
                  estimatedTime: 35,
                  price: 79.99
                }
              ]
            },
            {
              id: 'sub2',
              name: 'Engine Repair',
              description: 'Engine repair services',
              jobs: [
                {
                  id: 'job3',
                  name: 'Timing Belt Replacement',
                  description: 'Replace timing belt and tensioner',
                  estimatedTime: 180,
                  price: 299.99
                }
              ]
            }
          ]
        },
        {
          id: 'cat2',
          name: 'Brake Service',
          description: 'Brake service and repair',
          position: 2,
          subcategories: [
            {
              id: 'sub3',
              name: 'Brake Pads',
              description: 'Brake pad replacement',
              jobs: [
                {
                  id: 'job4',
                  name: 'Front Brake Pads',
                  description: 'Replace front brake pads',
                  estimatedTime: 60,
                  price: 149.99
                },
                {
                  id: 'job5',
                  name: 'Rear Brake Pads',
                  description: 'Replace rear brake pads',
                  estimatedTime: 60,
                  price: 129.99
                }
              ]
            }
          ]
        }
      ]);
    }, 500);
  });
};

export function HierarchicalServiceSelector({ onServiceSelect }: ServiceSelectorProps) {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadServices = async () => {
      try {
        const data = await fetchServiceHierarchy();
        setCategories(data);
        
        // Auto-select first category if exists
        if (data.length > 0) {
          setSelectedCategory(data[0].id);
        }
      } catch (error) {
        console.error("Failed to load service hierarchy:", error);
      } finally {
        setLoading(false);
      }
    };
    
    loadServices();
  }, []);

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategory(categoryId);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryId: string) => {
    setSelectedSubcategory(subcategoryId);
  };

  const handleServiceSelect = (job: ServiceJob, categoryId: string, subcategoryId: string) => {
    // Find category and subcategory names for the selected job
    const category = categories.find(cat => cat.id === categoryId);
    const subcategory = category?.subcategories.find(sub => sub.id === subcategoryId);
    
    if (category && subcategory) {
      onServiceSelect({
        categoryId,
        categoryName: category.name,
        subcategoryId,
        subcategoryName: subcategory.name,
        jobId: job.id,
        jobName: job.name,
        estimatedTime: job.estimatedTime,
        price: job.price
      });
    }
  };

  const filteredCategories = searchTerm 
    ? categories.filter(category => 
        category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        category.subcategories.some(sub => 
          sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          sub.jobs.some(job => job.name.toLowerCase().includes(searchTerm.toLowerCase()))
        )
      )
    : categories;

  if (loading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-24 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input 
        type="text" 
        placeholder="Search services..." 
        className="mb-4"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {filteredCategories.length > 0 ? (
        <Tabs defaultValue="categories">
          <TabsList className="bg-white border-b mb-4 w-full justify-start">
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="recent">Recent Services</TabsTrigger>
          </TabsList>
          
          <TabsContent value="categories" className="mt-0">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Category Selection */}
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="font-medium mb-2">Categories</h4>
                <div className="space-y-1">
                  {filteredCategories.map(category => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "ghost"}
                      className="w-full justify-start text-left"
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>
              
              {/* Subcategory Selection */}
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="font-medium mb-2">Subcategories</h4>
                {selectedCategory ? (
                  <div className="space-y-1">
                    {categories
                      .find(cat => cat.id === selectedCategory)
                      ?.subcategories.map(subcat => (
                        <Button
                          key={subcat.id}
                          variant={selectedSubcategory === subcat.id ? "default" : "ghost"}
                          className="w-full justify-start text-left"
                          onClick={() => handleSubcategorySelect(subcat.id)}
                        >
                          {subcat.name}
                        </Button>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Select a category first</p>
                )}
              </div>
              
              {/* Jobs Selection */}
              <div className="border rounded-md p-3 bg-gray-50">
                <h4 className="font-medium mb-2">Services</h4>
                {selectedSubcategory && selectedCategory ? (
                  <div className="space-y-1">
                    {categories
                      .find(cat => cat.id === selectedCategory)
                      ?.subcategories
                      .find(sub => sub.id === selectedSubcategory)
                      ?.jobs.map(job => (
                        <div
                          key={job.id}
                          className="border rounded-md p-2 hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleServiceSelect(job, selectedCategory, selectedSubcategory)}
                        >
                          <div className="font-medium">{job.name}</div>
                          <div className="flex justify-between text-sm text-gray-500">
                            <span>{job.estimatedTime} min</span>
                            <span>${job.price?.toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                  </div>
                ) : (
                  <p className="text-gray-500 text-sm">Select a subcategory first</p>
                )}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="recent" className="mt-0">
            <p className="text-gray-500">Recently used services will appear here.</p>
          </TabsContent>
        </Tabs>
      ) : (
        <div className="text-center p-4 text-gray-500">
          {searchTerm 
            ? "No services match your search criteria" 
            : "No services available"}
        </div>
      )}
    </div>
  );
}
