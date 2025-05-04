
import { useState, useCallback } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob, CategoryColorStyle } from '@/types/serviceHierarchy';
import { 
  fetchServiceCategories, 
  saveServiceCategory, 
  saveServiceSubcategory, 
  saveServiceJob, 
  deleteServiceCategory,
  deleteServiceSubcategory,
  deleteServiceJob 
} from '@/lib/services/serviceApi';
import { useToast } from '@/hooks/use-toast';
import { v4 as uuidv4 } from 'uuid';

// Default color styles for categories
export const DEFAULT_COLOR_STYLES: Record<string, CategoryColorStyle> = {
  "default": { bg: "bg-slate-50", text: "text-slate-800", border: "border-slate-200" },
  "engine": { bg: "bg-red-50", text: "text-red-800", border: "border-red-200" },
  "brake": { bg: "bg-blue-50", text: "text-blue-800", border: "border-blue-200" },
  "transmission": { bg: "bg-amber-50", text: "text-amber-800", border: "border-amber-200" },
  "electrical": { bg: "bg-purple-50", text: "text-purple-800", border: "border-purple-200" },
  "suspension": { bg: "bg-green-50", text: "text-green-800", border: "border-green-200" },
  "tire": { bg: "bg-teal-50", text: "text-teal-800", border: "border-teal-200" },
  "body": { bg: "bg-orange-50", text: "text-orange-800", border: "border-orange-200" },
  "custom": { bg: "bg-indigo-50", text: "text-indigo-800", border: "border-indigo-200" },
};

export const useServiceHierarchy = () => {
  const { toast } = useToast();
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  // Fetch all service categories
  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const data = await fetchServiceCategories();
      setCategories(data);
      
      // If we have categories but no selection, select the first one
      if (data.length > 0 && !selectedCategoryId) {
        setSelectedCategoryId(data[0].id);
      }
    } catch (err) {
      console.error('Error loading service categories:', err);
      setError(err instanceof Error ? err.message : 'Failed to load service categories');
      toast({
        title: "Error",
        description: "Failed to load service categories",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  }, [selectedCategoryId, toast]);

  // Get the selected category
  const selectedCategory = selectedCategoryId 
    ? categories.find(c => c.id === selectedCategoryId)
    : null;

  // Get the selected subcategory
  const selectedSubcategory = selectedCategory?.subcategories?.find(
    s => s.id === selectedSubcategoryId
  ) || null;

  // Get the selected job
  const selectedJob = selectedSubcategory?.jobs?.find(
    j => j.id === selectedJobId
  ) || null;

  // Create a new category
  const createCategory = useCallback(async (name: string, description?: string) => {
    const newCategory: ServiceMainCategory = {
      id: uuidv4(),
      name: name,
      description: description || '',
      position: categories.length + 1,
      subcategories: []
    };
    
    try {
      const savedCategory = await saveServiceCategory(newCategory);
      setCategories(prev => [...prev, savedCategory]);
      setSelectedCategoryId(savedCategory.id);
      setSelectedSubcategoryId(null);
      setSelectedJobId(null);
      
      toast({
        title: "Success",
        description: "Category created successfully",
      });
      
      return savedCategory;
    } catch (err) {
      console.error('Error creating category:', err);
      toast({
        title: "Error",
        description: "Failed to create category",
        variant: "destructive"
      });
      throw err;
    }
  }, [categories, toast]);

  // Update a category
  const updateCategory = useCallback(async (category: ServiceMainCategory) => {
    try {
      const updatedCategory = await saveServiceCategory(category);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      toast({
        title: "Success",
        description: "Category updated successfully",
      });
      
      return updatedCategory;
    } catch (err) {
      console.error('Error updating category:', err);
      toast({
        title: "Error",
        description: "Failed to update category",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Delete a category
  const deleteCategory = useCallback(async (categoryId: string) => {
    try {
      await deleteServiceCategory(categoryId);
      
      setCategories(prev => prev.filter(c => c.id !== categoryId));
      
      if (selectedCategoryId === categoryId) {
        setSelectedCategoryId(categories.length > 1 ? categories[0].id : null);
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
      }
      
      toast({
        title: "Success",
        description: "Category deleted successfully",
      });
      
      return categoryId;
    } catch (err) {
      console.error('Error deleting category:', err);
      toast({
        title: "Error",
        description: "Failed to delete category",
        variant: "destructive"
      });
      throw err;
    }
  }, [categories, selectedCategoryId, toast]);

  // Create a new subcategory
  const createSubcategory = useCallback(async (categoryId: string, name: string, description?: string) => {
    if (!categoryId) {
      toast({
        title: "Error",
        description: "No category selected",
        variant: "destructive"
      });
      throw new Error("No category selected");
    }
    
    const newSubcategory: ServiceSubcategory = {
      id: uuidv4(),
      name: name,
      description: description || '',
      jobs: []
    };
    
    try {
      const updatedCategory = await saveServiceSubcategory(categoryId, newSubcategory);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      setSelectedSubcategoryId(newSubcategory.id);
      setSelectedJobId(null);
      
      toast({
        title: "Success",
        description: "Subcategory created successfully",
      });
      
      return newSubcategory;
    } catch (err) {
      console.error('Error creating subcategory:', err);
      toast({
        title: "Error",
        description: "Failed to create subcategory",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Update a subcategory
  const updateSubcategory = useCallback(async (
    categoryId: string, 
    subcategory: ServiceSubcategory
  ) => {
    try {
      const updatedCategory = await saveServiceSubcategory(categoryId, subcategory);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      toast({
        title: "Success",
        description: "Subcategory updated successfully",
      });
      
      return subcategory;
    } catch (err) {
      console.error('Error updating subcategory:', err);
      toast({
        title: "Error",
        description: "Failed to update subcategory",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Delete a subcategory
  const deleteSubcategory = useCallback(async (categoryId: string, subcategoryId: string) => {
    try {
      const updatedCategory = await deleteServiceSubcategory(categoryId, subcategoryId);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      if (selectedSubcategoryId === subcategoryId) {
        setSelectedSubcategoryId(null);
        setSelectedJobId(null);
      }
      
      toast({
        title: "Success",
        description: "Subcategory deleted successfully",
      });
      
      return subcategoryId;
    } catch (err) {
      console.error('Error deleting subcategory:', err);
      toast({
        title: "Error",
        description: "Failed to delete subcategory",
        variant: "destructive"
      });
      throw err;
    }
  }, [selectedSubcategoryId, toast]);

  // Create a new job
  const createJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string, 
    name: string, 
    description?: string,
    price?: number,
    estimatedTime?: number
  ) => {
    if (!categoryId || !subcategoryId) {
      toast({
        title: "Error",
        description: "No category or subcategory selected",
        variant: "destructive"
      });
      throw new Error("No category or subcategory selected");
    }
    
    const newJob: ServiceJob = {
      id: uuidv4(),
      name: name,
      description: description || '',
      price: price,
      estimatedTime: estimatedTime
    };
    
    try {
      const updatedCategory = await saveServiceJob(categoryId, subcategoryId, newJob);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      setSelectedJobId(newJob.id);
      
      toast({
        title: "Success",
        description: "Job created successfully",
      });
      
      return newJob;
    } catch (err) {
      console.error('Error creating job:', err);
      toast({
        title: "Error",
        description: "Failed to create job",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Update a job
  const updateJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string, 
    job: ServiceJob
  ) => {
    try {
      const updatedCategory = await saveServiceJob(categoryId, subcategoryId, job);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      toast({
        title: "Success",
        description: "Job updated successfully",
      });
      
      return job;
    } catch (err) {
      console.error('Error updating job:', err);
      toast({
        title: "Error",
        description: "Failed to update job",
        variant: "destructive"
      });
      throw err;
    }
  }, [toast]);

  // Delete a job
  const deleteJob = useCallback(async (
    categoryId: string, 
    subcategoryId: string, 
    jobId: string
  ) => {
    try {
      const updatedCategory = await deleteServiceJob(categoryId, subcategoryId, jobId);
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      if (selectedJobId === jobId) {
        setSelectedJobId(null);
      }
      
      toast({
        title: "Success",
        description: "Job deleted successfully",
      });
      
      return jobId;
    } catch (err) {
      console.error('Error deleting job:', err);
      toast({
        title: "Error",
        description: "Failed to delete job",
        variant: "destructive"
      });
      throw err;
    }
  }, [selectedJobId, toast]);

  return {
    categories,
    isLoading,
    error,
    selectedCategoryId,
    setSelectedCategoryId,
    selectedSubcategoryId,
    setSelectedSubcategoryId,
    selectedJobId,
    setSelectedJobId,
    selectedCategory,
    selectedSubcategory,
    selectedJob,
    loadCategories,
    createCategory,
    updateCategory,
    deleteCategory,
    createSubcategory,
    updateSubcategory,
    deleteSubcategory,
    createJob,
    updateJob,
    deleteJob,
  };
};

export default useServiceHierarchy;
