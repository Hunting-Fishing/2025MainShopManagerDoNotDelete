
import React, { useState } from 'react';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  Pencil, 
  MoreHorizontal, 
  Star, 
  StarOff, 
  Trash2, 
  Search, 
  ShoppingCart 
} from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { AffiliateTool, AffiliateProduct } from '@/types/affiliate';

// Mock data for products
const mockProducts = [
  { 
    id: '1', 
    name: 'Premium Socket Set', 
    category: 'Hand Tools', 
    price: 129.99, 
    status: 'In Stock', 
    isFeatured: true,
    createdAt: '2025-04-01T10:30:00Z'
  },
  { 
    id: '2', 
    name: 'Professional Digital Multimeter', 
    category: 'Electronic Tools', 
    price: 89.99, 
    status: 'In Stock', 
    isFeatured: true,
    createdAt: '2025-04-02T09:15:00Z'
  },
  { 
    id: '3', 
    name: 'Heavy-Duty Impact Wrench', 
    category: 'Power Tools', 
    price: 199.99, 
    status: 'Low Stock', 
    isFeatured: true,
    createdAt: '2025-04-03T14:45:00Z'
  },
  { 
    id: '4', 
    name: 'Automotive Diagnostic Scanner', 
    category: 'Diagnostic Tools', 
    price: 249.99, 
    status: 'In Stock', 
    isFeatured: false,
    createdAt: '2025-04-04T16:20:00Z'
  },
  { 
    id: '5', 
    name: 'Mechanic Tool Set (250pc)', 
    category: 'Hand Tools', 
    price: 299.99, 
    status: 'Out of Stock', 
    isFeatured: false,
    createdAt: '2025-04-05T11:10:00Z'
  },
];

export interface ProductsListProps {
  sortBy?: string;
  products?: AffiliateTool[];
  categoryName?: string;
  onProductUpdated?: (updatedProduct: AffiliateProduct | AffiliateTool) => Promise<void>;
}

const ProductsList: React.FC<ProductsListProps> = ({ 
  sortBy = 'name', 
  products = mockProducts, 
  categoryName, 
  onProductUpdated 
}) => {
  const [productList, setProductList] = useState(products);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const { toast } = useToast();

  // Get unique categories for the filter
  const categories = Array.from(new Set(productList.map(product => product.category)));

  // Apply filters
  const filteredProducts = productList
    .filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (product.category && product.category.toLowerCase().includes(searchTerm.toLowerCase()))
    )
    .filter(product => categoryFilter ? product.category === categoryFilter : true);

  // Apply sorting
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === 'created_at') {
      return new Date((b as any).createdAt).getTime() - new Date((a as any).createdAt).getTime();
    }
    if (sortBy === 'price') {
      return (a as any).price - (b as any).price;
    }
    // Default sort by name
    return a.name.localeCompare(b.name);
  });

  const toggleFeatured = (id: string) => {
    const updatedProducts = productList.map(product => {
      if (product.id === id) {
        const newIsFeatured = !(product as any).isFeatured;
        const updatedProduct = { ...product, isFeatured: newIsFeatured };
        
        toast({
          title: newIsFeatured ? "Product Featured" : "Product Unfeatured",
          description: `${product.name} has been ${newIsFeatured ? "added to" : "removed from"} featured products.`,
        });
        
        if (onProductUpdated) {
          onProductUpdated(updatedProduct);
        }
        
        return updatedProduct;
      }
      return product;
    });
    setProductList(updatedProducts);
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'In Stock':
        return <Badge className="bg-green-100 text-green-800 border border-green-300">In Stock</Badge>;
      case 'Low Stock':
        return <Badge className="bg-amber-100 text-amber-800 border border-amber-300">Low Stock</Badge>;
      case 'Out of Stock':
        return <Badge className="bg-red-100 text-red-800 border border-red-300">Out of Stock</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search products..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="All Categories" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="">All Categories</SelectItem>
            {categories.map((category) => (
              <SelectItem key={category} value={category}>{category}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {categoryName && (
        <div className="mb-4">
          <h3 className="text-lg font-medium">Products in {categoryName}</h3>
        </div>
      )}

      {/* Products Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead className="text-right">Price</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell className="font-medium flex items-center gap-2">
                  {product.name}
                  {(product as any).isFeatured && (
                    <Star className="inline-block h-4 w-4 text-amber-400 fill-amber-400" />
                  )}
                </TableCell>
                <TableCell>{product.category}</TableCell>
                <TableCell className="text-right">${(product as any).price?.toFixed(2) || '-'}</TableCell>
                <TableCell>{(product as any).status ? getStatusBadge((product as any).status) : '-'}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <ShoppingCart className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleFeatured(product.id)}>
                          {(product as any).isFeatured ? (
                            <>
                              <StarOff className="mr-2 h-4 w-4" />
                              Remove from Featured
                            </>
                          ) : (
                            <>
                              <Star className="mr-2 h-4 w-4" />
                              Add to Featured
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete Product
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {sortedProducts.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                  No products found. Try adjusting your filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-between items-center pt-2">
        <div className="text-sm text-slate-500">
          Showing {sortedProducts.length} of {productList.length} products
        </div>
        <div className="flex gap-2">
          <Button variant="outline">Previous</Button>
          <Button variant="outline">Next</Button>
        </div>
      </div>
    </div>
  );
};

export default ProductsList;
