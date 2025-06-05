
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { 
  Loader2, 
  Building, 
  Folder, 
  FolderOpen, 
  Wrench, 
  Edit, 
  Plus,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

interface ServiceJobItemProps {
  job: ServiceJob;
  onEdit?: (job: ServiceJob) => void;
}

const ServiceJobItem: React.FC<ServiceJobItemProps> = ({ job, onEdit }) => (
  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border-l-4 border-l-blue-200">
    <div className="flex items-center space-x-3">
      <Wrench className="h-4 w-4 text-blue-600" />
      <div>
        <h5 className="font-medium text-sm">{job.name}</h5>
        {job.description && (
          <p className="text-xs text-gray-600 mt-1">{job.description}</p>
        )}
        <div className="flex items-center space-x-4 mt-1">
          {job.estimatedTime && (
            <span className="text-xs text-gray-500">
              {job.estimatedTime} min
            </span>
          )}
          {job.price && (
            <span className="text-xs font-medium text-green-600">
              ${job.price}
            </span>
          )}
        </div>
      </div>
    </div>
    <Button
      variant="ghost"
      size="sm"
      onClick={() => onEdit?.(job)}
      className="opacity-0 group-hover:opacity-100 transition-opacity"
    >
      <Edit className="h-3 w-3" />
    </Button>
  </div>
);

interface ServiceSubcategoryItemProps {
  subcategory: ServiceSubcategory;
  onEdit?: (subcategory: ServiceSubcategory) => void;
  onEditJob?: (job: ServiceJob) => void;
}

const ServiceSubcategoryItem: React.FC<ServiceSubcategoryItemProps> = ({ 
  subcategory, 
  onEdit, 
  onEditJob 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  
  return (
    <div className="border border-gray-200 rounded-lg">
      <div 
        className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 group"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center space-x-3">
          {isExpanded ? (
            <ChevronDown className="h-4 w-4 text-gray-600" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-600" />
          )}
          <FolderOpen className="h-4 w-4 text-orange-600" />
          <div>
            <h4 className="font-medium text-sm">{subcategory.name}</h4>
            {subcategory.description && (
              <p className="text-xs text-gray-600 mt-1">{subcategory.description}</p>
            )}
            <Badge variant="secondary" className="mt-1 text-xs">
              {subcategory.jobs.length} services
            </Badge>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={(e) => {
            e.stopPropagation();
            onEdit?.(subcategory);
          }}
          className="opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <Edit className="h-3 w-3" />
        </Button>
      </div>
      
      {isExpanded && subcategory.jobs.length > 0 && (
        <div className="px-3 pb-3 space-y-2 border-t border-gray-100">
          {subcategory.jobs.map((job) => (
            <ServiceJobItem
              key={job.id}
              job={job}
              onEdit={onEditJob}
            />
          ))}
        </div>
      )}
      
      {isExpanded && subcategory.jobs.length === 0 && (
        <div className="px-3 pb-3 border-t border-gray-100">
          <div className="text-center py-4 text-gray-500">
            <Wrench className="h-8 w-8 mx-auto mb-2 text-gray-300" />
            <p className="text-sm">No services found</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-3 w-3 mr-1" />
              Add Service
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

interface ServiceCategoryItemProps {
  category: ServiceMainCategory;
  onEdit?: (category: ServiceMainCategory) => void;
  onEditSubcategory?: (subcategory: ServiceSubcategory) => void;
  onEditJob?: (job: ServiceJob) => void;
}

const ServiceCategoryItem: React.FC<ServiceCategoryItemProps> = ({ 
  category, 
  onEdit, 
  onEditSubcategory, 
  onEditJob 
}) => {
  const totalServices = category.subcategories.reduce(
    (total, sub) => total + sub.jobs.length, 
    0
  );

  return (
    <AccordionItem value={category.id} className="border border-gray-200 rounded-lg">
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50 group">
        <div className="flex items-center justify-between w-full">
          <div className="flex items-center space-x-3">
            <Folder className="h-5 w-5 text-blue-600" />
            <div className="text-left">
              <h3 className="font-semibold text-base">{category.name}</h3>
              {category.description && (
                <p className="text-sm text-gray-600 mt-1">{category.description}</p>
              )}
              <div className="flex items-center space-x-3 mt-2">
                <Badge variant="outline" className="text-xs">
                  {category.subcategories.length} subcategories
                </Badge>
                <Badge variant="secondary" className="text-xs">
                  {totalServices} services
                </Badge>
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit?.(category);
            }}
            className="opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4">
        {category.subcategories.length > 0 ? (
          <div className="space-y-3">
            {category.subcategories.map((subcategory) => (
              <ServiceSubcategoryItem
                key={subcategory.id}
                subcategory={subcategory}
                onEdit={onEditSubcategory}
                onEditJob={onEditJob}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-6 text-gray-500">
            <FolderOpen className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No subcategories found</p>
            <Button variant="outline" size="sm" className="mt-2">
              <Plus className="h-4 w-4 mr-2" />
              Add Subcategory
            </Button>
          </div>
        )}
      </AccordionContent>
    </AccordionItem>
  );
};

export function ServiceHierarchyTree() {
  const { sectors, loading, error } = useServiceSectors();
  const [expandedSectors, setExpandedSectors] = useState<string[]>([]);

  const handleExpandAll = () => {
    setExpandedSectors(sectors.map(sector => sector.id));
  };

  const handleCollapseAll = () => {
    setExpandedSectors([]);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Hierarchy</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading service hierarchy: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Building className="h-5 w-5" />
            <span>Service Hierarchy ({sectors.length} sectors)</span>
          </CardTitle>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleExpandAll}
              disabled={expandedSectors.length === sectors.length}
            >
              Expand All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleCollapseAll}
              disabled={expandedSectors.length === 0}
            >
              Collapse All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {sectors.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Building className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <p className="text-lg font-medium">No service sectors found</p>
            <p className="text-sm">Import services to populate the hierarchy</p>
            <Button variant="outline" className="mt-4">
              <Plus className="h-4 w-4 mr-2" />
              Add Sector
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {sectors.map((sector) => {
              const totalCategories = sector.categories.length;
              const totalServices = sector.categories.reduce(
                (total, cat) => total + cat.subcategories.reduce(
                  (subTotal, sub) => subTotal + sub.jobs.length, 0
                ), 0
              );

              return (
                <div key={sector.id} className="border border-gray-300 rounded-lg">
                  <Accordion 
                    type="single" 
                    collapsible
                    value={expandedSectors.includes(sector.id) ? sector.id : undefined}
                    onValueChange={(value) => {
                      if (value === sector.id) {
                        setExpandedSectors([...expandedSectors, sector.id]);
                      } else {
                        setExpandedSectors(expandedSectors.filter(id => id !== sector.id));
                      }
                    }}
                  >
                    <AccordionItem value={sector.id} className="border-none">
                      <AccordionTrigger className="px-4 py-4 hover:no-underline hover:bg-gray-50 group">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center space-x-4">
                            <Building className="h-6 w-6 text-purple-600" />
                            <div className="text-left">
                              <h2 className="text-lg font-bold">{sector.name}</h2>
                              {sector.description && (
                                <p className="text-sm text-gray-600 mt-1">{sector.description}</p>
                              )}
                              <div className="flex items-center space-x-4 mt-2">
                                <Badge className="bg-purple-100 text-purple-800">
                                  {totalCategories} categories
                                </Badge>
                                <Badge variant="secondary">
                                  {totalServices} total services
                                </Badge>
                                {!sector.is_active && (
                                  <Badge variant="destructive">Inactive</Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-4 pb-4">
                        {sector.categories.length > 0 ? (
                          <Accordion type="multiple" className="space-y-3">
                            {sector.categories.map((category) => (
                              <ServiceCategoryItem
                                key={category.id}
                                category={category}
                              />
                            ))}
                          </Accordion>
                        ) : (
                          <div className="text-center py-8 text-gray-500">
                            <Folder className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                            <p>No categories found in this sector</p>
                            <Button variant="outline" size="sm" className="mt-2">
                              <Plus className="h-4 w-4 mr-2" />
                              Add Category
                            </Button>
                          </div>
                        )}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
