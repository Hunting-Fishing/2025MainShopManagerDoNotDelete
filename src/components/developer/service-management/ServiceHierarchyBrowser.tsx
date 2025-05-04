
import React from 'react';
import { 
  ServiceMainCategory, 
  ServiceSubcategory, 
  ServiceJob 
} from '@/types/serviceHierarchy';
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from '@/components/ui/accordion';
import { formatCurrency } from '@/lib/utils';
import { formatTime } from '@/lib/services/serviceUtils';
import { Trash2, Edit, Clock, DollarSign } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  selectedCategory: ServiceMainCategory | null;
  selectedSubcategory: ServiceSubcategory | null;
  selectedJob: ServiceJob | null;
  onCategorySelect: (category: ServiceMainCategory) => void;
  onSubcategorySelect: (subcategory: ServiceSubcategory, category: ServiceMainCategory) => void;
  onJobSelect: (job: ServiceJob, subcategory: ServiceSubcategory, category: ServiceMainCategory) => void;
  onCategoryDelete: (categoryId: string) => void;
}

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  selectedCategory,
  selectedSubcategory,
  selectedJob,
  onCategorySelect,
  onSubcategorySelect,
  onJobSelect,
  onCategoryDelete
}) => {
  // If no categories are available, show empty state
  if (categories.length === 0) {
    return (
      <div className="p-4 text-center border border-dashed border-gray-300 rounded-md bg-gray-50">
        <p className="text-gray-500 mb-2">No service categories available</p>
        <p className="text-sm text-gray-400">Create a new category to get started</p>
      </div>
    );
  }

  return (
    <ScrollArea className="h-[600px] pr-4">
      <Accordion type="multiple" className="w-full">
        {categories.map(category => (
          <AccordionItem 
            value={category.id} 
            key={category.id}
            className={`border mb-2 rounded-md ${selectedCategory?.id === category.id ? 'bg-blue-50 border-blue-200' : ''}`}
          >
            <div className="flex items-center justify-between pr-4">
              <AccordionTrigger 
                className={`hover:bg-gray-50 px-3 py-2 rounded-t-md flex-grow ${selectedCategory?.id === category.id ? 'text-blue-700 hover:bg-blue-100' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onCategorySelect(category);
                }}
              >
                <span className="font-medium">{category.name}</span>
                <span className="ml-2 text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">
                  {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                </span>
              </AccordionTrigger>
              
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => onCategoryDelete(category.id)}
              >
                <Trash2 className="h-4 w-4 text-gray-500 hover:text-red-500" />
              </Button>
            </div>
            
            <AccordionContent>
              <div className="pl-4 pr-2 pb-2">
                {category.subcategories.length > 0 ? (
                  category.subcategories.map(subcategory => (
                    <div 
                      key={subcategory.id}
                      className={`border rounded-md mb-2 ${selectedSubcategory?.id === subcategory.id ? 'bg-indigo-50 border-indigo-200' : ''}`}
                    >
                      <div 
                        className={`px-3 py-2 cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedSubcategory?.id === subcategory.id ? 'text-indigo-700 hover:bg-indigo-100' : ''}`}
                        onClick={() => onSubcategorySelect(subcategory, category)}
                      >
                        <div className="font-medium">{subcategory.name}</div>
                        <span className="text-xs bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded-full">
                          {subcategory.jobs.length} items
                        </span>
                      </div>
                      
                      {subcategory.jobs.length > 0 && (
                        <div className="px-3 py-2 border-t">
                          {subcategory.jobs.map(job => (
                            <div 
                              key={job.id}
                              className={`px-2 py-1.5 my-1 rounded cursor-pointer hover:bg-gray-50 flex items-center justify-between ${selectedJob?.id === job.id ? 'bg-purple-50 text-purple-700' : ''}`}
                              onClick={() => onJobSelect(job, subcategory, category)}
                            >
                              <span className="text-sm">{job.name}</span>
                              <div className="flex items-center space-x-2">
                                {job.estimatedTime && (
                                  <span className="text-xs flex items-center text-gray-500" title="Estimated time">
                                    <Clock className="h-3 w-3 mr-1" />
                                    {formatTime(job.estimatedTime)}
                                  </span>
                                )}
                                {job.price && (
                                  <span className="text-xs flex items-center text-gray-500" title="Price">
                                    <DollarSign className="h-3 w-3 mr-1" />
                                    {formatCurrency(job.price)}
                                  </span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="text-center py-2 text-sm text-gray-500">
                    No subcategories available
                  </div>
                )}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </ScrollArea>
  );
};
