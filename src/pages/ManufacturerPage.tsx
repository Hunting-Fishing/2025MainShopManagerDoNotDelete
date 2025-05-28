
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '@/lib/supabase';
import ProductCard from '@/components/affiliate/ProductCard';

interface Product {
  id: string;
  product_name: string;
  product_category: string;
  brand: string;
  featured: boolean;
  affiliate_link: string;
  average_rating: number;
  category_id: string;
  created_at: string;
  description: string;
  image_url: string;
  is_approved: boolean;
  is_available: boolean;
  price: number;
  review_count: number;
  product_type: string;
  updated_at: string;
}

export default function ManufacturerPage() {
  const { manufacturer } = useParams<{ manufacturer: string }>();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (manufacturer) {
      fetchManufacturerProducts();
    }
  }, [manufacturer]);

  const fetchManufacturerProducts = async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error } = await supabase
        .from('products')
        .select('*')
        .eq('is_approved', true)
        .eq('is_available', true)
        .or(`brand.ilike.%${manufacturer}%,product_name.ilike.%${manufacturer}%`);

      if (error) throw error;

      // Transform database data to match Product interface
      const transformedProducts: Product[] = (data || []).map(product => ({
        id: product.id,
        product_name: product.product_name || 'Unnamed Product',
        product_category: product.product_category || 'Uncategorized',
        brand: product.brand || manufacturer || 'Unknown',
        featured: product.featured || false,
        affiliate_link: product.affiliate_link || '',
        average_rating: product.average_rating || 0,
        category_id: product.category_id || '',
        created_at: product.created_at || '',
        description: product.description || '',
        image_url: product.image_url || '',
        is_approved: product.is_approved || false,
        is_available: product.is_available || false,
        price: product.price || 0,
        review_count: product.review_count || 0,
        product_type: product.product_type || 'standard',
        updated_at: product.updated_at || product.created_at || ''
      }));

      setProducts(transformedProducts);
    } catch (error: any) {
      console.error('Error fetching manufacturer products:', error);
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading products...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">{manufacturer} Products</h1>
      
      {products.length === 0 ? (
        <div className="text-center text-gray-600">
          No products found for this manufacturer.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => {
            // Transform to AffiliateProduct for ProductCard
            const affiliateProduct = {
              id: product.id,
              name: product.product_name,
              description: product.description,
              imageUrl: product.image_url,
              retailPrice: product.price,
              affiliateUrl: product.affiliate_link,
              category: product.product_category,
              tier: product.product_type as any,
              rating: product.average_rating,
              reviewCount: product.review_count,
              manufacturer: product.brand,
              isFeatured: product.featured
            };
            
            return (
              <ProductCard key={product.id} product={affiliateProduct} />
            );
          })}
        </div>
      )}
    </div>
  );
}
