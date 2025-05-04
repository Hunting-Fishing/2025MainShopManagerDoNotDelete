
import { useState, useEffect, useCallback } from 'react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { v4 as uuidv4 } from 'uuid';
import { createEmptyCategory, createEmptySubcategory, createEmptyJob } from '@/lib/services/serviceUtils';
import { DEFAULT_COLOR_STYLES } from '../ServiceEditor';

// Mock data for initial categories
const initialCategories: ServiceMainCategory[] = [
  {
    id: '1',
    name: 'Oil Change Services',
    description: 'Standard and premium oil change services',
    position: 1,
    subcategories: [
      {
        id: '1-1',
        name: 'Regular Oil Change',
        description: 'Standard oil change services using conventional oil',
        jobs: [
          {
            id: '1-1-1',
            name: 'Basic Oil Change',
            description: 'Conventional oil change up to 5 quarts',
            price: 39.99,
            estimatedTime: 30
          },
          {
            id: '1-1-2',
            name: 'Oil Change with Filter',
            description: 'Conventional oil change with premium filter',
            price: 49.99,
            estimatedTime: 45
          }
        ]
      },
      {
        id: '1-2',
        name: 'Synthetic Oil Change',
        description: 'Premium oil change services using synthetic oil',
        jobs: [
          {
            id: '1-2-1',
            name: 'Full Synthetic Oil Change',
            description: 'Full synthetic oil change up to 5 quarts',
            price: 69.99,
            estimatedTime: 30
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Brake Services',
    description: 'Complete brake inspection and repair services',
    position: 2,
    subcategories: [
      {
        id: '2-1',
        name: 'Brake Inspection',
        description: 'Comprehensive brake system inspection',
        jobs: [
          {
            id: '2-1-1',
            name: 'Brake Inspection',
            description: 'Complete brake system visual inspection',
            price: 29.99,
            estimatedTime: 30
          }
        ]
      }
    ]
  }
];

export function useServiceHierarchy() {
  // State for categories
  const [categories, setCategories] = useState<ServiceMainCategory[]>(initialCategories);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Selection state
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | undefined>(undefined);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | undefined>(undefined);
  const [selectedJob, setSelectedJob] = useState<ServiceJob | undefined>(undefined);
  
  // Color state
  const [categoryColors, setCategoryColors] = useState<Record<string, number>>({
    '1': 0,  // Oil Change - blue
    '2': 6,  // Brake Services - red
  });
  const [selectedColorIndex, setSelectedColorIndex] = useState<number>(0);
  
  // Simulate initial data loading
  useEffect(() => {
    setIsLoading(true);
    // Simulate API call delay
    const timer = setTimeout(() => {
      setCategories(initialCategories);
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Selection handlers
  const handleSelectCategory = useCallback((category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(undefined);
    setSelectedJob(undefined);
    
    // Update selected color index
    const colorIndex = categoryColors[category.id] || 0;
    setSelectedColorIndex(colorIndex);
  }, [categoryColors]);
  
  const handleSelectSubcategory = useCallback((subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
    setSelectedJob(undefined);
  }, []);
  
  const handleSelectJob = useCallback((job: ServiceJob) => {
    setSelectedJob(job);
  }, []);
  
  // Color change handler
  const handleColorChange = useCallback((index: number) => {
    if (selectedCategory) {
      setCategoryColors(prev => ({
        ...prev,
        [selectedCategory.id]: index
      }));
      setSelectedColorIndex(index);
    }
  }, [selectedCategory]);
  
  // CRUD operations
  const handleSaveCategory = useCallback((category: ServiceMainCategory) => {
    setCategories(prev => 
      prev.map(c => c.id === category.id ? category : c)
    );
    setSelectedCategory(category);
  }, []);
  
  const handleSaveSubcategory = useCallback((subcategory: ServiceSubcategory) => {
    if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(s => 
          s.id === subcategory.id ? subcategory : s
        )
      };
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(subcategory);
    }
  }, [selectedCategory]);
  
  const handleSaveJob = useCallback((job: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs.map(j => 
          j.id === job.id ? job : j
        )
      };
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(s => 
          s.id === updatedSubcategory.id ? updatedSubcategory : s
        )
      };
      
      setCategories(prev => 
        prev.map(c => c.id === updatedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(updatedSubcategory);
      setSelectedJob(job);
    }
  }, [selectedCategory, selectedSubcategory]);
  
  // Add operations
  const handleAddCategory = useCallback(() => {
    const newCategory = createEmptyCategory(categories.length + 1);
    setCategories(prev => [...prev, newCategory]);
    setSelectedCategory(newCategory);
    setSelectedSubcategory(newCategory.subcategories[0]);
    setSelectedJob(undefined);
    
    // Set default color
    setCategoryColors(prev => ({
      ...prev,
      [newCategory.id]: 0
    }));
    setSelectedColorIndex(0);
  }, [categories]);
  
  const handleAddSubcategory = useCallback(() => {
    if (selectedCategory) {
      const newSubcategory = createEmptySubcategory();
      const updatedCategory = {
        ...selectedCategory,
        subcategories: [...selectedCategory.subcategories, newSubcategory]
      };
      
      setCategories(prev => 
        prev.map(c => c.id === selectedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(newSubcategory);
      setSelectedJob(undefined);
    }
  }, [selectedCategory]);
  
  const handleAddJob = useCallback(() => {
    if (selectedCategory && selectedSubcategory) {
      const newJob = createEmptyJob();
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: [...selectedSubcategory.jobs, newJob]
      };
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(s => 
          s.id === selectedSubcategory.id ? updatedSubcategory : s
        )
      };
      
      setCategories(prev => 
        prev.map(c => c.id === selectedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(updatedSubcategory);
      setSelectedJob(newJob);
    }
  }, [selectedCategory, selectedSubcategory]);
  
  // Delete operations
  const handleDeleteCategory = useCallback((categoryId: string) => {
    setCategories(prev => prev.filter(c => c.id !== categoryId));
    
    if (selectedCategory && selectedCategory.id === categoryId) {
      setSelectedCategory(undefined);
      setSelectedSubcategory(undefined);
      setSelectedJob(undefined);
    }
  }, [selectedCategory]);
  
  const handleDeleteSubcategory = useCallback((subcategoryId: string) => {
    if (selectedCategory) {
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.filter(s => s.id !== subcategoryId)
      };
      
      setCategories(prev => 
        prev.map(c => c.id === selectedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      
      if (selectedSubcategory && selectedSubcategory.id === subcategoryId) {
        setSelectedSubcategory(undefined);
        setSelectedJob(undefined);
      }
    }
  }, [selectedCategory, selectedSubcategory]);
  
  const handleDeleteJob = useCallback((jobId: string) => {
    if (selectedCategory && selectedSubcategory) {
      const updatedSubcategory = {
        ...selectedSubcategory,
        jobs: selectedSubcategory.jobs.filter(j => j.id !== jobId)
      };
      
      const updatedCategory = {
        ...selectedCategory,
        subcategories: selectedCategory.subcategories.map(s => 
          s.id === selectedSubcategory.id ? updatedSubcategory : s
        )
      };
      
      setCategories(prev => 
        prev.map(c => c.id === selectedCategory.id ? updatedCategory : c)
      );
      
      setSelectedCategory(updatedCategory);
      setSelectedSubcategory(updatedSubcategory);
      
      if (selectedJob && selectedJob.id === jobId) {
        setSelectedJob(undefined);
      }
    }
  }, [selectedCategory, selectedSubcategory, selectedJob]);
  
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
