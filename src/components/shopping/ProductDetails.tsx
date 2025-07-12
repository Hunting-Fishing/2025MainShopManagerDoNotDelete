import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  ArrowLeft, 
  Heart, 
  Share2, 
  ShoppingCart, 
  AlertTriangle,
  Package,
  Truck,
  Shield,
  Star,
  Info
} from 'lucide-react';
import { AffiliateProduct } from '@/types/affiliate';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';
import { useShoppingCart } from '@/hooks/shopping/useShoppingCart';
import { useProductAnalytics } from '@/hooks/shopping/useProductAnalytics';
import { formatCurrency } from '@/lib/utils';
import { ProductRating } from '@/components/affiliate/ProductRating';
import ProductReviews from './ProductReviews';
import ReviewForm from './ReviewForm';
import RelatedProducts from './RelatedProducts';
import RecentlyViewed from './RecentlyViewed';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription } from '@/components/ui/alert';

const ProductDetails: React.FC = () => {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<AffiliateProduct | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [isReviewFormOpen, setIsReviewFormOpen] = useState(false);
  const [stockInfo, setStockInfo] = useState({ inStock: true, quantity: 0, lowStock: false });
  
  const { products, loading, error } = useProductsManager();
  const { addToCart } = useShoppingCart();
  const { trackInteraction } = useProductAnalytics();
  const { toast } = useToast();

  useEffect(() => {
    if (products.length > 0 && productId) {
      const foundProduct = products.find(p => p.id === productId);
      if (foundProduct) {
        const transformedProduct: AffiliateProduct = {
          id: foundProduct.id,
          name: foundProduct.title,
          description: foundProduct.description || '',
          imageUrl: foundProduct.image_url || '',
          retailPrice: foundProduct.price || 0,
          affiliateUrl: foundProduct.affiliate_link || '#',
          category: foundProduct.category || 'Tools',
          tier: 'midgrade',
          rating: foundProduct.average_rating || 0,
          reviewCount: foundProduct.review_count || 0,
          manufacturer: 'Professional Tools',
          model: foundProduct.title,
          isFeatured: foundProduct.is_featured || false,
          bestSeller: foundProduct.is_bestseller || false,
          freeShipping: false,
          source: 'other'
        };
        
        setProduct(transformedProduct);
        
        // Track product view
        trackInteraction({
          productId: foundProduct.id,
          productName: foundProduct.title,
          category: foundProduct.category,
          interactionType: 'view'
        });

        // Simulate stock information (in real app, this would come from inventory)
        setStockInfo({
          inStock: true,
          quantity: Math.floor(Math.random() * 50) + 1,
          lowStock: Math.random() > 0.7
        });
      } else {
        // Product not found
        setProduct(null);
      }
    }
  }, [products, productId, trackInteraction]);

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      await addToCart({
        productId: product.id,
        name: product.name,
        price: product.retailPrice,
        imageUrl: product.imageUrl,
        category: product.category,
        manufacturer: product.manufacturer
      });

      trackInteraction({
        productId: product.id,
        productName: product.name,
        category: product.category,
        interactionType: 'add_to_cart'
      });

      toast({
        title: "Added to cart",
        description: `${product.name} has been added to your cart.`
      });
    } catch (error) {
      console.error('Error adding to cart:', error);
      toast({
        title: "Error",
        description: "Failed to add product to cart. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleSave = () => {
    if (!product) return;

    trackInteraction({
      productId: product.id,
      productName: product.name,
      category: product.category,
      interactionType: 'save'
    });

    toast({
      title: "Product saved",
      description: `${product.name} has been added to your wishlist.`
    });
  };

  const handleShare = () => {
    if (!product) return;

    navigator.clipboard.writeText(window.location.href);
    
    trackInteraction({
      productId: product.id,
      productName: product.name,
      category: product.category,
      interactionType: 'share'
    });

    toast({
      title: "Link copied",
      description: "Product link copied to clipboard."
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-1/4"></div>
          <div className="grid md:grid-cols-2 gap-8">
            <div className="aspect-square bg-muted rounded"></div>
            <div className="space-y-4">
              <div className="h-8 bg-muted rounded w-3/4"></div>
              <div className="h-6 bg-muted rounded w-1/2"></div>
              <div className="h-20 bg-muted rounded"></div>
              <div className="h-12 bg-muted rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Error loading product details: {error}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert>
          <Info className="h-4 w-4" />
          <AlertDescription>
            Product not found. The product you're looking for may have been removed or doesn't exist.
          </AlertDescription>
        </Alert>
        <Button 
          variant="outline" 
          onClick={() => navigate('/shopping')}
          className="mt-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Shopping
        </Button>
      </div>
    );
  }

  const images = [product.imageUrl]; // In a real app, products would have multiple images

  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      {/* Back Button */}
      <Button 
        variant="outline" 
        onClick={() => navigate('/shopping')}
        className="mb-6"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Shopping
      </Button>

      {/* Product Overview */}
      <div className="grid md:grid-cols-2 gap-8">
        {/* Product Images */}
        <div className="space-y-4">
          <div className="aspect-square overflow-hidden rounded-lg border">
            <img
              src={images[selectedImage]}
              alt={product.name}
              className="h-full w-full object-cover"
            />
          </div>
          
          {images.length > 1 && (
            <div className="flex gap-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  className={`flex-1 aspect-square overflow-hidden rounded border-2 transition-colors ${
                    selectedImage === index ? 'border-primary' : 'border-muted'
                  }`}
                  onClick={() => setSelectedImage(index)}
                >
                  <img
                    src={image}
                    alt={`${product.name} ${index + 1}`}
                    className="h-full w-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Info */}
        <div className="space-y-6">
          <div>
            <p className="text-sm text-muted-foreground mb-2">{product.manufacturer}</p>
            <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
            
            {product.rating > 0 && (
              <div className="flex items-center gap-4 mb-4">
                <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
              </div>
            )}
            
            <div className="flex items-center gap-2 mb-4">
              <span className="text-3xl font-bold">{formatCurrency(product.retailPrice)}</span>
              {product.isFeatured && <Badge>Featured</Badge>}
              {product.bestSeller && <Badge variant="secondary">Best Seller</Badge>}
            </div>
          </div>

          {/* Stock Status */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4" />
                <span className="font-medium">
                  {stockInfo.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
              </div>
              {stockInfo.inStock && (
                <div className="text-sm text-muted-foreground">
                  {stockInfo.quantity} available
                  {stockInfo.lowStock && (
                    <span className="text-orange-600 ml-2">• Limited quantity</span>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="space-y-3">
            <Button 
              size="lg" 
              className="w-full" 
              onClick={handleAddToCart}
              disabled={!stockInfo.inStock}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {stockInfo.inStock ? 'Add to Cart' : 'Out of Stock'}
            </Button>
            
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1" onClick={handleSave}>
                <Heart className="h-4 w-4 mr-2" />
                Save
              </Button>
              <Button variant="outline" className="flex-1" onClick={handleShare}>
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>

          {/* Features */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Truck className="h-4 w-4" />
              Free shipping on orders over $50
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="h-4 w-4" />
              1-year manufacturer warranty
            </div>
          </div>
        </div>
      </div>

      {/* Product Details Tabs */}
      <Tabs defaultValue="description" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="specifications">Specifications</TabsTrigger>
          <TabsTrigger value="reviews">Reviews</TabsTrigger>
        </TabsList>
        
        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground leading-relaxed">
                {product.description || 'No description available for this product.'}
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="specifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Product Specifications</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">Brand:</span>
                    <span>{product.manufacturer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Model:</span>
                    <span>{product.model}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Category:</span>
                    <span>{product.category}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="font-medium">SKU:</span>
                    <span>{product.id.slice(0, 8).toUpperCase()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Weight:</span>
                    <span>N/A</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium">Dimensions:</span>
                    <span>N/A</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="space-y-4">
          <ProductReviews 
            productId={product.id}
            onWriteReview={() => setIsReviewFormOpen(true)}
          />
        </TabsContent>
      </Tabs>

      {/* Related Products */}
      <RelatedProducts currentProduct={product} />

      {/* Recently Viewed Sidebar */}
      <div className="grid lg:grid-cols-4 gap-6">
        <div className="lg:col-span-3"></div>
        <div className="lg:col-span-1">
          <RecentlyViewed limit={5} />
        </div>
      </div>

      {/* Review Form Modal */}
      <ReviewForm
        productId={product.id}
        productName={product.name}
        isOpen={isReviewFormOpen}
        onClose={() => setIsReviewFormOpen(false)}
        onReviewSubmitted={() => {
          // Refresh reviews or update state as needed
          console.log('Review submitted for product:', product.id);
        }}
      />
    </div>
  );
};

export default ProductDetails;