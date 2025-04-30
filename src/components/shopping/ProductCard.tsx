
import React, { useState, useEffect } from 'react';
import { Product } from '@/types/shopping';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Heart, ExternalLink } from 'lucide-react';
import { useWishlist } from '@/hooks/useWishlist';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ProductCardProps {
  product: Product;
  onAddToWishlist?: () => void;
  onRemoveFromWishlist?: () => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onAddToWishlist,
  onRemoveFromWishlist
}) => {
  const { checkIfInWishlist, addItem, removeItem, isAuthenticated } = useWishlist();
  const [isInWishlist, setIsInWishlist] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const checkWishlist = async () => {
      if (isAuthenticated) {
        const inWishlist = await checkIfInWishlist(product.id);
        setIsInWishlist(inWishlist);
      }
    };
    
    checkWishlist();
  }, [product.id, checkIfInWishlist, isAuthenticated]);

  const handleWishlistToggle = async () => {
    setIsLoading(true);
    try {
      if (isInWishlist) {
        await removeItem(product.id);
        setIsInWishlist(false);
        if (onRemoveFromWishlist) onRemoveFromWishlist();
      } else {
        await addItem(product);
        setIsInWishlist(true);
        if (onAddToWishlist) onAddToWishlist();
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyClick = () => {
    if (product.affiliate_link) {
      // Add tracking params if available
      const link = product.tracking_params 
        ? `${product.affiliate_link}${product.tracking_params}`
        : product.affiliate_link;
      window.open(link, '_blank', 'noopener,noreferrer');
      
      // Track this click event (could be implemented with analytics)
      console.log('Amazon affiliate link clicked:', product.title);
    }
  };

  // Function to format price with currency symbol
  const formatPrice = (price?: number) => {
    if (price === undefined) return '';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  // Check if there's a sale price
  const onSale = product.sale_price !== undefined && 
                 product.price !== undefined && 
                 product.sale_price < product.price;

  return (
    <Card className="overflow-hidden h-full flex flex-col transition-all hover:shadow-md">
      <div className="relative pt-4 px-4">
        {product.is_bestseller && (
          <Badge className="absolute top-2 right-2 bg-yellow-500">Bestseller</Badge>
        )}
        {onSale && (
          <Badge className="absolute top-2 left-2 bg-red-500">Sale</Badge>
        )}
        {product.product_type === 'suggested' && (
          <Badge className="absolute top-10 left-2 bg-purple-500">User Suggested</Badge>
        )}
        <div className="h-48 flex items-center justify-center overflow-hidden rounded-md bg-slate-50">
          {product.image_url ? (
            <img 
              src={product.image_url} 
              alt={product.title}
              className="object-contain h-full w-full"
            />
          ) : (
            <div className="flex items-center justify-center h-full w-full bg-slate-100 text-slate-400">
              No Image
            </div>
          )}
        </div>
      </div>
      
      <CardContent className="pt-4 flex-grow">
        <h3 className="font-medium text-lg mb-1 line-clamp-2">{product.title}</h3>
        <div className="mb-2">
          {onSale ? (
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-red-600">
                {formatPrice(product.sale_price)}
              </span>
              <span className="text-sm text-gray-500 line-through">
                {formatPrice(product.price)}
              </span>
            </div>
          ) : (
            product.price !== undefined && (
              <p className="text-lg font-semibold text-primary">
                {formatPrice(product.price)}
              </p>
            )
          )}
        </div>
        {product.description && (
          <p className="text-sm text-slate-600 line-clamp-3">{product.description}</p>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 pb-4 px-4 flex justify-between gap-2">
        {product.affiliate_link ? (
          <Button 
            className="flex-grow bg-[#FF9900] hover:bg-[#E68A00] text-white"
            onClick={() => {
              if (handleBuyClick) handleBuyClick(); 
              else window.open(product.affiliate_link, '_blank');
            }}
          >
            <ExternalLink className="h-4 w-4 mr-2" />
            View on Amazon
          </Button>
        ) : (
          <Button 
            className="flex-grow"
            variant="secondary"
            disabled
          >
            No Link Available
          </Button>
        )}
        
        <Button
          variant="outline"
          size="icon"
          disabled={isLoading || !isAuthenticated}
          onClick={handleWishlistToggle}
          className={cn(
            "transition-colors",
            isInWishlist && "bg-pink-50 border-pink-200 text-pink-500 hover:bg-pink-100"
          )}
        >
          <Heart 
            className={cn(
              "h-5 w-5",
              isInWishlist && "fill-pink-500 text-pink-500"
            )} 
          />
        </Button>
      </CardFooter>
    </Card>
  );
};
