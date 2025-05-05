import React, { useState, useEffect } from 'react';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { fetchServiceCategories, saveServiceCategory } from '@/lib/services/serviceApi';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SearchAndFilterBar } from './SearchAndFilterBar';
import { categoryColors, assignCategoryColors } from './CategoryColorConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';
import { DuplicateSearchButton } from './DuplicateSearchButton';

export const ServiceHierarchyManager: React.FC = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [filteredCategories, setFilteredCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  const [categoryColorMap, setCategoryColorMap] = useState<Record<string, string>>({});
  
  // Load service categories
  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      setFilteredCategories(data);
      
      // Create color map for categories
      const categoryIds = data.map(cat => cat.id);
      setCategoryColorMap(assignCategoryColors(categoryIds));
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service categories');
      toast.error('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  };
  
  // Initial load
  useEffect(() => {
    loadCategories();
  }, []);
  
  // Handle search functionality
  const handleSearch = (query: string) => {
    setSearchQuery(query);
    applyFiltersAndSearch(query, activeFilters);
  };
  
  // Handle filter changes
  const handleFilterChange = (filters: string[]) => {
    setActiveFilters(filters);
    applyFiltersAndSearch(searchQuery, filters);
  };
  
  // Apply both search and filters
  const applyFiltersAndSearch = (query: string, filters: string[]) => {
    let filtered = [...categories];
    
    // Apply search if there is a query
    if (query) {
      const lowercaseQuery = query.toLowerCase();
      filtered = filtered.filter(category => {
        // Search in category name or description
        if (
          category.name.toLowerCase().includes(lowercaseQuery) ||
          (category.description && category.description.toLowerCase().includes(lowercaseQuery))
        ) {
          return true;
        }
        
        // Search in subcategories
        const hasMatchingSubcategory = category.subcategories.some(subcategory => {
          if (
            subcategory.name.toLowerCase().includes(lowercaseQuery) ||
            (subcategory.description && subcategory.description.toLowerCase().includes(lowercaseQuery))
          ) {
            return true;
          }
          
          // Search in jobs
          return subcategory.jobs.some(job => 
            job.name.toLowerCase().includes(lowercaseQuery) ||
            (job.description && job.description.toLowerCase().includes(lowercaseQuery))
          );
        });
        
        return hasMatchingSubcategory;
      });
    }
    
    // Apply category filters if there are any
    if (filters.length > 0) {
      filtered = filtered.filter(category => filters.includes(category.name));
    }
    
    setFilteredCategories(filtered);
  };
  
  // Handle selection of items in the browser
  const handleSelectItem = (type: 'category' | 'subcategory' | 'job', id: string | null) => {
    if (type === 'category') {
      setSelectedCategoryId(id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
    } else if (type === 'subcategory') {
      setSelectedSubcategoryId(id);
      setSelectedJobId(null);
    } else if (type === 'job') {
      setSelectedJobId(id);
    }
  };

  // Handle inline updates from double-click editing
  const handleUpdateItem = async (type: 'category' | 'subcategory' | 'job', id: string, newName: string) => {
    try {
      // Create a deep copy of the categories for updating
      const updatedCategories = JSON.parse(JSON.stringify(categories)) as ServiceMainCategory[];
      
      if (type === 'category') {
        const categoryIndex = updatedCategories.findIndex(cat => cat.id === id);
        if (categoryIndex !== -1) {
          updatedCategories[categoryIndex].name = newName;
          
          // Save to database
          await saveServiceCategory(updatedCategories[categoryIndex]);
          toast.success(`Category "${newName}" updated successfully`);
        }
      } else if (type === 'subcategory') {
        const categoryIndex = updatedCategories.findIndex(cat => 
          cat.subcategories.some(sub => sub.id === id)
        );
        
        if (categoryIndex !== -1) {
          const subcategoryIndex = updatedCategories[categoryIndex].subcategories.findIndex(
            sub => sub.id === id
          );
          
          if (subcategoryIndex !== -1) {
            updatedCategories[categoryIndex].subcategories[subcategoryIndex].name = newName;
            
            // Save to database
            await saveServiceCategory(updatedCategories[categoryIndex]);
            toast.success(`Subcategory "${newName}" updated successfully`);
          }
        }
      } else if (type === 'job') {
        for (const category of updatedCategories) {
          for (const subcategory of category.subcategories) {
            const jobIndex = subcategory.jobs.findIndex(job => job.id === id);
            if (jobIndex !== -1) {
              subcategory.jobs[jobIndex].name = newName;
              
              // Save parent category to database
              await saveServiceCategory(category);
              toast.success(`Service "${newName}" updated successfully`);
              break;
            }
          }
        }
      }
      
      // Update local state
      setCategories(updatedCategories);
      
      // Update filtered categories while preserving filters
      if (searchQuery || activeFilters.length > 0) {
        applyFiltersAndSearch(searchQuery, activeFilters);
      } else {
        setFilteredCategories(updatedCategories);
      }
      
    } catch (error) {
      console.error('Error updating item:', error);
      toast.error(`Failed to update item: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };
  
  // Get category names for filtering
  const categoryNames = categories.map(cat => cat.name);
  
  // Count total services
  const totalServices = categories.reduce((total, category) => {
    return total + category.subcategories.reduce((subTotal, subcategory) => {
      return subTotal + subcategory.jobs.length;
    }, 0);
  }, 0);
  
  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-semibold mb-1">Service Hierarchy</h2>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="bg-gray-100">
              {categories.length} Categories
            </Badge>
            <Badge variant="secondary" className="bg-gray-100">
              {totalServices} Services
            </Badge>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-1" /> Add Category
          </Button>
          <Button size="sm" variant="outline">
            <Upload className="h-4 w-4 mr-1" /> Import
          </Button>
          <Button size="sm" variant="outline">
            <Download className="h-4 w-4 mr-1" /> Export
          </Button>
          <DuplicateSearchButton 
            categories={categories} 
            loading={loading} 
            onCategoriesUpdated={loadCategories}
          />
          <Button size="sm" variant="ghost" onClick={() => {
            setLoading(true);
            fetchServiceCategories()
              .then(data => {
                setCategories(data);
                setFilteredCategories(data);
                toast.success('Service categories refreshed');
              })
              .catch(err => {
                setError(err instanceof Error ? err.message : 'Failed to refresh categories');
                toast.error('Failed to refresh categories');
              })
              .finally(() => setLoading(false));
          }}>
            <RefreshCcw className="h-4 w-4 mr-1" /> Refresh
          </Button>
        </div>
      </div>
      
      <SearchAndFilterBar
        onSearch={handleSearch}
        onFilterChange={handleFilterChange}
        categories={categoryNames}
      />
      
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
        onUpdateItem={handleUpdateItem}
      />
      
      {filteredCategories.length === 0 && !loading && (
        <div className="mt-8 p-8 text-center bg-gray-50 border border-gray-200 rounded-lg">
          <h3 className="text-lg font-medium text-gray-700">No services found</h3>
          <p className="mt-2 text-gray-500">
            {searchQuery || activeFilters.length > 0
              ? 'Try adjusting your search or filters to find what you\'re looking for.'
              : 'No services have been configured yet. Use the "Add Category" button to create your first service category.'}
          </p>
          {(searchQuery || activeFilters.length > 0) && (
            <Button 
              className="mt-4" 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setActiveFilters([]);
                setFilteredCategories(categories);
              }}
            >
              Clear all filters
            </Button>
          )}
        </div>
      )}
    </div>
  );
};
