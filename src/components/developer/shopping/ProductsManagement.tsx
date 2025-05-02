
import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pencil,
  Trash,
  Upload,
  Download,
  Plus,
  Search,
  Filter,
  Tag,
} from "lucide-react";
import { AffiliateProduct } from '@/types/affiliate';

interface ProductsManagementProps {}

const ProductsManagement: React.FC<ProductsManagementProps> = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [filterTier, setFilterTier] = useState<string>("all");
  const [filterFeatured, setFilterFeatured] = useState<string>("all");
  
  // Use React Query to fetch products data
  const { data: products = [], isLoading, error } = useQuery({
    queryKey: ['adminProducts'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      // For now, we're simulating a delay and returning an empty array
      await new Promise(resolve => setTimeout(resolve, 1000));
      return [];
    },
  });
  
  // Use React Query to fetch categories for filtering
  const { data: categories = [] } = useQuery({
    queryKey: ['productCategories'],
    queryFn: async () => {
      // In a real implementation, this would fetch from your database
      await new Promise(resolve => setTimeout(resolve, 500));
      return [
        { id: 'automotive', name: 'Automotive' },
        { id: 'heavy-duty', name: 'Heavy Duty' },
        { id: 'equipment', name: 'Equipment' },
        { id: 'marine', name: 'Marine' },
        { id: 'atv-utv', name: 'ATV/UTV' },
        { id: 'motorcycle', name: 'Motorcycle' }
      ];
    },
  });
  
  // Filter and search products
  const filteredProducts = React.useMemo(() => {
    return products.filter((product: AffiliateProduct) => {
      const matchesSearch = searchTerm === "" || 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesCategory = filterCategory === "all" || product.category === filterCategory;
      const matchesTier = filterTier === "all" || product.tier === filterTier;
      const matchesFeatured = filterFeatured === "all" || 
        (filterFeatured === "featured" && product.isFeatured) ||
        (filterFeatured === "not-featured" && !product.isFeatured);
        
      return matchesSearch && matchesCategory && matchesTier && matchesFeatured;
    });
  }, [products, searchTerm, filterCategory, filterTier, filterFeatured]);
  
  if (error) {
    return (
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader>
          <CardTitle>Products Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-10">
            <p className="text-red-500">Error loading products. Please try again later.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  const handleAddProduct = () => {
    // Logic for adding a new product
    console.log("Add product clicked");
  };
  
  const handleEditProduct = (id: string) => {
    console.log(`Edit product ${id}`);
  };
  
  const handleDeleteProduct = (id: string) => {
    console.log(`Delete product ${id}`);
  };
  
  const handleImportProducts = () => {
    console.log("Import products clicked");
  };
  
  const handleExportProducts = () => {
    console.log("Export products clicked");
  };
  
  return (
    <div className="space-y-6">
      <Card className="bg-white shadow-md rounded-lg mb-6">
        <CardHeader className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-2">
          <CardTitle>Product Management</CardTitle>
          <div className="flex flex-wrap gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleImportProducts}
            >
              <Upload size={16} />
              <span className="hidden sm:inline">Import</span>
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleExportProducts}
            >
              <Download size={16} />
              <span className="hidden sm:inline">Export</span>
            </Button>
            <Button 
              className="flex items-center gap-1 bg-blue-600 hover:bg-blue-700"
              onClick={handleAddProduct}
            >
              <Plus size={16} />
              <span>Add Product</span>
            </Button>
          </div>
        </CardHeader>
        
        <CardContent>
          {/* Search and filters */}
          <div className="flex flex-wrap gap-2 bg-white p-3 shadow-sm border border-gray-200 rounded-xl mb-4">
            <div className="relative flex-grow min-w-[200px]">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search products..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center min-w-[150px]">
                <Filter className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={filterCategory} onValueChange={setFilterCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category: any) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center min-w-[120px]">
                <Tag className="mr-2 h-4 w-4 text-muted-foreground" />
                <Select value={filterTier} onValueChange={setFilterTier}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tier" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Tiers</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="midgrade">Mid-grade</SelectItem>
                    <SelectItem value="economy">Economy</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center min-w-[150px]">
                <Select value={filterFeatured} onValueChange={setFilterFeatured}>
                  <SelectTrigger>
                    <SelectValue placeholder="Featured Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Products</SelectItem>
                    <SelectItem value="featured">Featured Only</SelectItem>
                    <SelectItem value="not-featured">Not Featured</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Products table */}
          <div className="rounded-md border overflow-hidden">
            <Table>
              <TableHeader className="bg-slate-50">
                <TableRow>
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Price</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <div className="flex flex-col items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mb-4"></div>
                        <p className="text-muted-foreground">Loading products...</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8">
                      <p className="text-muted-foreground">No products found.</p>
                      <Button 
                        variant="outline" 
                        className="mt-4"
                        onClick={handleAddProduct}
                      >
                        Add your first product
                      </Button>
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: AffiliateProduct) => (
                    <TableRow key={product.id} className="hover:bg-slate-50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-md overflow-hidden bg-slate-100 flex-shrink-0">
                            {product.imageUrl ? (
                              <img 
                                src={product.imageUrl} 
                                alt={product.name} 
                                className="h-full w-full object-cover"
                              />
                            ) : (
                              <div className="h-full w-full flex items-center justify-center text-slate-400">
                                No image
                              </div>
                            )}
                          </div>
                          <div>
                            <div className="font-medium">{product.name}</div>
                            {product.manufacturer && (
                              <div className="text-xs text-muted-foreground">{product.manufacturer}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {product.category}
                        </Badge>
                      </TableCell>
                      <TableCell>${product.retailPrice.toFixed(2)}</TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            product.tier === 'premium' ? 'bg-purple-100 text-purple-800 border-purple-300' :
                            product.tier === 'midgrade' ? 'bg-blue-100 text-blue-800 border-blue-300' :
                            'bg-green-100 text-green-800 border-green-300'
                          }
                        >
                          {product.tier.charAt(0).toUpperCase() + product.tier.slice(1)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          className={
                            product.isFeatured 
                              ? 'bg-amber-100 text-amber-800 border-amber-300' 
                              : 'bg-slate-100 text-slate-800 border-slate-300'
                          }
                        >
                          {product.isFeatured ? 'Featured' : 'Standard'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleEditProduct(product.id)}
                          >
                            <Pencil className="h-4 w-4" />
                            <span className="sr-only">Edit</span>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="text-red-500 hover:text-red-600" 
                            onClick={() => handleDeleteProduct(product.id)}
                          >
                            <Trash className="h-4 w-4" />
                            <span className="sr-only">Delete</span>
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsManagement;
