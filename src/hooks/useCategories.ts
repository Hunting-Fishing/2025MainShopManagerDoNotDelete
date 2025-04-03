
import { useState, useEffect, useMemo, useCallback } from 'react';
import { ProductCategory } from '@/types/shopping';
import { getCategories, getCategoryBySlug } from '@/services/shopping/categoryService';
import { toast } from '@/hooks/use-toast';

/**
 * Custom hook for managing product categories with improved error handling and performance
 */
export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Fetch categories on mount
  useEffect(() => {
    fetchCategories();
  }, []);

  // Function to fetch categories from the API
  const fetchCategories = async () => {
    try {
      setIsLoading(true);
      console.log("useCategories: Fetching categories");
      const data = await getCategories();
      console.log("useCategories: Got categories:", data);
      setCategories(data);
    } catch (err) {
      console.error("useCategories: Error fetching categories:", err);
      setError(err instanceof Error ? err : new Error('Unknown error'));
      toast({
        title: "Error loading categories",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Utility function to traverse a category tree
  const traverseCategories = useCallback((
    categoryList: ProductCategory[], 
    callback: (category: ProductCategory) => boolean | void
  ) => {
    for (const category of categoryList) {
      // If callback returns true, stop traversal
      if (callback(category) === true) return true;
      
      // If category has subcategories, traverse them
      if (category.subcategories && category.subcategories.length > 0) {
        if (traverseCategories(category.subcategories, callback) === true) {
          return true;
        }
      }
    }
    return false;
  }, []);

  // Find a category by ID (memoized)
  const getCategoryById = useCallback((id: string): ProductCategory | undefined => {
    let result: ProductCategory | undefined;
    
    traverseCategories(categories, (category) => {
      if (category.id === id) {
        result = category;
        return true; // Stop traversal
      }
    });
    
    return result;
  }, [categories, traverseCategories]);

  // Get all categories as a flat array (memoized)
  const getAllCategoriesFlat = useMemo((): ProductCategory[] => {
    const result: ProductCategory[] = [];
    
    traverseCategories(categories, (category) => {
      result.push(category);
    });
    
    return result;
  }, [categories, traverseCategories]);

  // Fetch a category by its slug
  const fetchCategoryBySlug = async (slug: string): Promise<ProductCategory | null> => {
    try {
      return await getCategoryBySlug(slug);
    } catch (err) {
      toast({
        title: "Error loading category",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  return { 
    categories, 
    isLoading, 
    error, 
    getCategoryById,
    getAllCategoriesFlat,
    fetchCategoryBySlug,
    refreshCategories: fetchCategories
  };
}
