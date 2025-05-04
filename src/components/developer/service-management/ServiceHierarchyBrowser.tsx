
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Tag } from 'lucide-react';

// Define a stronger interface for category color styles
interface CategoryColorStyle {
  bg: string;
  text: string;
  border: string;
  icon?: React.ReactNode;
  pattern?: string; // For background patterns
}

// Predefined color styles array with diverse, non-duplicating colors
const DEFAULT_COLOR_STYLES: CategoryColorStyle[] = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
  { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-300' },
  { bg: 'bg-sky-100', text: 'text-sky-800', border: 'border-sky-300' },
  { bg: 'bg-fuchsia-100', text: 'text-fuchsia-800', border: 'border-fuchsia-300' },
];

interface ServiceHierarchyBrowserProps {
  categories: ServiceMainCategory[];
  loading: boolean;
  error: string | null;
  selectedCategoryId: string | null;
  selectedSubcategoryId: string | null;
  selectedJobId: string | null;
  onSelectItem: (type: 'category' | 'subcategory' | 'job', id: string | null) => void;
  categoryColorMap?: Record<string, string>;
  categoryColors?: CategoryColorStyle[];
}

export const ServiceHierarchyBrowser: React.FC<ServiceHierarchyBrowserProps> = ({
  categories,
  loading,
  error,
  selectedCategoryId,
  selectedSubcategoryId,
  selectedJobId,
  onSelectItem,
  categoryColorMap = {},
  categoryColors = DEFAULT_COLOR_STYLES
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

  // Helper function to get color styles for a category
  const getCategoryColorStyle = (categoryId: string): CategoryColorStyle => {
    if (!categoryColorMap || !categoryColors || categoryColors.length === 0) {
      return DEFAULT_COLOR_STYLES[0];
    }
    
    const colorIndex = parseInt(categoryColorMap[categoryId] || '0');
    return categoryColors[colorIndex % categoryColors.length] || categoryColors[0];
  };

  // Function to generate a unique visual marker for each item
  const getCategoryMarker = (categoryId: string, itemType: string) => {
    const colorIndex = parseInt(categoryColorMap[categoryId] || '0') % categoryColors.length;
    
    // Add a visual marker based on type
    if (itemType === 'category') {
      return <Tag className="w-4 h-4 mr-1" />;
    }
    
    return null;
  };

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
              {categories.map((category, index) => {
                const colorStyle = getCategoryColorStyle(category.id);
                
                return (
                  <div
                    key={category.id}
                    className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                      selectedCategoryId === category.id
                        ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                        : 'hover:bg-gray-50'
                    }`}
                    onClick={() => onSelectItem('category', category.id)}
                  >
                    <div className="flex justify-between items-center">
                      <span className="flex items-center">
                        {getCategoryMarker(category.id, 'category')}
                        {category.name}
                      </span>
                      <Badge 
                        className={`${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} text-xs`}
                      >
                        {category.subcategories.length} subcategories
                      </Badge>
                    </div>
                  </div>
                );
              })}
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
                    ?.subcategories.map(subcategory => {
                      const colorStyle = getCategoryColorStyle(selectedCategoryId);
                      
                      return (
                        <div
                          key={subcategory.id}
                          className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                            selectedSubcategoryId === subcategory.id
                              ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => onSelectItem('subcategory', subcategory.id)}
                        >
                          <div className="flex justify-between items-center">
                            <span className="flex items-center">
                              <span className={`w-2 h-2 rounded-full ${colorStyle.bg} border ${colorStyle.border} mr-2`}></span>
                              {subcategory.name}
                            </span>
                            <Badge 
                              className={`${colorStyle.bg} ${colorStyle.text} border ${colorStyle.border} text-xs`}
                            >
                              {subcategory.jobs.length} services
                            </Badge>
                          </div>
                        </div>
                      );
                    })
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
                    ?.jobs.map(job => {
                      const colorStyle = getCategoryColorStyle(selectedCategoryId || '');
                      
                      return (
                        <div
                          key={job.id}
                          className={`px-3 py-2 rounded-lg cursor-pointer mb-1 ${
                            selectedJobId === job.id
                              ? `${colorStyle.bg} ${colorStyle.text} font-medium border ${colorStyle.border}`
                              : 'hover:bg-gray-50'
                          }`}
                          onClick={() => onSelectItem('job', job.id)}
                        >
                          <div className="font-medium flex items-center gap-2">
                            <span className={`w-1.5 h-1.5 rounded-full ${colorStyle.bg} border ${colorStyle.border}`}></span>
                            {job.name}
                          </div>
                          <div className="text-xs text-gray-500 flex justify-between mt-1 pl-3">
                            <span>${job.price?.toFixed(2) || '0.00'}</span>
                            <span>{job.estimatedTime || 0} min</span>
                          </div>
                        </div>
                      );
                    })
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
