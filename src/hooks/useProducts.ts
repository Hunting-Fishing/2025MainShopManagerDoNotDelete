
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilterOptions } from '@/types/shopping';
import { 
  getProducts, 
  getProductById,
  getUserSuggestions,
  submitProductSuggestion
} from '@/services/shopping/productService';
import { toast } from '@/hooks/use-toast';
import { handleApiError } from '@/utils/errorHandling';

export function useProducts(initialOptions: ProductFilterOptions = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [filterOptions, setFilterOptions] = useState<ProductFilterOptions>(initialOptions);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchProducts = useCallback(async (options: ProductFilterOptions = filterOptions) => {
    try {
      setIsLoading(true);
      const data = await getProducts(options);
      setProducts(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown error'));
      handleApiError(err, "Error loading products");
    } finally {
      setIsLoading(false);
    }
  }, [filterOptions]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const updateFilters = useCallback((newFilters: Partial<ProductFilterOptions>) => {
    const updatedFilters = { ...filterOptions, ...newFilters };
    setFilterOptions(updatedFilters);
    fetchProducts(updatedFilters);
  }, [filterOptions, fetchProducts]);

  const fetchProductById = async (id: string): Promise<Product | null> => {
    try {
      return await getProductById(id);
    } catch (err) {
      handleApiError(err, "Error loading product");
      return null;
    }
  };

  const fetchUserSuggestions = async (includeUnapproved = false): Promise<Product[]> => {
    try {
      console.log("Fetching user suggestions, includeUnapproved:", includeUnapproved);
      const suggestions = await getUserSuggestions(includeUnapproved);
      console.log("Fetched suggestions:", suggestions);
      return suggestions;
    } catch (err) {
      console.error("Error fetching user suggestions:", err);
      handleApiError(err, "Error loading suggestions");
      return [];
    }
  };

  const suggestProduct = async (suggestion: Partial<Product>): Promise<boolean> => {
    try {
      console.log("Submitting product suggestion:", suggestion);
      const result = await submitProductSuggestion(suggestion);
      console.log("Suggestion submitted successfully:", result);
      
      toast({
        title: "Thank you for your suggestion!",
        description: "It will be reviewed by our team soon.",
      });
      
      return true;
    } catch (err) {
      console.error("Error submitting suggestion:", err);
      handleApiError(err, "Error submitting product suggestion");
      return false;
    }
  };

  return { 
    products, 
    isLoading, 
    error, 
    filterOptions,
    updateFilters,
    fetchProducts,
    fetchProductById,
    fetchUserSuggestions,
    suggestProduct
  };
}
