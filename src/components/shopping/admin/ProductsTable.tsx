
import React, { useState, useEffect } from 'react';
import { getProducts, deleteProduct, approveProductSuggestion } from '@/services/shopping/productService';
import { Product, ProductFilterOptions } from '@/types/shopping';
import { useCategories } from '@/hooks/useCategories';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Search, Edit, Trash2, Check, X, Star, ShoppingBag } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from '@/hooks/use-toast';

interface ProductsTableProps {
  onEdit: (productId: string) => void;
  onRefresh: () => void;
}

export const ProductsTable: React.FC<ProductsTableProps> = ({
  onEdit,
  onRefresh
}) => {
  const { getCategoryById } = useCategories();
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  
  const fetchProducts = async () => {
    setIsLoading(true);
    try {
      const options: ProductFilterOptions = {};
      if (searchTerm) {
        options.search = searchTerm;
      }
      
      const allProducts = await getProducts(options);
      setProducts(allProducts);
    } catch (error) {
      toast({
        title: "Error loading products",
        description: "Could not fetch products",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchProducts();
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      setProducts(products.filter(product => product.id !== id));
      toast({
        title: "Product deleted",
        description: "Product has been deleted successfully",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete product",
        variant: "destructive",
      });
    } finally {
      setConfirmDelete(null);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      await approveProductSuggestion(id);
      setProducts(
        products.map(product => 
          product.id === id ? { ...product, is_approved: true } : product
        )
      );
      toast({
        title: "Suggestion approved",
        description: "The product suggestion has been approved",
      });
      onRefresh();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to approve suggestion",
        variant: "destructive",
      });
    }
  };

  return (
    <>
      <div className="mb-6">
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="h-4 w-4 mr-2" />
            Search
          </Button>
        </form>
      </div>

      {isLoading ? (
        <div className="py-8 flex justify-center">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
        </div>
      ) : products.length === 0 ? (
        <div className="py-8 text-center">
          <p className="text-muted-foreground">No products found</p>
        </div>
      ) : (
        <div className="border rounded-md overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const category = getCategoryById(product.category_id);
                return (
                  <TableRow key={product.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 bg-slate-100 rounded overflow-hidden flex-shrink-0">
                          {product.image_url ? (
                            <img
                              src={product.image_url}
                              alt={product.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="h-full w-full flex items-center justify-center text-slate-400">
                              <ShoppingBag className="h-5 w-5" />
                            </div>
                          )}
                        </div>
                        <div>
                          <span className="font-medium">{product.title}</span>
                          {product.product_type === 'suggested' && (
                            <span className="block text-xs text-slate-500">User Suggestion</span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{category?.name || 'Unknown'}</TableCell>
                    <TableCell>{product.price ? `$${product.price.toFixed(2)}` : 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {product.is_approved ? (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Approved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200">
                            Pending
                          </Badge>
                        )}
                        
                        {product.is_bestseller && (
                          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                            Bestseller
                          </Badge>
                        )}
                        
                        {product.is_featured && (
                          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                            Featured
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => onEdit(product.id)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => setConfirmDelete(product.id)}
                          className="text-red-500 border-red-200 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                        
                        {product.product_type === 'suggested' && !product.is_approved && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleApprove(product.id)}
                            className="text-green-500 border-green-200 hover:bg-green-50"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <AlertDialog open={!!confirmDelete} onOpenChange={() => setConfirmDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this product? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => confirmDelete && handleDelete(confirmDelete)}
              className="bg-red-500 hover:bg-red-600"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
