
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
}

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  loading,
  error,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedJobId,
  onSelectItem
}) => {
  if (loading) {
    return (
      <div className="flex justify-center items-center h-60">
        <div className="animate-pulse text-gray-500">Loading services...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
        {error}
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center text-gray-500">
        <p className="mb-2">No services configured yet.</p>
        <p className="text-sm">Use the buttons above to create your service catalog.</p>
      </div>
    );
  }

  return (
    <div className="grid md:grid-cols-3 gap-4 h-[500px]">
      {/* Categories Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Categories
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {categories.map(category => (
                <div
                  key={category.id}
                  className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                    selectedCategoryId === category.id
                      ? 'bg-blue-100 text-blue-800 font-medium'
                      : 'hover:bg-gray-50'
                  }`}
                  onClick={() => onSelectItem('category', category.id)}
                >
                  {category.name}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Subcategories Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Subcategories
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {selectedCategoryId ? (
                categories.find(cat => cat.id === selectedCategoryId)?.subcategories.length ? (
                  categories
                    .find(cat => cat.id === selectedCategoryId)
                    ?.subcategories.map(subcategory => (
                      <div
                        key={subcategory.id}
                        className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                          selectedSubcategoryId === subcategory.id
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onSelectItem('subcategory', subcategory.id)}
                      >
                        {subcategory.name}
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No subcategories yet
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a category first
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Jobs/Services Column */}
      <Card className="border border-gray-200 rounded-xl shadow-sm">
        <CardContent className="p-0">
          <div className="border-b border-gray-200 px-4 py-3 font-medium text-sm bg-gray-50">
            Services
          </div>
          <ScrollArea className="h-[450px] rounded-b-xl">
            <div className="p-2">
              {selectedSubcategoryId ? (
                categories
                  .find(cat => cat.id === selectedCategoryId)
                  ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                  ?.jobs.length ? (
                  categories
                    .find(cat => cat.id === selectedCategoryId)
                    ?.subcategories.find(sub => sub.id === selectedSubcategoryId)
                    ?.jobs.map(job => (
                      <div
                        key={job.id}
                        className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                          selectedJobId === job.id
                            ? 'bg-blue-100 text-blue-800 font-medium'
                            : 'hover:bg-gray-50'
                        }`}
                        onClick={() => onSelectItem('job', job.id)}
                      >
                        <div className="font-medium">{job.name}</div>
                        <div className="text-xs text-gray-500">
                          ${job.price} • {job.estimatedTime} min
                        </div>
                      </div>
                    ))
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    No services yet
                  </div>
                )
              ) : (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a subcategory first
                </div>
              )}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
};
