
import { useState, useEffect, useCallback } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { fetchServiceCategories, saveServiceCategory, deleteServiceCategory } from '@/lib/services/serviceApi';
import { createEmptyCategory, deepClone } from '@/lib/services/serviceUtils';
import { CategoryColorStyle, DEFAULT_COLOR_STYLES } from '../ServiceEditor';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

export function useServiceHierarchy() {
  const [categories, setCategories] = useState<ServiceMainCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  const [selectedColorIndex, setSelectedColorIndex] = useState(0);
  const [categoryColors, setCategoryColors] = useState<Record<string, number>>({});

  // Fetch categories on mount
  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await fetchServiceCategories();
      setCategories(data);

      // Initialize color mapping for categories
      const colorMap: Record<string, number> = {};
      data.forEach((category, index) => {
        colorMap[category.id] = index % DEFAULT_COLOR_STYLES.length;
      });
      setCategoryColors(colorMap);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      toast.error('Failed to load service categories');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Selection handlers
  const handleSelectCategory = useCallback((category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    setSelectedColorIndex(categoryColors[category.id] || 0);
  }, [categoryColors]);

  const handleSelectSubcategory = useCallback((subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(undefined);
  }, []);

  const handleSelectJob = useCallback((job: ServiceJob) => {
    setSelectedJob(job);
  }, []);

  // Save operations
  const handleSaveCategory = useCallback(async (updatedCategory: ServiceMainCategory) => {
    try {
      const updatedCategories = categories.map(cat => 
        cat.id === updatedCategory.id ? updatedCategory : cat
      );
      
      setCategories(updatedCategories);
      setSelectedCategory(updatedCategory);
      
      // Update in database
      await saveServiceCategory(updatedCategory);
      toast.success(`Category "${updatedCategory.name}" saved successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save category');
      toast.error(`Failed to save category: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload categories to restore state
      loadCategories();
    }
  }, [categories, loadCategories]);

  const handleSaveSubcategory = useCallback(async (updatedSubcategory: ServiceSubcategory) => {
    try {
      if (!selectedCategory) return;
      
      const updatedCategory = deepClone(selectedCategory);
      const subcategoryIndex = updatedCategory.subcategories.findIndex(
        sub => sub.id === updatedSubcategory.id
      );
      
      if (subcategoryIndex >= 0) {
        updatedCategory.subcategories[subcategoryIndex] = updatedSubcategory;
        
        // Update local state
        setSelectedCategory(updatedCategory);
        setSelectedSubcategory(updatedSubcategory);
        
        // Update categories list
        const updatedCategories = categories.map(cat => 
          cat.id === updatedCategory.id ? updatedCategory : cat
        );
        setCategories(updatedCategories);
        
        // Save to database
        await saveServiceCategory(updatedCategory);
        toast.success(`Subcategory "${updatedSubcategory.name}" saved successfully`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save subcategory');
      toast.error(`Failed to save subcategory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, selectedCategory, loadCategories]);

  const handleSaveJob = useCallback(async (updatedJob: ServiceJob) => {
    try {
      if (!selectedCategory || !selectedSubcategory) return;
      
      const updatedCategory = deepClone(selectedCategory);
      const subcategoryIndex = updatedCategory.subcategories.findIndex(
        sub => sub.id === selectedSubcategory.id
      );
      
      if (subcategoryIndex >= 0) {
        const updatedSubcategory = updatedCategory.subcategories[subcategoryIndex];
        const jobIndex = updatedSubcategory.jobs.findIndex(job => job.id === updatedJob.id);
        
        if (jobIndex >= 0) {
          updatedSubcategory.jobs[jobIndex] = updatedJob;
          
          // Update local state
          setSelectedCategory(updatedCategory);
          setSelectedSubcategory(updatedSubcategory);
          setSelectedJob(updatedJob);
          
          // Update categories list
          const updatedCategories = categories.map(cat => 
            cat.id === updatedCategory.id ? updatedCategory : cat
          );
          setCategories(updatedCategories);
          
          // Save to database
          await saveServiceCategory(updatedCategory);
          toast.success(`Job "${updatedJob.name}" saved successfully`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save job');
      toast.error(`Failed to save job: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, selectedCategory, selectedSubcategory, loadCategories]);

  // Add operations
  const handleAddCategory = useCallback(async () => {
    try {
      const position = categories.length > 0 
        ? Math.max(...categories.map(c => c.position || 0)) + 1 
        : 0;
      
      const newCategory = createEmptyCategory(position);
      
      // Create color mapping
      const colorIndex = Object.keys(categoryColors).length % DEFAULT_COLOR_STYLES.length;
      setCategoryColors(prev => ({ ...prev, [newCategory.id]: colorIndex }));
      
      // Update state
      const updatedCategories = [...categories, newCategory];
      setCategories(updatedCategories);
      setSelectedCategory(newCategory);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
      setSelectedColorIndex(colorIndex);
      
      // Save to database
      await saveServiceCategory(newCategory);
      toast.success(`New category created`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add category');
      toast.error(`Failed to add category: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, categoryColors, loadCategories]);

  const handleAddSubcategory = useCallback(async (categoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const updatedCategory = deepClone(category);
      const newSubcategory = {
        id: uuidv4(),
        name: 'New Subcategory',
        description: '',
        jobs: []
      };
      
      updatedCategory.subcategories.push(newSubcategory);
      
      // Update state
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(newSubcategory);
      setSelectedJob(undefined);
      
      // Update categories list
      const updatedCategories = categories.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      );
      setCategories(updatedCategories);
      
      // Save to database
      await saveServiceCategory(updatedCategory);
      toast.success(`New subcategory added to ${category.name}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add subcategory');
      toast.error(`Failed to add subcategory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, loadCategories]);

  const handleAddJob = useCallback(async (categoryId: string, subcategoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const updatedCategory = deepClone(category);
      const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === subcategoryId);
      
      if (subcategoryIndex >= 0) {
        const newJob = {
          id: uuidv4(),
          name: 'New Service',
          description: '',
          price: 0,
          estimatedTime: 30
        };
        
        updatedCategory.subcategories[subcategoryIndex].jobs.push(newJob);
        
        // Update state
        setSelectedCategory(updatedCategory);
        setSelectedSubcategory(updatedCategory.subcategories[subcategoryIndex]);
        setSelectedJob(newJob);
        
        // Update categories list
        const updatedCategories = categories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        );
        setCategories(updatedCategories);
        
        // Save to database
        await saveServiceCategory(updatedCategory);
        toast.success(`New job added`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add job');
      toast.error(`Failed to add job: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, loadCategories]);

  // Delete operations
  const handleDeleteCategory = useCallback(async (categoryId: string) => {
    try {
      // Update local state
      const updatedCategories = categories.filter(c => c.id !== categoryId);
      setCategories(updatedCategories);
      
      if (selectedCategory?.id === categoryId) {
        setSelectedCategory(undefined);
        setSelectedSubcategory(undefined);
        setSelectedJob(undefined);
      }
      
      // Delete from database
      await deleteServiceCategory(categoryId);
      toast.success(`Category deleted successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete category');
      toast.error(`Failed to delete category: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, selectedCategory, loadCategories]);

  const handleDeleteSubcategory = useCallback(async (categoryId: string, subcategoryId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const updatedCategory = deepClone(category);
      updatedCategory.subcategories = updatedCategory.subcategories.filter(s => s.id !== subcategoryId);
      
      // Update state
      setSelectedCategory(updatedCategory);
      
      if (selectedSubcategory?.id === subcategoryId) {
        setSelectedSubcategory(undefined);
        setSelectedJob(undefined);
      }
      
      // Update categories list
      const updatedCategories = categories.map(cat => 
        cat.id === categoryId ? updatedCategory : cat
      );
      setCategories(updatedCategories);
      
      // Save to database
      await saveServiceCategory(updatedCategory);
      toast.success(`Subcategory deleted successfully`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete subcategory');
      toast.error(`Failed to delete subcategory: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, selectedSubcategory, loadCategories]);

  const handleDeleteJob = useCallback(async (categoryId: string, subcategoryId: string, jobId: string) => {
    try {
      const category = categories.find(c => c.id === categoryId);
      if (!category) return;
      
      const updatedCategory = deepClone(category);
      const subcategoryIndex = updatedCategory.subcategories.findIndex(s => s.id === subcategoryId);
      
      if (subcategoryIndex >= 0) {
        updatedCategory.subcategories[subcategoryIndex].jobs = 
          updatedCategory.subcategories[subcategoryIndex].jobs.filter(j => j.id !== jobId);
        
        // Update state
        setSelectedCategory(updatedCategory);
        setSelectedSubcategory(updatedCategory.subcategories[subcategoryIndex]);
        
        if (selectedJob?.id === jobId) {
          setSelectedJob(undefined);
        }
        
        // Update categories list
        const updatedCategories = categories.map(cat => 
          cat.id === categoryId ? updatedCategory : cat
        );
        setCategories(updatedCategories);
        
        // Save to database
        await saveServiceCategory(updatedCategory);
        toast.success(`Job deleted successfully`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete job');
      toast.error(`Failed to delete job: ${err instanceof Error ? err.message : 'Unknown error'}`);
      
      // Reload to restore state
      loadCategories();
    }
  }, [categories, selectedJob, loadCategories]);

  // Color management
  const handleColorChange = useCallback((colorIndex: number) => {
    if (!selectedCategory) return;
    
    setSelectedColorIndex(colorIndex);
    setCategoryColors(prev => ({
      ...prev,
      [selectedCategory.id]: colorIndex
    }));
  }, [selectedCategory]);

  return {
    categories,
    isLoading,
    error,
    selectedCategory,
    selectedSubcategory,
    selectedJob,
    handleSelectCategory,
    handleSelectSubcategory,
    handleSelectJob,
    handleSaveCategory,
    handleSaveSubcategory,
    handleSaveJob,
    handleDeleteCategory,
    handleDeleteSubcategory,
    handleDeleteJob,
    handleAddCategory,
    handleAddSubcategory,
    handleAddJob,
    categoryColors,
    selectedColorIndex,
    handleColorChange
  };
}
