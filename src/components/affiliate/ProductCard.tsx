
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AffiliateProduct } from "@/types/affiliate";
import ProductTierBadge from "./ProductTierBadge";
import { addAffiliateTracking } from "@/utils/amazonUtils";
import { ExternalLink, Save } from "lucide-react";
import { useCallback } from "react";
import { useProductAnalytics, ProductInteractionType } from "@/components/developer/shopping/analytics/AnalyticsTracker";

interface ProductCardProps {
  product: AffiliateProduct;
  isSaved: boolean;
  onSaveToggle: () => void;
}

const ProductCard = ({ product, isSaved, onSaveToggle }: ProductCardProps) => {
  const { trackInteraction } = useProductAnalytics();

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    const trackedUrl = addAffiliateTracking(product.affiliateUrl);
    e.currentTarget.href = trackedUrl;
    
    // Track product click
    trackInteraction({
      productId: product.id,
      productName: product.name,
      interactionType: ProductInteractionType.CLICK,
      category: product.category,
      additionalData: {
        tier: product.tier,
        manufacturer: product.manufacturer,
        price: product.retailPrice
      }
    });
  };
  
  const handleSaveClick = useCallback(() => {
    // Track save/unsave interaction
    trackInteraction({
      productId: product.id,
      productName: product.name,
      interactionType: isSaved ? ProductInteractionType.UNSAVE : ProductInteractionType.SAVE,
      category: product.category
    });
    
    onSaveToggle();
  }, [product, isSaved, onSaveToggle, trackInteraction]);

  return (
    <Card className="h-full flex flex-col overflow-hidden transition-all hover:shadow-md">
      <div className="relative">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="w-full aspect-square object-cover"
        />
        <div className="absolute top-2 right-2">
          <ProductTierBadge tier={product.tier} />
        </div>
        <button
          onClick={(e) => {
            e.preventDefault();
            handleSaveClick();
          }}
          className={`absolute top-2 left-2 p-1.5 rounded-full ${
            isSaved 
              ? "bg-blue-500 text-white" 
              : "bg-white/80 text-slate-700 hover:bg-white"
          } transition-colors`}
        >
          <Save className="h-5 w-5" />
        </button>
      </div>
      
      <CardHeader className="pb-2">
        <h3 className="font-semibold text-lg line-clamp-2">{product.name}</h3>
      </CardHeader>
      
      <CardContent className="pb-2 flex-grow">
        <p className="text-slate-600 dark:text-slate-300 text-sm line-clamp-3">
          {product.description}
        </p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center pt-2">
        <div className="font-semibold">${product.retailPrice.toFixed(2)}</div>
        <Button 
          size="sm"
          className="flex items-center gap-1"
          asChild
        >
          <a 
            href={product.affiliateUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={handleLinkClick}
          >
            <span>View</span>
            <ExternalLink className="h-4 w-4" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ProductCard;
