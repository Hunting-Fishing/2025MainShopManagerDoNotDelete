
import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ProductCardWithAnalytics from './ProductCardWithAnalytics';
import { AffiliateProduct } from '@/types/affiliate';
import { Card } from '@/components/ui/card';

interface FeaturedProductsSliderProps {
  products?: AffiliateProduct[];
  isLoading?: boolean;
  title?: string;
  subtitle?: string;
}

const FeaturedProductsSlider: React.FC<FeaturedProductsSliderProps> = ({
  products = [],
  isLoading = false,
  title = "Featured Products",
  subtitle = "Our recommended tools for your needs"
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [visibleProducts, setVisibleProducts] = useState<AffiliateProduct[]>([]);
  const [itemsPerView, setItemsPerView] = useState(4);
  
  // Set items per view based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setItemsPerView(1);
      } else if (window.innerWidth < 768) {
        setItemsPerView(2);
      } else if (window.innerWidth < 1024) {
        setItemsPerView(3);
      } else {
        setItemsPerView(4);
      }
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Update visible products when index changes or products load
  useEffect(() => {
    if (products.length > 0) {
      const visibleItems = products.slice(currentIndex, currentIndex + itemsPerView);
      // If we don't have enough items, wrap around to the beginning
      if (visibleItems.length < itemsPerView && products.length > itemsPerView) {
        const remaining = itemsPerView - visibleItems.length;
        visibleItems.push(...products.slice(0, remaining));
      }
      setVisibleProducts(visibleItems);
    }
  }, [currentIndex, itemsPerView, products]);

  const handleNext = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex + itemsPerView;
      return nextIndex >= products.length ? 0 : nextIndex;
    });
  };

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => {
      const nextIndex = prevIndex - itemsPerView;
      return nextIndex < 0 ? Math.max(0, products.length - itemsPerView) : nextIndex;
    });
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
        <div className="flex justify-center items-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
          <span className="ml-2 text-amber-700">Loading featured products...</span>
        </div>
      </div>
    );
  }

  if (!products || products.length === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">{title}</h2>
        <div className="text-center py-8">
          <p className="text-amber-700">No featured products available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-amber-50 to-amber-100 border-l-4 border-amber-500 rounded-lg p-6 mb-8">
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 className="text-2xl font-semibold">{title}</h2>
          <p className="text-slate-600">{subtitle}</p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handlePrev} 
            disabled={products.length <= itemsPerView}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <Button 
            variant="outline" 
            size="icon" 
            onClick={handleNext}
            disabled={products.length <= itemsPerView}
            className="rounded-full"
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      
      <div className="relative overflow-hidden">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {visibleProducts.map((product, index) => (
            <ProductCardWithAnalytics key={`${product.id}-${index}`} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeaturedProductsSlider;
