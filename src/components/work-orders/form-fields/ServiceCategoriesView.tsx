
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { Clock, DollarSign, Search } from 'lucide-react';

interface ServiceCategoriesViewProps {
  categories: ServiceMainCategory[];
  onServiceSelect?: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: ServiceJob[];
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({
  categories,
  onServiceSelect,
  selectedServices = []
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.jobs.some(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [categories, searchTerm]);

  const handleServiceClick = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (onServiceSelect) {
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.id === serviceId);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-4">
        {filteredCategories.map((category) => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="text-lg">{category.name}</CardTitle>
              {category.description && (
                <CardDescription>{category.description}</CardDescription>
              )}
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="border rounded-lg p-4">
                    <h4 className="font-medium mb-3">{subcategory.name}</h4>
                    <div className="grid gap-2">
                      {subcategory.jobs.map((job) => (
                        <div
                          key={job.id}
                          className={`p-3 border rounded-md cursor-pointer transition-colors ${
                            isServiceSelected(job.id)
                              ? 'bg-blue-50 border-blue-200'
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => handleServiceClick(job, category.name, subcategory.name)}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h5 className="font-medium">{job.name}</h5>
                              {job.description && (
                                <p className="text-sm text-gray-600 mt-1">{job.description}</p>
                              )}
                            </div>
                            <div className="flex flex-col items-end space-y-1">
                              {job.estimatedTime && (
                                <Badge variant="outline" className="text-xs">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {job.estimatedTime}m
                                </Badge>
                              )}
                              {job.price && (
                                <Badge variant="outline" className="text-xs">
                                  <DollarSign className="h-3 w-3 mr-1" />
                                  ${job.price}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
