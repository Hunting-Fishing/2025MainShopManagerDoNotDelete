
import React, { useState, useEffect } from 'react';
import { ServiceHierarchyBrowser } from './ServiceHierarchyBrowser';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { SearchAndFilterBar } from './SearchAndFilterBar';
import { categoryColors, assignCategoryColors } from './CategoryColorConfig';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Download, Upload, RefreshCcw } from 'lucide-react';
import { toast } from 'sonner';

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
  useEffect(() => {
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
