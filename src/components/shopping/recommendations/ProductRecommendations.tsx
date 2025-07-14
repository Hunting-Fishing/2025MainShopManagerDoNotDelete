import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, TrendingUp, Users, ArrowRight } from 'lucide-react';
import ProductCard from '../ProductCard';
import { AffiliateProduct } from '@/types/affiliate';
import { useProductsManager } from '@/hooks/affiliate/useProductsManager';

interface ProductRecommendationsProps {
  productId?: string;
  category?: string;
  userId?: string;
  type?: 'similar' | 'frequently-bought' | 'trending' | 'personalized';
  title?: string;
  limit?: number;
}

const ProductRecommendations: React.FC<ProductRecommendationsProps> = ({
  productId,
  category,
  userId,
  type = 'similar',
  title,
  limit = 4
}) => {
  const [recommendations, setRecommendations] = useState<AffiliateProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const { products } = useProductsManager();

  useEffect(() => {
    generateRecommendations();
  }, [productId, category, type, products]);

  const generateRecommendations = async () => {
    try {
      setLoading(true);
      
      // Transform products to AffiliateProduct format
      const transformedProducts = products.map(product => ({
        id: product.id,
        name: product.name,
        description: product.description || '',
        imageUrl: product.imageUrl || '',
        retailPrice: product.price || 0,
        affiliateUrl: product.affiliateLink || '#',
        category: product.category,
        tier: 'midgrade' as const,
        rating: product.rating || 4.0,
        reviewCount: product.reviewCount || 0,
        manufacturer: product.manufacturer,
        model: product.name,
        discount: product.salePrice ? Math.round(((product.price || 0) - product.salePrice) / (product.price || 1) * 100) : undefined,
        isFeatured: product.featured || false,
        bestSeller: product.bestSeller || false,
        freeShipping: false,
        source: 'other' as const
      }));

      let filtered: AffiliateProduct[] = [];

      switch (type) {
        case 'similar':
          // Find products in the same category, excluding current product
          filtered = transformedProducts.filter(p => 
            p.category === category && p.id !== productId
          );
          break;
          
        case 'frequently-bought':
          // Simulate frequently bought together (in reality, this would be based on analytics)
          filtered = transformedProducts.filter(p => 
            (p.category === category || Math.random() > 0.7) && p.id !== productId
          );
          break;
          
        case 'trending':
          // Show best selling or featured products
          filtered = transformedProducts.filter(p => 
            p.bestSeller || p.isFeatured
          );
          break;
          
        case 'personalized':
          // Simulate personalized recommendations (in reality, this would use ML)
          filtered = transformedProducts.filter(p => 
            p.rating >= 4.0 && p.id !== productId
          );
          break;
      }

      // Sort by rating and limit results
      const sorted = filtered
        .sort((a, b) => (b.rating || 0) - (a.rating || 0))
        .slice(0, limit);

      setRecommendations(sorted);
    } catch (error) {
      console.error('Error generating recommendations:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'similar': return Sparkles;
      case 'frequently-bought': return Users;
      case 'trending': return TrendingUp;
      case 'personalized': return Sparkles;
      default: return Sparkles;
    }
  };

  const getDefaultTitle = () => {
    switch (type) {
      case 'similar': return 'Similar Products';
      case 'frequently-bought': return 'Frequently Bought Together';
      case 'trending': return 'Trending Now';
      case 'personalized': return 'Recommended for You';
      default: return 'You Might Also Like';
    }
  };

  const Icon = getIcon();
  const displayTitle = title || getDefaultTitle();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5" />
            {displayTitle}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: limit }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-muted h-48 rounded-lg mb-3" />
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded w-3/4" />
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-5 bg-muted rounded w-1/4" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (recommendations.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Icon className="h-5 w-5 text-primary" />
            {displayTitle}
            {type === 'trending' && (
              <Badge variant="secondary" className="ml-2">
                Hot
              </Badge>
            )}
          </CardTitle>
          <Button variant="ghost" size="sm">
            View All
            <ArrowRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {recommendations.map(product => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
        
        {type === 'frequently-bought' && (
          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">Bundle Deal</p>
                <p className="text-sm text-muted-foreground">
                  Buy these together and save 15%
                </p>
              </div>
              <Button size="sm">
                Add Bundle to Cart
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ProductRecommendations;