
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { ShoppingCart, Star } from "lucide-react";

interface ProductCardProps {
  title: string;
  price: number;
  image?: string;
  rating?: number;
  status?: string;
  seller?: {
    name: string;
    avatar?: string;
  };
}

export function ProductCard({ title, price, image, rating, status, seller }: ProductCardProps) {
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

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase();
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-lg">
      <CardHeader className="p-0">
        <div className="aspect-square relative bg-gray-100">
          {image ? (
            <img src={image} alt={title} className="object-cover w-full h-full" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400">
              No image
            </div>
          )}
          {status && (
            <Badge 
              className={`absolute top-2 right-2 ${getStatusColor(status)}`}
            >
              {status}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-4">
        <h3 className="font-semibold text-lg mb-2">{title}</h3>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-bold">${price.toFixed(2)}</span>
          {rating && (
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="fill-current h-4 w-4" />
              <span className="text-sm">{rating}</span>
            </div>
          )}
        </div>
        {seller && (
          <div className="flex items-center gap-2">
            <Avatar className="h-6 w-6">
              <AvatarImage src={seller.avatar} />
              <AvatarFallback className="bg-purple-600 text-white text-xs">
                {getInitials(seller.name)}
              </AvatarFallback>
            </Avatar>
            <span className="text-sm text-gray-600">{seller.name}</span>
          </div>
        )}
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full rounded-full" variant="default">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
