
import React from 'react';
import { Product } from '@/types/shopping';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Star, Heart, ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '@/lib/formatters';

interface ProductGridProps {
  products: Product[];
  isLoading: boolean;
  emptyMessage?: string;
}

export function ProductGrid({ products, isLoading, emptyMessage = "No products found." }: ProductGridProps) {
  const navigate = useNavigate();
  
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {[...Array(8)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <div className="h-48 bg-slate-200 rounded-t-lg"></div>
            <CardContent className="p-4">
              <div className="h-6 bg-slate-200 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-slate-200 rounded w-1/4 mb-4"></div>
              <div className="h-4 bg-slate-200 rounded w-2/4 mb-4"></div>
              <div className="h-9 bg-slate-200 rounded w-full"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }
  
  if (products.length === 0) {
    return (
      <div className="text-center py-10">
        <p className="text-lg text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {products.map((product) => (
        <Card key={product.id} className="overflow-hidden hover:shadow-md transition-shadow">
          <div className="relative cursor-pointer" onClick={() => navigate(`/shopping/product/${product.id}`)}>
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title}
                className="w-full h-48 object-cover"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = '/placeholder.png';
                }}
              />
            ) : (
              <div className="w-full h-48 bg-slate-100 flex items-center justify-center">
                <span className="text-slate-400">No image</span>
              </div>
            )}
            
            <div className="absolute top-2 right-2 flex flex-col gap-1">
              {product.is_bestseller && (
                <Badge variant="secondary" className="bg-amber-50 text-amber-700 border-amber-200">
                  Bestseller
                </Badge>
              )}
              {product.product_type === 'suggested' && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                  Suggested
                </Badge>
              )}
              {product.is_featured && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                  Featured
                </Badge>
              )}
            </div>
          </div>
          
          <CardContent className="p-4">
            <div className="cursor-pointer" onClick={() => navigate(`/shopping/product/${product.id}`)}>
              <h3 className="font-medium line-clamp-1 hover:text-primary transition-colors">{product.title}</h3>
              
              {product.average_rating > 0 && (
                <div className="flex items-center mt-1">
                  <div className="flex space-x-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={14}
                        className={i < product.average_rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"} 
                      />
                    ))}
                  </div>
                  <span className="text-xs ml-1 text-muted-foreground">({product.review_count})</span>
                </div>
              )}
              
              <div className="mt-2">
                {product.sale_price ? (
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-green-600">{formatCurrency(product.sale_price)}</span>
                    <span className="text-sm text-muted-foreground line-through">{formatCurrency(product.price || 0)}</span>
                  </div>
                ) : (
                  <span className="font-semibold">{formatCurrency(product.price || 0)}</span>
                )}
              </div>
              
              <p className="text-muted-foreground text-sm mt-1 line-clamp-1">
                {product.description || "No description available."}
              </p>
            </div>
            
            <div className="mt-3 flex gap-2">
              <Button 
                variant="default" 
                size="sm" 
                className="flex-1"
                onClick={(e) => {
                  e.stopPropagation();
                  navigate(`/shopping/product/${product.id}`);
                }}
              >
                View Product
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
