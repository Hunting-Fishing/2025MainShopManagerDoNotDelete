
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types/shopping';
import { getCategories, getCategoryBySlug } from '@/services/shopping/categoryService';
import { toast } from '@/hooks/use-toast';

export function useCategories() {
  const [categories, setCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function fetchCategories() {
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
    }

    fetchCategories();
  }, []);

  const getCategoryById = (id: string): ProductCategory | undefined => {
    // Search in main categories
    const mainCategory = categories.find(cat => cat.id === id);
    if (mainCategory) return mainCategory;

    // Search in subcategories
    for (const category of categories) {
      if (category.subcategories) {
        const subCategory = category.subcategories.find(sub => sub.id === id);
        if (subCategory) return subCategory;
        
        // Search in deeper levels (sub-subcategories)
        for (const subCat of category.subcategories) {
          if (subCat.subcategories) {
            const subSubCategory = subCat.subcategories.find(subSub => subSub.id === id);
            if (subSubCategory) return subSubCategory;
          }
        }
      }
    }

    return undefined;
  };

  const getAllCategoriesFlat = (): ProductCategory[] => {
    const result: ProductCategory[] = [];
    
    const addCategory = (category: ProductCategory) => {
      result.push(category);
      if (category.subcategories) {
        category.subcategories.forEach(addCategory);
      }
    };
    
    categories.forEach(addCategory);
    return result;
  };

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
    fetchCategoryBySlug
  };
}
