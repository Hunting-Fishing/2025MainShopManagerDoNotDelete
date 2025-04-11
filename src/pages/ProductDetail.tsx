
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ResponsiveContainer } from '@/components/ui/responsive-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Heart, ChevronLeft, Star, StarHalf, ShoppingCart, Check } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { useWishlist } from '@/hooks/useWishlist';
import { Product } from '@/types/shopping';
import { getProductById, getProductReviews } from '@/services/shopping/productService';
import { useAuthUser } from '@/hooks/useAuthUser';
import { formatCurrency } from '@/lib/formatters';
import { ProductReview } from '@/components/shopping/ProductReview';
import { AddToCartButton } from '@/components/shopping/AddToCartButton';

export default function ProductDetail() {
  const { productId } = useParams<{ productId: string }>();
  const navigate = useNavigate();
  const { userId, isAuthenticated } = useAuthUser();
  const { addItem, removeItem, checkIfInWishlist } = useWishlist();
  
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [inWishlist, setInWishlist] = useState(false);
  const [inventoryStatus, setInventoryStatus] = useState<string>('');
  const [quantity, setQuantity] = useState(1);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Fetch product data
  useEffect(() => {
    const fetchProductData = async () => {
      if (!productId) return;
      
      setIsLoading(true);
      try {
        const productData = await getProductById(productId);
        if (productData) {
          setProduct(productData);
          
          // Get inventory status
          if (productData.stock_quantity && productData.stock_quantity > 10) {
            setInventoryStatus('In Stock');
          } else if (productData.stock_quantity && productData.stock_quantity > 0) {
            setInventoryStatus('Low Stock - Only ' + productData.stock_quantity + ' left');
          } else {
            setInventoryStatus('Out of Stock');
          }
          
          // Get reviews
          const reviewsData = await getProductReviews(productId);
          setReviews(reviewsData);
          
          // Check wishlist status
          if (isAuthenticated) {
            const isInWishlist = await checkIfInWishlist(productId);
            setInWishlist(isInWishlist);
          }
        }
      } catch (error) {
        console.error('Error fetching product:', error);
        toast({
          title: "Error loading product",
          description: "Unable to load product details. Please try again later.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductData();
  }, [productId, isAuthenticated, checkIfInWishlist]);

  const handleToggleWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to add items to your wishlist",
        variant: "default",
      });
      return;
    }

    if (!product) return;

    try {
      if (inWishlist) {
        await removeItem(product.id);
        setInWishlist(false);
        toast({
          title: "Removed from wishlist",
          description: `${product.title} has been removed from your wishlist`,
        });
      } else {
        await addItem(product.id);
        setInWishlist(true);
        toast({
          title: "Added to wishlist",
          description: `${product.title} has been added to your wishlist`,
        });
      }
    } catch (error) {
      console.error('Error updating wishlist:', error);
      toast({
        title: "Error",
        description: "Failed to update wishlist. Please try again later.",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    if (!product) return;
    
    setIsAddingToCart(true);
    try {
      // We'll implement this in the next feature
      toast({
        title: "Added to Cart",
        description: `${quantity} ${quantity > 1 ? 'items' : 'item'} added to your cart`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Could not add to cart. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsAddingToCart(false);
    }
  };

  const renderStarRating = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push(<Star key={`full-${i}`} className="fill-yellow-400 text-yellow-400" />);
    }
    
    if (hasHalfStar) {
      stars.push(<StarHalf key="half" className="fill-yellow-400 text-yellow-400" />);
    }
    
    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(<Star key={`empty-${i}`} className="text-gray-300" />);
    }
    
    return stars;
  };

  if (isLoading) {
    return (
      <ResponsiveContainer className="py-6">
        <div className="flex flex-col items-center justify-center h-64">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
          <p className="mt-4 text-muted-foreground">Loading product details...</p>
        </div>
      </ResponsiveContainer>
    );
  }

  if (!product) {
    return (
      <ResponsiveContainer className="py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Product Not Found</h2>
          <p className="mb-6">Sorry, the product you're looking for could not be found.</p>
          <Button onClick={() => navigate('/shopping')}>Return to Shop</Button>
        </div>
      </ResponsiveContainer>
    );
  }

  return (
    <ResponsiveContainer className="py-6">
      {/* Back Button */}
      <div className="mb-6">
        <Button variant="outline" size="sm" onClick={() => navigate('/shopping')}>
          <ChevronLeft className="h-4 w-4 mr-2" /> Back to Shopping
        </Button>
      </div>
      
      {/* Product Detail Layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Product Image */}
        <div className="bg-white rounded-lg overflow-hidden shadow-sm">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title} 
              className="w-full h-auto object-contain aspect-square"
            />
          ) : (
            <div className="w-full aspect-square bg-slate-100 flex items-center justify-center">
              <span className="text-slate-400">No image available</span>
            </div>
          )}
        </div>
        
        {/* Product Info */}
        <div className="flex flex-col">
          <div>
            {product.product_type === 'suggested' && (
              <Badge variant="outline" className="mb-2 bg-purple-50 text-purple-700 border-purple-200">
                Community Suggested
              </Badge>
            )}
            {product.is_bestseller && (
              <Badge variant="secondary" className="mb-2 mr-2 bg-amber-50 text-amber-700 border-amber-200">
                Bestseller
              </Badge>
            )}
            <h1 className="text-3xl font-bold">{product.title}</h1>
            
            {/* Rating */}
            {product.average_rating > 0 && (
              <div className="flex items-center mt-2">
                <div className="flex mr-2">
                  {renderStarRating(product.average_rating)}
                </div>
                <span className="text-sm text-muted-foreground">
                  {product.average_rating.toFixed(1)} ({product.review_count} reviews)
                </span>
              </div>
            )}
            
            {/* Price */}
            <div className="mt-4">
              {product.sale_price ? (
                <div className="flex items-center">
                  <span className="text-2xl font-bold text-green-600 mr-2">
                    {formatCurrency(product.sale_price)}
                  </span>
                  <span className="text-lg text-muted-foreground line-through">
                    {formatCurrency(product.price || 0)}
                  </span>
                </div>
              ) : (
                <span className="text-2xl font-bold">
                  {formatCurrency(product.price || 0)}
                </span>
              )}
            </div>
            
            {/* Stock Status */}
            <div className="mt-2">
              {inventoryStatus === 'In Stock' ? (
                <div className="flex items-center text-green-600">
                  <Check className="h-5 w-5 mr-1" />
                  <span>In Stock</span>
                </div>
              ) : inventoryStatus === 'Out of Stock' ? (
                <span className="text-red-600">Out of Stock</span>
              ) : (
                <span className="text-orange-600">{inventoryStatus}</span>
              )}
            </div>
            
            {/* Description */}
            <div className="mt-4 text-gray-700">
              <p>{product.description}</p>
            </div>

            {/* Additional Product Info */}
            {(product.sku || product.weight || product.dimensions) && (
              <div className="mt-6 border-t pt-4">
                <h3 className="font-medium mb-2">Product Specifications</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {product.sku && (
                    <>
                      <div className="text-muted-foreground">SKU:</div>
                      <div>{product.sku}</div>
                    </>
                  )}
                  {product.weight && (
                    <>
                      <div className="text-muted-foreground">Weight:</div>
                      <div>{product.weight} kg</div>
                    </>
                  )}
                </div>
              </div>
            )}
            
            {/* Add to Cart Section */}
            <div className="mt-8 flex items-end gap-4">
              <div className="w-20">
                <label htmlFor="quantity" className="block text-sm font-medium mb-1">
                  Quantity
                </label>
                <select 
                  id="quantity" 
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="w-full h-10 border rounded px-3 focus:outline-none focus:ring-2 focus:ring-primary"
                  disabled={inventoryStatus === 'Out of Stock'}
                >
                  {[...Array(10)].map((_, i) => (
                    <option key={i} value={i + 1}>{i + 1}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex gap-2 flex-grow">
                <Button 
                  onClick={handleAddToCart}
                  disabled={isAddingToCart || inventoryStatus === 'Out of Stock'} 
                  className="flex-grow"
                >
                  <ShoppingCart className="h-4 w-4 mr-2" />
                  {isAddingToCart ? "Adding..." : "Add to Cart"}
                </Button>
                
                <Button 
                  variant="outline" 
                  size="icon" 
                  onClick={handleToggleWishlist}
                  className={inWishlist ? "text-red-500" : ""}
                >
                  <Heart className={inWishlist ? "fill-red-500" : ""} />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Product Tabs */}
      <Tabs defaultValue="details" className="mt-12">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="reviews">Reviews ({reviews.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="details" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <h3>Product Details</h3>
                <p>{product.description}</p>
                
                {product.suggestion_reason && (
                  <>
                    <h4>Why This Product Was Suggested</h4>
                    <p>{product.suggestion_reason}</p>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="reviews" className="mt-6">
          <Card>
            <CardContent className="pt-6">
              {reviews.length > 0 ? (
                <div className="space-y-6">
                  {reviews.map((review) => (
                    <ProductReview key={review.id} review={review} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <h3 className="text-lg font-medium">No Reviews Yet</h3>
                  <p className="text-muted-foreground mt-1">Be the first to review this product!</p>
                  {user && (
                    <Button className="mt-4">Write a Review</Button>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ResponsiveContainer>
  );
}
