
import { useState, useCallback, useEffect } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, CategoryColorStyle } from '@/types/serviceHierarchy';
import { fetchServiceCategories, saveServiceCategory, saveServiceSubcategory, saveServiceJob, 
         deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';

// Define the default color styles here instead of importing them
export const DEFAULT_COLOR_STYLES: Record<string, CategoryColorStyle> = {
  "engine": { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  "brake": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  "transmission": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "electrical": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  "suspension": { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  "tire": { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  "body": { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  "interior": { bg: "bg-cyan-50", text: "text-cyan-800", border: "border-cyan-200" },
  "ac": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
  "maintenance": { bg: "bg-emerald-50", text: "text-emerald-800", border: "border-emerald-200" },
  "custom": { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200" }
};

export const useServiceHierarchy = () => {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Function to load all service categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // Auto-select the first category if none is selected
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error loading categories');
      console.error('Error loading categories:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  // Load categories on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // Function to find a category by ID
  const findCategory = useCallback((id: string) => {
    return categories.find(category => category.id === id) || null;
  }, [categories]);

  // Function to find a subcategory by ID
  const findSubcategory = useCallback((categoryId: string, subcategoryId: string) => {
    const category = findCategory(categoryId);
    return category?.subcategories?.find(sub => sub.id === subcategoryId) || null;
  }, [findCategory]);

  // Function to find a job by ID
  const findJob = useCallback((categoryId: string, subcategoryId: string, jobId: string) => {
    const subcategory = findSubcategory(categoryId, subcategoryId);
    return subcategory?.jobs?.find(job => job.id === jobId) || null;
  }, [findSubcategory]);

  // Function to save a category
  const saveCategory = useCallback(async (category: ServiceMainCategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const savedCategory = await saveServiceCategory(category);
      
      // Update the categories list
      setCategories(prev => {
        const index = prev.findIndex(c => c.id === savedCategory.id);
        if (index >= 0) {
          return [...prev.slice(0, index), savedCategory, ...prev.slice(index + 1)];
        } else {
          return [...prev, savedCategory];
        }
      });
      
      // Select the newly saved category
      setSelectedCategoryId(savedCategory.id);
      return savedCategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving category');
      console.error('Error saving category:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to save a subcategory
  const saveSubcategory = useCallback(async (categoryId: string, subcategory: ServiceSubcategory) => {
    setIsLoading(true);
    setError(null);
    try {
      const savedSubcategory = await saveServiceSubcategory(categoryId, subcategory);
      
      // Update the categories list
      setCategories(prev => {
        return prev.map(category => {
          if (category.id === categoryId) {
            const subcategories = category.subcategories || [];
            const index = subcategories.findIndex(s => s.id === savedSubcategory.id);
            
            if (index >= 0) {
              return {
                ...category,
                subcategories: [
                  ...subcategories.slice(0, index),
                  savedSubcategory,
                  ...subcategories.slice(index + 1)
                ]
              };
            } else {
              return {
                ...category,
                subcategories: [...subcategories, savedSubcategory]
              };
            }
          }
          return category;
        });
      });
      
      // Select the newly saved subcategory
      setSelectedSubcategoryId(savedSubcategory.id);
      return savedSubcategory;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving subcategory');
      console.error('Error saving subcategory:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to save a job
  const saveJob = useCallback(async (categoryId: string, subcategoryId: string, job: ServiceJob) => {
    setIsLoading(true);
    setError(null);
    try {
      const savedJob = await saveServiceJob(categoryId, subcategoryId, job);
      
      // Update the categories list
      setCategories(prev => {
        return prev.map(category => {
          if (category.id === categoryId) {
            const subcategories = category.subcategories || [];
            return {
              ...category,
              subcategories: subcategories.map(sub => {
                if (sub.id === subcategoryId) {
                  const jobs = sub.jobs || [];
                  const index = jobs.findIndex(j => j.id === savedJob.id);
                  
                  if (index >= 0) {
                    return {
                      ...sub,
                      jobs: [...jobs.slice(0, index), savedJob, ...jobs.slice(index + 1)]
                    };
                  } else {
                    return {
                      ...sub,
                      jobs: [...jobs, savedJob]
                    };
                  }
                }
                return sub;
              })
            };
          }
          return category;
        });
      });
      
      // Select the newly saved job
      setSelectedJobId(savedJob.id);
      return savedJob;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error saving job');
      console.error('Error saving job:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Function to delete a category
  const removeCategory = useCallback(async (categoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteServiceCategory(categoryId);
      
      // Update the categories list
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      // Clear selection if the deleted category was selected
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting category');
      console.error('Error deleting category:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId]);

  // Function to delete a subcategory
  const removeSubcategory = useCallback(async (categoryId: string, subcategoryId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteServiceSubcategory(categoryId, subcategoryId);
      
      // Update the categories list
      setCategories(prev => {
        return prev.map(category => {
          if (category.id === categoryId) {
            return {
              ...category,
              subcategories: (category.subcategories || []).filter(s => s.id !== subcategoryId)
            };
          }
          return category;
        });
      });
      
      // Clear selection if the deleted subcategory was selected
      if (selectedSubcategoryId === subcategoryId) {
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting subcategory');
      console.error('Error deleting subcategory:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedSubcategoryId]);

  // Function to delete a job
  const removeJob = useCallback(async (categoryId: string, subcategoryId: string, jobId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      await deleteServiceJob(categoryId, subcategoryId, jobId);
      
      // Update the categories list
      setCategories(prev => {
        return prev.map(category => {
          if (category.id === categoryId) {
            const subcategories = category.subcategories || [];
            return {
              ...category,
              subcategories: subcategories.map(sub => {
                if (sub.id === subcategoryId) {
                  return {
                    ...sub,
                    jobs: (sub.jobs || []).filter(j => j.id !== jobId)
                  };
                }
                return sub;
              })
            };
          }
          return category;
        });
      });
      
      // Clear selection if the deleted job was selected
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }
      
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error deleting job');
      console.error('Error deleting job:', err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [selectedJobId]);

  // Function to filter categories based on search query
  const getFilteredCategories = useCallback(() => {
    if (!searchQuery) return categories;
    
    const lowerQuery = searchQuery.toLowerCase();
    
    return categories.filter(category => {
      // Check if category name matches
      if (category.name.toLowerCase().includes(lowerQuery)) return true;
      
      // Check if any subcategory name matches
      if (category.subcategories?.some(sub => sub.name.toLowerCase().includes(lowerQuery))) return true;
      
      // Check if any job name matches
      if (category.subcategories?.some(sub => 
        sub.jobs?.some(job => job.name.toLowerCase().includes(lowerQuery))
      )) return true;
      
      return false;
    });
  }, [categories, searchQuery]);

  // Get the selected items
  const selectedCategory = selectedCategoryId ? findCategory(selectedCategoryId) : null;
  const selectedSubcategory = selectedCategoryId && selectedSubcategoryId ? 
    findSubcategory(selectedCategoryId, selectedSubcategoryId) : null;
  const selectedJob = selectedCategoryId && selectedSubcategoryId && selectedJobId ? 
    findJob(selectedCategoryId, selectedSubcategoryId, selectedJobId) : null;

  return {
    // Data
    categories,
    filteredCategories: getFilteredCategories(),
    selectedCategory,
    selectedSubcategory,
    selectedJob,
    
    // Selection IDs
    selectedCategoryId,
    selectedSubcategoryId,
    selectedJobId,
    
    // Selection actions
    setSelectedCategoryId,
    setSelectedSubcategoryId,
    setSelectedJobId,
    
    // CRUD operations
    saveCategory,
    saveSubcategory,
    saveJob,
    removeCategory,
    removeSubcategory,
    removeJob,
    
    // Refresh function
    loadCategories,
    
    // Search functionality
    searchQuery,
    setSearchQuery,
    
    // Status
    isLoading,
    error,
    
    // Color styles
    colorStyles: DEFAULT_COLOR_STYLES
  };
};
