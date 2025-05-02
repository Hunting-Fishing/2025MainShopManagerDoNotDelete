
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

  const createProduct = async (product: Partial<AffiliateTool>): Promise<void> => {
    try {
      const newProduct = await productService.createProduct(product);
      
      // Update local state with the new product
      setProducts(prevProducts => [...prevProducts, newProduct]);

      toast({
        title: 'Success',
        description: `${newProduct.name} has been added successfully.`,
        variant: 'success',
      });
    } catch (err) {
      console.error('Error creating product:', err);
      toast({
        title: 'Error',
        description: 'Failed to create product. Please try again.',
        variant: 'destructive',
      });
      throw err;
    }
  };

  const deleteProduct = async (productId: string): Promise<void> => {
    try {
      await productService.deleteProduct(productId);
      
      // Remove the product from local state
      setProducts(prevProducts => prevProducts.filter(p => p.id !== productId));

      toast({
        title: 'Success',
        description: 'Product has been deleted successfully.',
        variant: 'success',
      });
    } catch (err) {
      console.error('Error deleting product:', err);
      toast({
        title: 'Error',
        description: 'Failed to delete product. Please try again.',
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
    createProduct,
    deleteProduct
  };
};
