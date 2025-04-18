
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Product } from "@/types/shopping";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ShoppingCart, Star } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductDetailsModalProps {
  product: Product | null;
  isOpen: boolean;
  onClose: () => void;
}

export function ProductDetailsModal({ product, isOpen, onClose }: ProductDetailsModalProps) {
  if (!product) return null;

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'in stock':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'low stock':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'out of stock':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product.title}</DialogTitle>
          <DialogDescription className="text-gray-500">
            {product.description}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 mt-4">
          <div className="aspect-square relative bg-gray-100 rounded-lg overflow-hidden">
            {product.image_url ? (
              <img 
                src={product.image_url} 
                alt={product.title} 
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-400">
                No image available
              </div>
            )}
          </div>

          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={getStatusColor(product.is_available ? 'in stock' : 'out of stock')}>
                  {product.is_available ? 'In Stock' : 'Out of Stock'}
                </Badge>
                {product.average_rating && (
                  <div className="flex items-center gap-1 text-amber-500">
                    <Star className="fill-current h-4 w-4" />
                    <span className="text-sm">{product.average_rating}</span>
                  </div>
                )}
              </div>
              <span className="text-2xl font-bold">${product.price?.toFixed(2) || '0.00'}</span>
            </div>

            <Button className="w-full">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Add to Cart
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
