import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Heart, Share2, ShoppingCart, Star, ExternalLink } from 'lucide-react';
import { AffiliateProduct } from '@/types/affiliate';
import { ProductRating } from '@/components/affiliate/ProductRating';
import ProductTierBadge from '@/components/affiliate/ProductTierBadge';
import { useShoppingCart } from '@/hooks/shopping/useShoppingCart';
import { formatCurrency } from '@/lib/utils';
import { toast } from 'sonner';

interface ProductQuickViewProps {
  product: AffiliateProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

const ProductQuickView: React.FC<ProductQuickViewProps> = ({
  product,
  isOpen,
  onClose
}) => {
  const { addToCart } = useShoppingCart();
  const [quantity, setQuantity] = useState(1);

  if (!product) return null;

  const handleAddToCart = async () => {
    try {
      for (let i = 0; i < quantity; i++) {
        await addToCart({
          productId: product.id,
          name: product.name,
          price: product.retailPrice,
          imageUrl: product.imageUrl,
          category: product.category,
          manufacturer: product.manufacturer
        });
      }
      onClose();
    } catch (error) {
      // Error handling is done in the hook
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + '/product/' + product.id);
    toast.success('Product link copied to clipboard');
  };

  const handleWishlist = () => {
    toast.success('Added to wishlist');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Quick View</DialogTitle>
        </DialogHeader>
        
        <div className="grid md:grid-cols-2 gap-6">
          {/* Product Image */}
          <div className="relative">
            <img 
              src={product.imageUrl} 
              alt={product.name}
              className="w-full h-96 object-cover rounded-lg"
            />
            {product.discount && (
              <Badge className="absolute top-2 right-2 bg-red-500 text-white">
                {product.discount}% OFF
              </Badge>
            )}
            {product.isFeatured && (
              <div className="absolute top-2 left-2">
                <ProductTierBadge tier={product.tier} />
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-4">
            <div>
              <Badge variant="outline" className="mb-2">
                {product.category}
              </Badge>
              <h1 className="text-2xl font-bold">{product.name}</h1>
              <p className="text-muted-foreground">{product.manufacturer}</p>
            </div>

            {product.rating && (
              <ProductRating 
                rating={product.rating} 
                reviewCount={product.reviewCount} 
              />
            )}

            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold">
                {formatCurrency(product.retailPrice)}
              </span>
              {product.discount && (
                <span className="text-lg text-muted-foreground line-through">
                  {formatCurrency(product.retailPrice * (1 + product.discount / 100))}
                </span>
              )}
            </div>

            <Separator />

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Quantity</label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  >
                    -
                  </Button>
                  <span className="w-12 text-center border rounded px-2 py-1">
                    {quantity}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setQuantity(quantity + 1)}
                  >
                    +
                  </Button>
                </div>
              </div>

              <div className="flex gap-2">
                <Button 
                  className="flex-1" 
                  onClick={handleAddToCart}
                >
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  Add to Cart
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleWishlist}
                >
                  <Heart className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={handleShare}
                >
                  <Share2 className="h-4 w-4" />
                </Button>
              </div>

              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => window.open(product.affiliateUrl, '_blank')}
              >
                <ExternalLink className="mr-2 h-4 w-4" />
                View on {product.source === 'amazon' ? 'Amazon' : 'Retailer Site'}
              </Button>
            </div>

            <Separator />

            <div>
              <h3 className="font-semibold mb-2">Description</h3>
              <p className="text-sm text-muted-foreground">
                {product.description || 'No description available for this product.'}
              </p>
            </div>

            {product.freeShipping && (
              <Badge variant="outline" className="text-green-600 border-green-600">
                Free Shipping
              </Badge>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ProductQuickView;