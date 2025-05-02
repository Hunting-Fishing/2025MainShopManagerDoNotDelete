
import React, { useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ExternalLink, Edit, Search } from "lucide-react";
import { AffiliateTool, AffiliateProduct } from "@/types/affiliate";
import ProductDetailEditor from './ProductDetailEditor';
import { toast } from "@/hooks/use-toast";

interface ProductsListProps {
  products: (AffiliateTool | AffiliateProduct)[];
  categoryName: string;
  onProductUpdated: (updatedProduct: AffiliateTool | AffiliateProduct) => Promise<void>;
}

const ProductsList = ({ products, categoryName, onProductUpdated }: ProductsListProps) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<AffiliateTool | AffiliateProduct | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  const filteredProducts = products.filter(product => {
    const searchLower = searchQuery.toLowerCase();
    return (
      (product as any).name.toLowerCase().includes(searchLower) ||
      (product as any).manufacturer.toLowerCase().includes(searchLower) ||
      (product as any).description?.toLowerCase().includes(searchLower) ||
      (product as any).id.toLowerCase().includes(searchLower)
    );
  });

  const handleEditProduct = (product: AffiliateTool | AffiliateProduct) => {
    setSelectedProduct(product);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = async (updatedProduct: AffiliateTool | AffiliateProduct) => {
    try {
      await onProductUpdated(updatedProduct);
      // Return true but don't use it as a return value to fix the type error
      return true;
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Error",
        description: "Failed to update the product. Please try again.",
        variant: "destructive"
      });
      // Return false but don't use it as a return value to fix the type error
      return false;
    }
  };

  const getPrice = (product: AffiliateTool | AffiliateProduct) => {
    if ((product as any).price !== undefined) {
      return (product as any).price;
    } else if ((product as any).retailPrice !== undefined) {
      return (product as any).retailPrice;
    }
    return 0;
  };

  const getSalePrice = (product: AffiliateTool | AffiliateProduct) => {
    return (product as any).salePrice;
  };

  const checkUrl = (url: string) => {
    try {
      window.open(url, '_blank');
    } catch (error) {
      toast({
        title: "Invalid URL",
        description: "The product link is not valid",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Products in {categoryName}</h3>
        <div className="relative max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[30%]">Name</TableHead>
              <TableHead>Manufacturer</TableHead>
              <TableHead>Price</TableHead>
              <TableHead className="text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredProducts.length > 0 ? (
              filteredProducts.map((product) => (
                <TableRow key={product.id}>
                  <TableCell className="font-medium">{(product as any).name}</TableCell>
                  <TableCell>{(product as any).manufacturer}</TableCell>
                  <TableCell>
                    {getSalePrice(product) ? (
                      <div>
                        <span className="line-through text-muted-foreground">${getPrice(product).toFixed(2)}</span>
                        <span className="ml-2 text-green-600">${getSalePrice(product).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span>${getPrice(product).toFixed(2)}</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => handleEditProduct(product)}>
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => checkUrl((product as any).affiliateLink || (product as any).affiliateUrl)}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={4} className="h-24 text-center">
                  No products found in this category.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {selectedProduct && (
        <ProductDetailEditor
          product={selectedProduct}
          isOpen={isEditorOpen}
          onClose={() => setIsEditorOpen(false)}
          onSave={handleSaveProduct}
        />
      )}
    </div>
  );
};

export default ProductsList;
