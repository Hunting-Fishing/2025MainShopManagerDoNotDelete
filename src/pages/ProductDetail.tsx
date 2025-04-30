import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';
import { useWishlist } from '@/hooks/useWishlist';
import { cn } from '@/lib/utils';
import { Product } from '@/types/shopping';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { addItem, removeItem, checkIfInWishlist } = useWishlist();
  const [product, setProduct] = useState<Product | null>(null);
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // This would be replaced with an actual API call in a real implementation
    const fetchProduct = async () => {
      setIsLoading(true);
      try {
        // For now, create a mock product based on the ID
        // In a real app, you'd fetch this from your API
        const mockProduct: Product = {
          id: productId || 'unknown',
          title: `Product ${productId}`,
          description: 'Detailed product description would go here.',
          price: 99.99,
          category_id: 'tools',
          product_type: 'affiliate',
          is_featured: true,
          is_bestseller: false,
          is_approved: true,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          image_url: 'https://via.placeholder.com/400',
          affiliate_link: 'https://amazon.com'
        };
        
        setProduct(mockProduct);
        
        // Check if the product is in the wishlist
        if (productId) {
          const inWishlist = await checkIfInWishlist(productId);
          setIsInWishlist(inWishlist);
        }
      } catch (error) {
        console.error("Error fetching product:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProduct();
  }, [productId, checkIfInWishlist]);

  const handleWishlistToggle = async () => {
    if (!product) return;
    
    if (isInWishlist) {
      await removeItem(product.id);
      setIsInWishlist(false);
    } else {
      await addItem(product);
      setIsInWishlist(true);
    }
  };

  // Show loading state
  if (isLoading || !product) {
    return (
      <ShoppingPageLayout title="Loading..." description="Please wait">
        <div className="flex items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      </ShoppingPageLayout>
    );
  }

  return (
    <ShoppingPageLayout 
      title={product.title} 
      description={product.description || ''}
      breadcrumbs={[
        { label: 'Home', path: '/' },
        { label: 'Shop', path: '/shopping' },
        { label: 'Products', path: '/shopping/products' },
        { label: product.title }
      ]}
    >
      <div>
        <Button 
          variant="outline" 
          className="mb-4" 
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-slate-50 rounded-lg overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="w-full h-auto object-contain"
              />
            ) : (
              <div className="h-96 flex items-center justify-center bg-slate-100 text-slate-400">
                No Image Available
              </div>
            )}
          </div>
          
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.title}</h1>
            
            {product.price !== undefined && (
              <p className="text-2xl font-semibold text-primary mb-4">
                ${product.price.toFixed(2)}
              </p>
            )}
            
            {product.description && (
              <div className="prose mb-6">
                <p>{product.description}</p>
              </div>
            )}
            
            <div className="flex gap-4 mb-8">
              {product.affiliate_link && (
                <Button className="bg-[#FF9900] hover:bg-[#E68A00] text-white">
                  View on Amazon
                </Button>
              )}
              
              <Button
                variant="outline"
                onClick={handleWishlistToggle}
                className={cn(
                  "transition-colors",
                  isInWishlist && "bg-pink-50 border-pink-200 text-pink-500 hover:bg-pink-100"
                )}
              >
                <Heart className={cn(
                  "h-5 w-5 mr-2",
                  isInWishlist && "fill-pink-500 text-pink-500"
                )} />
                {isInWishlist ? 'Remove from Wishlist' : 'Add to Wishlist'}
              </Button>
            </div>
            
            {/* Additional product information would go here */}
          </div>
        </div>
      </div>
    </ShoppingPageLayout>
  );
}
