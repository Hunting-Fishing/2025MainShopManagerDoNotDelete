
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import {
  fetchServiceCategories,
  saveServiceCategory,
  deleteServiceCategory
} from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ServiceEditor } from './ServiceEditor';
import { ServiceBulkImport } from './ServiceBulkImport';
import { ServicesPriceReport } from './ServicesPriceReport';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, Filter, PlusCircle, AlertTriangle, Trash2 } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { v4 as uuidv4 } from 'uuid';

// Predefined color scheme for categories
const categoryColors = [
  { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-300' },
  { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' },
  { bg: 'bg-pink-100', text: 'text-pink-800', border: 'border-pink-300' },
  { bg: 'bg-cyan-100', text: 'text-cyan-800', border: 'border-cyan-300' },
  { bg: 'bg-indigo-100', text: 'text-indigo-800', border: 'border-indigo-300' },
  { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-300' },
  { bg: 'bg-orange-100', text: 'text-orange-800', border: 'border-orange-300' },
  { bg: 'bg-lime-100', text: 'text-lime-800', border: 'border-lime-300' },
];

export const ServiceHierarchyManager: React.FC = () => {
  // State variables
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('all'); // all, category, subcategory, job
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({});
  
  const { toast } = useToast();

  // Fetch service categories on component mount
  useEffect(() => {
    loadCategories();
  }, []);

  // Assign colors to categories when they are loaded or changed
  useEffect(() => {
    if (categories.length > 0) {
      const newColorMap: Record<string, string> = {};
      categories.forEach((category, index) => {
        const colorIndex = index % categoryColors.length;
        newColorMap[category.id] = colorIndex.toString();
      });
      setCategoryColorMap(newColorMap);
    }
  }, [categories]);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const data = await fetchServiceCategories();
      
      // Sort categories by position
      const sortedCategories = [...data].sort((a, b) => {
        return (a.position || 0) - (b.position || 0);
      });
      
      setCategories(sortedCategories);
      setError(null);
    } catch (err) {
      console.error('Failed to load service categories:', err);
      setError('Failed to load service hierarchy. Please try again.');
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to load service categories',
      });
    } finally {
      setLoading(false);
    }
  };

  // Filter categories based on search query and filter type
  const filteredCategories = categories.filter(category => {
    // If no search query, return all categories
    if (!searchQuery) return true;
    
    const searchLower = searchQuery.toLowerCase();
    
    // Search in category names
    if (category.name.toLowerCase().includes(searchLower)) return true;
    
    // Search in subcategory names if filter is appropriate
    if (filterType === 'all' || filterType === 'subcategory') {
      if (category.subcategories.some(sub => sub.name.toLowerCase().includes(searchLower))) {
        return true;
      }
    }
    
    // Search in job names if filter is appropriate
    if (filterType === 'all' || filterType === 'job') {
      if (category.subcategories.some(sub => 
        sub.jobs.some(job => job.name.toLowerCase().includes(searchLower))
      )) {
        return true;
      }
    }
    
    return false;
  });

  // Handle adding a new category
  const handleAddCategory = async () => {
    try {
      const newPosition = Math.max(0, ...categories.map(cat => cat.position || 0)) + 1;
      
      const newCategory: ServiceMainCategory = {
        id: uuidv4(),
        name: 'New Category',
        description: '',
        position: newPosition,
        subcategories: [
          {
            id: uuidv4(),
            name: 'New Subcategory',
            description: '',
            jobs: [
              {
                id: uuidv4(),
                name: 'New Service',
                description: '',
                estimatedTime: 60,
                price: 99.99
              }
            ]
          }
        ]
      };
      
      // Save to database
      await saveServiceCategory(newCategory);
      
      // Update local state
      setCategories([...categories, newCategory]);
      
      // Select the new category
      setSelectedCategoryId(newCategory.id);
      setSelectedSubcategoryId(newCategory.subcategories[0].id);
      setSelectedJobId(newCategory.subcategories[0].jobs[0].id);
      
      toast({
        title: 'Success',
        description: 'New service category added'
      });
    } catch (err) {
      console.error('Failed to add category:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to add new category'
      });
    }
  };

  // Handle selecting an item in the hierarchy
  const handleSelectItem = (type: 'category' | 'subcategory' | 'job', id: string | null) => {
    if (type === 'category') {
      setSelectedCategoryId(id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
    } else if (type === 'subcategory') {
      setSelectedSubcategoryId(id);
      setSelectedJobId(null);
    } else {
      setSelectedJobId(id);
    }
  };

  // Save changes to a category, subcategory, or job
  const handleSave = async (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    if (!selectedCategoryId) return;

    try {
      // Find the category to update
      const categoryIndex = categories.findIndex(cat => cat.id === selectedCategoryId);
      if (categoryIndex === -1) return;

      // Create a deep copy of categories array
      const updatedCategories = JSON.parse(JSON.stringify(categories)) as ServiceMainCategory[];

      if (updatedCategory) {
        // Update the category
        updatedCategories[categoryIndex] = {
          ...updatedCategories[categoryIndex],
          name: updatedCategory.name,
          description: updatedCategory.description
        };
      } else if (updatedSubcategory && selectedSubcategoryId) {
        // Find and update the subcategory
        const subcategoryIndex = updatedCategories[categoryIndex].subcategories.findIndex(
          sub => sub.id === selectedSubcategoryId
        );
        
        if (subcategoryIndex !== -1) {
          updatedCategories[categoryIndex].subcategories[subcategoryIndex] = {
            ...updatedCategories[categoryIndex].subcategories[subcategoryIndex],
            name: updatedSubcategory.name,
            description: updatedSubcategory.description
          };
        }
      } else if (updatedJob && selectedSubcategoryId && selectedJobId) {
        // Find and update the job
        const subcategoryIndex = updatedCategories[categoryIndex].subcategories.findIndex(
          sub => sub.id === selectedSubcategoryId
        );
        
        if (subcategoryIndex !== -1) {
          const jobIndex = updatedCategories[categoryIndex].subcategories[subcategoryIndex].jobs.findIndex(
            job => job.id === selectedJobId
          );
          
          if (jobIndex !== -1) {
            updatedCategories[categoryIndex].subcategories[subcategoryIndex].jobs[jobIndex] = {
              ...updatedCategories[categoryIndex].subcategories[subcategoryIndex].jobs[jobIndex],
              ...updatedJob
            };
          }
        }
      }

      // Save to database
      await saveServiceCategory(updatedCategories[categoryIndex]);
      
      // Update local state
      setCategories(updatedCategories);
      
      toast({
        title: 'Success',
        description: 'Service information saved successfully'
      });
    } catch (err) {
      console.error('Failed to save changes:', err);
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save changes'
      });
    }
  };

  // Get currently selected items
  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subcategories.find(
    sub => sub.id === selectedSubcategoryId
  );
  const selectedJob = selectedSubcategory?.jobs.find(job => job.id === selectedJobId);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <h1 className="text-2xl font-bold tracking-tight">Service Management</h1>
        <p className="text-muted-foreground">
          Manage your service hierarchy, pricing, and specifications
        </p>
      </div>

      <div className="flex items-center justify-between space-x-4 mb-4">
        <div className="flex-1 flex space-x-2">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search services..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="category">Categories</SelectItem>
              <SelectItem value="subcategory">Subcategories</SelectItem>
              <SelectItem value="job">Services</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={handleAddCategory}>
          <PlusCircle className="h-4 w-4 mr-2" />
          Add Category
        </Button>
      </div>
      
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((category, index) => {
          const colorIndex = parseInt(categoryColorMap[category.id] || '0');
          const colorStyle = categoryColors[colorIndex];
          
          return (
            <Badge 
              key={category.id}
              className={`${colorStyle.bg} ${colorStyle.text} ${colorStyle.border} cursor-pointer hover:opacity-80`}
              onClick={() => handleSelectItem('category', category.id)}
            >
              {category.name}
            </Badge>
          );
        })}
      </div>

      <Tabs defaultValue="browse" className="w-full">
        <TabsList className="grid grid-cols-4 w-full max-w-md">
          <TabsTrigger value="browse">Browse</TabsTrigger>
          <TabsTrigger value="edit">Edit</TabsTrigger>
          <TabsTrigger value="bulk-import">Bulk Import</TabsTrigger>
          <TabsTrigger value="reports">Reports</TabsTrigger>
        </TabsList>

        <TabsContent value="browse">
          <Card>
            <CardHeader>
              <CardTitle>Service Hierarchy Browser</CardTitle>
            </CardHeader>
            <CardContent>
              <ServiceHierarchyBrowser
                categories={filteredCategories}
                loading={loading}
                error={error}
                selectedCategoryId={selectedCategoryId}
                selectedSubcategoryId={selectedSubcategoryId}
                selectedJobId={selectedJobId}
                onSelectItem={handleSelectItem}
                categoryColorMap={categoryColorMap}
                categoryColors={categoryColors}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edit">
          <Card>
            <CardHeader>
              <CardTitle>Service Editor</CardTitle>
            </CardHeader>
            <CardContent>
              {selectedCategoryId ? (
                <ServiceEditor
                  category={selectedCategory}
                  subcategory={selectedSubcategory}
                  job={selectedJob}
                  onSave={handleSave}
                  categoryColors={categoryColors}
                  colorIndex={parseInt(categoryColorMap[selectedCategoryId] || '0')}
                  onColorChange={(index: number) => {
                    const newColorMap = { ...categoryColorMap };
                    newColorMap[selectedCategoryId] = index.toString();
                    setCategoryColorMap(newColorMap);
                  }}
                />
              ) : (
                <div className="py-8 text-center">
                  <AlertTriangle className="h-12 w-12 mx-auto text-amber-500 mb-4" />
                  <h3 className="text-lg font-semibold mb-1">No Service Selected</h3>
                  <p className="text-gray-500">
                    Please select a category, subcategory, or service from the browser to edit
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bulk-import">
          <ServiceBulkImport onImportComplete={loadCategories} />
        </TabsContent>

        <TabsContent value="reports">
          <ServicesPriceReport categories={categories} />
        </TabsContent>
      </Tabs>
    </div>
  );
};
