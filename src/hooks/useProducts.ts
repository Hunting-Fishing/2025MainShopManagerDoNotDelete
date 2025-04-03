
import { useState, useEffect, useCallback } from 'react';
import { Product, ProductFilterOptions } from '@/types/shopping';
import { 
  getProducts, 
  getProductById,
  getUserSuggestions,
  submitProductSuggestion
} from '@/services/shopping/productService';
import { toast } from '@/hooks/use-toast';

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
      toast({
        title: "Error loading products",
        description: "Please try again later",
        variant: "destructive",
      });
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
      toast({
        title: "Error loading product",
        description: "Please try again later",
        variant: "destructive",
      });
      return null;
    }
  };

  const fetchUserSuggestions = async (includeUnapproved = false): Promise<Product[]> => {
    try {
      return await getUserSuggestions(includeUnapproved);
    } catch (err) {
      toast({
        title: "Error loading user suggestions",
        description: "Please try again later",
        variant: "destructive",
      });
      return [];
    }
  };

  const suggestProduct = async (suggestion: Partial<Product>): Promise<boolean> => {
    try {
      await submitProductSuggestion(suggestion);
      toast({
        title: "Thank you for your suggestion!",
        description: "It will be reviewed by our team soon.",
      });
      return true;
    } catch (err) {
      toast({
        title: "Error submitting suggestion",
        description: "Please try again later",
        variant: "destructive",
      });
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
