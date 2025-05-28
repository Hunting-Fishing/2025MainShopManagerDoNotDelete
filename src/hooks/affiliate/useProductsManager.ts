
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
          const data = await productService.getProductsByCategory(categoryName);
          // Transform ProductData to AffiliateTool
          fetchedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            price: product.price,
            imageUrl: product.image_url,
            category: product.category,
            manufacturer: product.manufacturer,
            rating: product.average_rating,
            reviewCount: product.review_count,
            affiliateLink: product.affiliate_link,
            featured: product.featured,
            subcategory: undefined,
            bestSeller: false,
            seller: 'Shop',
            tags: []
          }));
        } else if (categoryType === 'manufacturer' && categoryName) {
          const data = await productService.getProductsByManufacturer(categoryName);
          fetchedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            price: product.price,
            imageUrl: product.image_url,
            category: product.category,
            manufacturer: product.manufacturer,
            rating: product.average_rating,
            reviewCount: product.review_count,
            affiliateLink: product.affiliate_link,
            featured: product.featured,
            subcategory: undefined,
            bestSeller: false,
            seller: 'Shop',
            tags: []
          }));
        } else if (categoryType === 'featured' && categoryId) {
          const data = await productService.getProductsByFeaturedGroup(categoryId);
          fetchedProducts = data.map(product => ({
            id: product.id,
            name: product.name,
            description: product.description,
            slug: product.slug,
            price: product.price,
            imageUrl: product.image_url,
            category: product.category,
            manufacturer: product.manufacturer,
            rating: product.average_rating,
            reviewCount: product.review_count,
            affiliateLink: product.affiliate_link,
            featured: product.featured,
            subcategory: undefined,
            bestSeller: false,
            seller: 'Shop',
            tags: []
          }));
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
        prevProducts.map(p => p.id === result.id ? {
          id: result.id,
          name: result.name,
          description: result.description,
          slug: result.slug,
          price: result.price,
          imageUrl: result.image_url,
          category: result.category,
          manufacturer: result.manufacturer,
          rating: result.average_rating,
          reviewCount: result.review_count,
          affiliateLink: result.affiliate_link,
          featured: result.featured,
          subcategory: undefined,
          bestSeller: false,
          seller: 'Shop',
          tags: []
        } : p)
      );

      toast({
        title: 'Success',
        description: `${result.name} has been updated successfully.`,
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
      const newAffiliateTool: AffiliateTool = {
        id: newProduct.id,
        name: newProduct.name,
        description: newProduct.description,
        slug: newProduct.slug,
        price: newProduct.price,
        imageUrl: newProduct.image_url,
        category: newProduct.category,
        manufacturer: newProduct.manufacturer,
        rating: newProduct.average_rating,
        reviewCount: newProduct.review_count,
        affiliateLink: newProduct.affiliate_link,
        featured: newProduct.featured,
        subcategory: undefined,
        bestSeller: false,
        seller: 'Shop',
        tags: []
      };
      
      setProducts(prevProducts => [...prevProducts, newAffiliateTool]);

      toast({
        title: 'Success',
        description: `${newProduct.name} has been added successfully.`,
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
