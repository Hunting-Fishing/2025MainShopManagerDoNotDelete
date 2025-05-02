
import { useState, useEffect } from 'react';
import { AffiliateTool, AffiliateProduct } from '@/types/affiliate';
import * as productService from '@/services/affiliate/productService';
import { toast } from "@/hooks/use-toast";

interface UseProductsManagerProps {
  categoryType: 'tool' | 'manufacturer' | 'featured';
  categoryId?: string;
  categoryName?: string;
}

export const useProductsManager = ({ categoryType, categoryId, categoryName }: UseProductsManagerProps) => {
  const [products, setProducts] = useState<AffiliateTool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!categoryName && !categoryId) return;

    const fetchProducts = async () => {
      setLoading(true);
      setError(null);
      try {
        let fetchedProducts: AffiliateTool[] = [];

        if (categoryType === 'tool' && categoryName) {
          fetchedProducts = await productService.getProductsByCategory(categoryName);
        } else if (categoryType === 'manufacturer' && categoryName) {
          fetchedProducts = await productService.getProductsByManufacturer(categoryName);
        } else if (categoryType === 'featured' && categoryId) {
          fetchedProducts = await productService.getProductsByFeaturedGroup(categoryId);
        }

        setProducts(fetchedProducts);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Failed to load products. Please try again.');
        toast({
          title: 'Error',
          description: 'Failed to load products. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [categoryType, categoryId, categoryName]);

  const updateProduct = async (updatedProduct: AffiliateTool | AffiliateProduct): Promise<void> => {
    try {
      const result = await productService.updateProduct(updatedProduct);
      
      // Update the local state
      setProducts(prevProducts => 
        prevProducts.map(p => p.id === result.id ? result as AffiliateTool : p)
      );

      toast({
        title: 'Success',
        description: `${result.name} has been updated successfully.`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Error updating product:', err);
      toast({
        title: 'Error',
        description: 'Failed to update product. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  return {
    products,
    loading,
    error,
    updateProduct,
  };
};
