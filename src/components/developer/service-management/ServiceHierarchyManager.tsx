
import React, { useState, useCallback, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusCircle } from 'lucide-react';
import { CategoryColorStyle, DEFAULT_COLOR_STYLES } from '../ServiceEditor';
import { toast } from 'sonner';
import ServiceCategoriesList from './hierarchy/ServiceCategoriesList';
import { ServiceSearchBar } from './hierarchy/ServiceSearchBar';
import ServiceEditor from '../ServiceEditor';
import ServiceAnalytics from '../ServiceAnalytics';
import ServicesPriceReport from '../ServicesPriceReport';
import ServiceBulkImport from '../ServiceBulkImport';

// Mock data and functions would typically come from a data service
// This is a placeholder implementation
const generateMockCategory = (id: string, name: string, position: number): ServiceMainCategory => ({
  id,
  name,
  description: `Description for ${name}`,
  position,
  subcategories: []
});

const ServiceHierarchyManager: React.FC = () => {
  // State for the service hierarchy
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [categoryColorIndices, setCategoryColorIndices] = useState<Record<string, number>>({});
  const [activeTab, setActiveTab] = useState('services');

  // Effect to load initial data
  useEffect(() => {
    // This would typically be an API call
    const mockCategories = [
      generateMockCategory('cat1', 'Engine Repair', 1),
      generateMockCategory('cat2', 'Transmission', 2),
      generateMockCategory('cat3', 'Brake System', 3),
      generateMockCategory('cat4', 'Electrical', 4),
      generateMockCategory('cat5', 'Cooling System', 5),
    ];

    // Add some subcategories and jobs for demo
    mockCategories[0].subcategories = [
      { 
        id: 'sub1', 
        name: 'Engine Diagnostics',
        description: 'Computer diagnostics of engine issues',
        jobs: [
          { id: 'job1', name: 'Check Engine Light Diagnosis', description: 'Diagnose check engine light', price: 89.99, estimatedTime: 60 },
          { id: 'job2', name: 'Performance Testing', description: 'Analyze engine performance', price: 129.99, estimatedTime: 90 }
        ]
      },
      { 
        id: 'sub2', 
        name: 'Engine Replacement',
        description: 'Full or partial engine replacement services',
        jobs: [
          { id: 'job3', name: 'Full Engine Replacement', description: 'Complete engine replacement', price: 3500, estimatedTime: 720 },
          { id: 'job4', name: 'Head Gasket Replacement', description: 'Replace head gasket', price: 1200, estimatedTime: 360 }
        ]
      }
    ];

    mockCategories[1].subcategories = [
      { 
        id: 'sub3', 
        name: 'Transmission Fluid',
        description: 'Transmission fluid services',
        jobs: [
          { id: 'job5', name: 'Transmission Fluid Change', description: 'Complete fluid replacement', price: 149.99, estimatedTime: 60 }
        ]
      }
    ];

    setCategories(mockCategories);
    
    // Set default color indices
    const initialColorIndices: Record<string, number> = {};
    mockCategories.forEach((cat, index) => {
      initialColorIndices[cat.id] = index % DEFAULT_COLOR_STYLES.length;
    });
    setCategoryColorIndices(initialColorIndices);
  }, []);

  // Handlers for selection
  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    setIsAdding(false);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(null);
    setIsAdding(false);
  };

  const handleJobSelect = (job: ServiceJob) => {
    setSelectedJob(job);
    setIsAdding(false);
  };

  // Handler for search
  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  // Handler for adding new items
  const handleAddNewItem = () => {
    setIsAdding(true);
    setSelectedSubcategory(null);
    setSelectedJob(null);
  };

  // Handler for changing a category's color
  const handleCategoryColorChange = (categoryId: string, colorIndex: number) => {
    setCategoryColorIndices(prev => ({
      ...prev,
      [categoryId]: colorIndex
    }));
    
    toast.success("Category color updated");
  };

  // Save handler for the editor
  const handleSaveItem = useCallback(async (
    updatedCategory: ServiceMainCategory | null,
    updatedSubcategory: ServiceSubcategory | null,
    updatedJob: ServiceJob | null
  ) => {
    // This would typically involve API calls

    // Handle category updates
    if (updatedCategory) {
      setCategories(prevCategories => 
        prevCategories.map(c => 
          c.id === updatedCategory.id ? updatedCategory : c
        )
      );
      setSelectedCategory(updatedCategory);
      toast.success("Category updated successfully");
    }

    // Handle subcategory updates
    if (updatedSubcategory && selectedCategory) {
      const updatedCategories = categories.map(c => {
        if (c.id === selectedCategory.id) {
          const updatedSubcategories = (c.subcategories || []).map(s => 
            s.id === updatedSubcategory.id ? updatedSubcategory : s
          );
          return { ...c, subcategories: updatedSubcategories };
        }
        return c;
      });
      
      setCategories(updatedCategories);
      const updatedCategory = updatedCategories.find(c => c.id === selectedCategory.id);
      setSelectedCategory(updatedCategory || null);
      setSelectedSubcategory(updatedSubcategory);
      toast.success("Subcategory updated successfully");
    }

    // Handle job updates
    if (updatedJob && selectedSubcategory && selectedCategory) {
      const updatedCategories = categories.map(c => {
        if (c.id === selectedCategory.id) {
          const updatedSubcategories = (c.subcategories || []).map(s => {
            if (s.id === selectedSubcategory.id) {
              const updatedJobs = (s.jobs || []).map(j => 
                j.id === updatedJob.id ? updatedJob : j
              );
              return { ...s, jobs: updatedJobs };
            }
            return s;
          });
          return { ...c, subcategories: updatedSubcategories };
        }
        return c;
      });
      
      setCategories(updatedCategories);
      toast.success("Service job updated successfully");
    }

    setIsAdding(false);
  }, [categories, selectedCategory, selectedSubcategory]);

  // Delete handler
  const handleDeleteItem = async (categoryId: string) => {
    // This would typically be an API call
    setCategories(prevCategories => prevCategories.filter(c => c.id !== categoryId));
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSelectedJob(null);
    toast.success("Category deleted successfully");
  };

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white rounded-full p-1 border shadow-sm">
          <TabsTrigger value="services" className="rounded-full text-sm px-4 py-2">
            Services
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full text-sm px-4 py-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="pricing" className="rounded-full text-sm px-4 py-2">
            Pricing
          </TabsTrigger>
          <TabsTrigger value="import" className="rounded-full text-sm px-4 py-2">
            Import/Export
          </TabsTrigger>
        </TabsList>

        <TabsContent value="services" className="mt-4">
          <div className="flex justify-between items-center mb-4">
            <ServiceSearchBar 
              query={searchQuery} 
              onQueryChange={setSearchQuery} 
              placeholder="Search categories, services..."
              onSearch={handleSearch}
            />
            
            <Button onClick={handleAddNewItem} className="flex items-center gap-1">
              <PlusCircle className="h-4 w-4" /> Add Category
            </Button>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div>
              <ServiceCategoriesList 
                categories={categories}
                selectedCategory={selectedCategory}
                selectedSubcategory={selectedSubcategory}
                selectedJob={selectedJob}
                searchQuery={searchQuery}
                onCategorySelect={handleCategorySelect}
                onSubcategorySelect={handleSubcategorySelect}
                onJobSelect={handleJobSelect}
                categoryColors={DEFAULT_COLOR_STYLES}
                categoryColorIndices={categoryColorIndices}
              />
            </div>
            
            <div className="lg:col-span-2">
              <ServiceEditor 
                category={selectedCategory || undefined}
                subcategory={selectedSubcategory || undefined}
                job={selectedJob || undefined}
                onSave={handleSaveItem}
                onDelete={handleDeleteItem}
                categoryColors={DEFAULT_COLOR_STYLES}
                colorIndex={selectedCategory ? categoryColorIndices[selectedCategory.id] || 0 : 0}
                onColorChange={(index) => {
                  if (selectedCategory) {
                    handleCategoryColorChange(selectedCategory.id, index);
                  }
                }}
              />
            </div>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="mt-4">
          <ServiceAnalytics categories={categories} />
        </TabsContent>

        <TabsContent value="pricing" className="mt-4">
          <ServicesPriceReport categories={categories} />
        </TabsContent>

        <TabsContent value="import" className="mt-4">
          <ServiceBulkImport 
            onImportComplete={(importedCategories) => {
              setCategories(prev => [...prev, ...importedCategories]);
              toast.success(`Imported ${importedCategories.length} categories`);
            }} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ServiceHierarchyManager;
