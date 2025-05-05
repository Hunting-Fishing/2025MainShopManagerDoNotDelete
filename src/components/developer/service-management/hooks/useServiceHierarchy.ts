import { useState, useCallback } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, CategoryColorStyle } from '@/types/serviceHierarchy';
import { createEmptyCategory, createEmptySubcategory, createEmptyJob } from '@/lib/services/serviceUtils';
import { fetchServiceCategories, saveServiceCategory, saveServiceSubcategory, saveServiceJob, deleteServiceCategory, deleteServiceSubcategory, deleteServiceJob } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

// Define default color styles for categories
const DEFAULT_COLOR_STYLES: Record<string, CategoryColorStyle> = {
  default: {
    bg: 'bg-blue-100',
    text: 'text-blue-800',
    border: 'border-blue-300'
  },
  red: {
    bg: 'bg-red-100',
    text: 'text-red-800',
    border: 'border-red-300'
  },
  green: {
    bg: 'bg-green-100',
    text: 'text-green-800',
    border: 'border-green-300'
  },
  yellow: {
    bg: 'bg-yellow-100',
    text: 'text-yellow-800',
    border: 'border-yellow-300'
  },
  purple: {
    bg: 'bg-purple-100',
    text: 'text-purple-800',
    border: 'border-purple-300'
  },
  gray: {
    bg: 'bg-gray-100',
    text: 'text-gray-800',
    border: 'border-gray-300'
  }
};

export function useServiceHierarchy() {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | null>(null);

  // Load all service categories
  const loadCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // If we have categories and nothing is selected, select the first one
      if (data.length > 0 && !selectedCategory) {
        setSelectedCategory(data[0]);
        
        if (data[0].subcategories && data[0].subcategories.length > 0) {
          setSelectedSubcategory(data[0].subcategories[0]);
          
          if (data[0].subcategories[0].jobs && data[0].subcategories[0].jobs.length > 0) {
            setSelectedJob(data[0].subcategories[0].jobs[0]);
          }
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load service categories');
      toast.error('Failed to load service categories');
    } finally {
      setLoading(false);
    }
  }, [selectedCategory]);

  // Add a new category
  const addCategory = useCallback(async () => {
    try {
      const newPosition = categories.length > 0 
        ? Math.max(...categories.map(c => c.position)) + 1 
        : 0;
      
      const newCategory = createEmptyCategory(newPosition);
      const savedCategory = await saveServiceCategory(newCategory);
      
      setCategories(prev => [...prev, savedCategory]);
      setSelectedCategory(savedCategory);
      
      if (savedCategory.subcategories && savedCategory.subcategories.length > 0) {
        setSelectedSubcategory(savedCategory.subcategories[0]);
        
        if (savedCategory.subcategories[0].jobs && savedCategory.subcategories[0].jobs.length > 0) {
          setSelectedJob(savedCategory.subcategories[0].jobs[0]);
        }
      }
      
      toast.success('Category added successfully');
    } catch (err) {
      toast.error('Failed to add category');
      setError(err instanceof Error ? err.message : 'Failed to add category');
    }
  }, [categories]);

  // Update a category
  const updateCategory = useCallback(async (updatedCategory: ServiceMainCategory) => {
    try {
      const savedCategory = await saveServiceCategory(updatedCategory);
      
      setCategories(prev => 
        prev.map(cat => cat.id === savedCategory.id ? savedCategory : cat)
      );
      
      setSelectedCategory(savedCategory);
      toast.success('Category updated successfully');
    } catch (err) {
      toast.error('Failed to update category');
      setError(err instanceof Error ? err.message : 'Failed to update category');
    }
  }, []);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      
      setCategories(prev => prev.filter(cat => cat.id !== categoryId));
      
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(null);
        setSelectedSubcategory(null);
        setSelectedJob(null);
      }
      
      toast.success('Category deleted successfully');
    } catch (err) {
      toast.error('Failed to delete category');
      setError(err instanceof Error ? err.message : 'Failed to delete category');
    }
  }, [selectedCategory]);

  // Add a subcategory to a category
  const addSubcategory = useCallback(async (categoryId: string) => {
    if (!selectedCategory) return;
    
    try {
      const newSubcategory = createEmptySubcategory();
      const updatedCategory = await saveServiceSubcategory(categoryId, newSubcategory);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      // Find the newly added subcategory
      const addedSubcategory = updatedCategory.subcategories?.find(sub => sub.id === newSubcategory.id);
      if (addedSubcategory) {
        setSelectedSubcategory(addedSubcategory);
        
        if (addedSubcategory.jobs && addedSubcategory.jobs.length > 0) {
          setSelectedJob(addedSubcategory.jobs[0]);
        }
      }
      
      toast.success('Subcategory added successfully');
    } catch (err) {
      toast.error('Failed to add subcategory');
      setError(err instanceof Error ? err.message : 'Failed to add subcategory');
    }
  }, [selectedCategory]);

  // Update a subcategory
  const updateSubcategory = useCallback(async (
    categoryId: string, 
    updatedSubcategory: ServiceSubcategory
  ) => {
    try {
      const updatedCategory = await saveServiceSubcategory(categoryId, updatedSubcategory);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      // Find the updated subcategory in the response
      const savedSubcategory = updatedCategory.subcategories?.find(
        sub => sub.id === updatedSubcategory.id
      );
      
      if (savedSubcategory) {
        setSelectedSubcategory(savedSubcategory);
      }
      
      toast.success('Subcategory updated successfully');
    } catch (err) {
      toast.error('Failed to update subcategory');
      setError(err instanceof Error ? err.message : 'Failed to update subcategory');
    }
  }, []);

  // Delete a subcategory
  const removeSubcategory = useCallback(async (
    categoryId: string, 
    subcategoryId: string
  ) => {
    try {
      const updatedCategory = await deleteServiceSubcategory(categoryId, subcategoryId);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      if (selectedSubcategory?.id === subcategoryId) {
        setSelectedSubcategory(null);
        setSelectedJob(null);
      }
      
      toast.success('Subcategory deleted successfully');
    } catch (err) {
      toast.error('Failed to delete subcategory');
      setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
    }
  }, [selectedSubcategory]);

  // Add a job to a subcategory
  const addJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string
  ) => {
    try {
      const newJob = createEmptyJob();
      const updatedCategory = await saveServiceJob(categoryId, subcategoryId, newJob);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      // Find the subcategory and job in the response
      const subcategory = updatedCategory.subcategories?.find(
        sub => sub.id === subcategoryId
      );
      
      if (subcategory) {
        setSelectedSubcategory(subcategory);
        
        const addedJob = subcategory.jobs?.find(job => job.id === newJob.id);
        if (addedJob) {
          setSelectedJob(addedJob);
        }
      }
      
      toast.success('Job added successfully');
    } catch (err) {
      toast.error('Failed to add job');
      setError(err instanceof Error ? err.message : 'Failed to add job');
    }
  }, []);

  // Update a job
  const updateJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string, 
    updatedJob: ServiceJob
  ) => {
    try {
      const updatedCategory = await saveServiceJob(categoryId, subcategoryId, updatedJob);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      // Find the subcategory and job in the response
      const subcategory = updatedCategory.subcategories?.find(
        sub => sub.id === subcategoryId
      );
      
      if (subcategory) {
        setSelectedSubcategory(subcategory);
        
        const savedJob = subcategory.jobs?.find(job => job.id === updatedJob.id);
        if (savedJob) {
          setSelectedJob(savedJob);
        }
      }
      
      toast.success('Job updated successfully');
    } catch (err) {
      toast.error('Failed to update job');
      setError(err instanceof Error ? err.message : 'Failed to update job');
    }
  }, []);

  // Delete a job
  const removeJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string, 
    jobId: string
  ) => {
    try {
      const updatedCategory = await deleteServiceJob(categoryId, subcategoryId, jobId);
      
      setCategories(prev => 
        prev.map(cat => cat.id === updatedCategory.id ? updatedCategory : cat)
      );
      
      setSelectedCategory(updatedCategory);
      
      // Find the subcategory in the response
      const subcategory = updatedCategory.subcategories?.find(
        sub => sub.id === subcategoryId
      );
      
      if (subcategory) {
        setSelectedSubcategory(subcategory);
      }
      
      if (selectedJob?.id === jobId) {
        setSelectedJob(null);
      }
      
      toast.success('Job deleted successfully');
    } catch (err) {
      toast.error('Failed to delete job');
      setError(err instanceof Error ? err.message : 'Failed to delete job');
    }
  }, [selectedJob]);

  // Get color style for a category
  const getCategoryColorStyle = useCallback((categoryId: string): CategoryColorStyle => {
    // In the future, we could store color preferences in the database
    // For now, just return the default style
    return DEFAULT_COLOR_STYLES.default;
  }, []);

  return {
    categories,
    loading,
    error,
    selectedCategory,
    selectedSubcategory,
    selectedJob,
    setSelectedCategory,
    setSelectedSubcategory,
    setSelectedJob,
    loadCategories,
    addCategory,
    updateCategory,
    deleteCategory,
    addSubcategory,
    updateSubcategory,
    removeSubcategory,
    addJob,
    updateJob,
    removeJob,
    getCategoryColorStyle
  };
}
