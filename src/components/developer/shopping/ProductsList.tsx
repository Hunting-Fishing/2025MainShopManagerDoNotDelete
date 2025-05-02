
import React from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { PenLine, Trash2, Eye, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { AffiliateTool } from "@/types/affiliate";
import { Skeleton } from "@/components/ui/skeleton";

interface ProductsListProps {
  products: AffiliateTool[];
  loading: boolean;
  onEdit: (product: AffiliateTool) => void;
  onDelete: (product: AffiliateTool) => void;
}

const ProductsList: React.FC<ProductsListProps> = ({ 
  products, 
  loading, 
  onEdit,
  onDelete
}) => {
  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex items-center space-x-4">
            <Skeleton className="h-12 w-12 rounded-md" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-[250px]" />
              <Skeleton className="h-4 w-[200px]" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!products?.length) {
    return (
      <div className="text-center py-8 border rounded-md bg-slate-50 dark:bg-slate-900">
        <p className="text-slate-500 dark:text-slate-400">No products found</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80px]">Image</TableHead>
            <TableHead>Product</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Category</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {products.map((product) => (
            <TableRow key={product.id}>
              <TableCell>
                {product.imageUrl ? (
                  <div className="relative h-12 w-12 rounded-md overflow-hidden border">
                    <img 
                      src={product.imageUrl} 
                      alt={product.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="h-12 w-12 bg-slate-100 dark:bg-slate-800 rounded-md flex items-center justify-center">
                    <Eye className="h-6 w-6 text-slate-400" />
                  </div>
                )}
              </TableCell>
              <TableCell>
                <div>
                  <p className="font-medium">{product.name}</p>
                  <p className="text-xs text-slate-500">{product.manufacturer}</p>
                </div>
              </TableCell>
              <TableCell>
                {product.salePrice ? (
                  <div>
                    <span className="font-medium">${product.salePrice}</span>
                    <span className="ml-1 text-sm text-slate-500 line-through">${product.price}</span>
                  </div>
                ) : (
                  <span>${product.price}</span>
                )}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="bg-slate-100">
                  {product.category}
                </Badge>
              </TableCell>
              <TableCell>
                <div className="flex gap-1">
                  {product.featured && (
                    <Badge className="bg-blue-100 text-blue-800 border-blue-300">
                      Featured
                    </Badge>
                  )}
                  {product.bestSeller && (
                    <Badge className="bg-amber-100 text-amber-800 border-amber-300">
                      Best Seller
                    </Badge>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => window.open(product.affiliateLink, '_blank')}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    onClick={() => onEdit(product)}
                  >
                    <PenLine className="h-4 w-4" />
                  </Button>
                  <Button 
                    size="icon" 
                    variant="ghost"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => onDelete(product)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ProductsList;
