
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  PlusCircle, 
  MoreHorizontal, 
  ArrowUpDown,
  Tag,
  Star,
  Sparkles,
  DollarSign,
  Globe
} from "lucide-react";
import { AffiliateProduct } from '@/types/affiliate';

// Mock data for products
const productsData: AffiliateProduct[] = [
  {
    id: "p1",
    name: "Professional OBD2 Scanner",
    description: "Advanced diagnostic scanner for all vehicle types",
    imageUrl: "https://via.placeholder.com/150",
    retailPrice: 149.99,
    affiliateUrl: "https://example.com/product/123",
    category: "Diagnostics",
    tier: "premium",
    rating: 4.8,
    reviewCount: 156,
    manufacturer: "AutoTech",
    model: "AT-5000",
    discount: 15,
    isFeatured: true,
    bestSeller: true,
    freeShipping: true,
    source: "amazon"
  },
  {
    id: "p2",
    name: "Brake Pad Set - Front",
    description: "Ceramic brake pads for improved stopping power",
    imageUrl: "https://via.placeholder.com/150",
    retailPrice: 49.99,
    affiliateUrl: "https://example.com/product/124",
    category: "Brakes",
    tier: "midgrade",
    rating: 4.5,
    reviewCount: 89,
    manufacturer: "StopTech",
    model: "CT-550",
    isFeatured: false,
    bestSeller: false,
    freeShipping: false,
    source: "other"
  },
  {
    id: "p3",
    name: "Engine Oil Filter Wrench Set",
    description: "Universal oil filter wrench set for most vehicle types",
    imageUrl: "https://via.placeholder.com/150",
    retailPrice: 29.99,
    affiliateUrl: "https://example.com/product/125",
    category: "Engine",
    tier: "economy",
    rating: 4.2,
    reviewCount: 45,
    manufacturer: "ToolMaster",
    model: "TM-123",
    isFeatured: false,
    bestSeller: true,
    freeShipping: true,
    source: "amazon"
  },
  {
    id: "p4",
    name: "Multimeter Digital Professional",
    description: "Automotive electrical system testing multimeter",
    imageUrl: "https://via.placeholder.com/150",
    retailPrice: 89.99,
    affiliateUrl: "https://example.com/product/126",
    category: "Electrical",
    tier: "premium",
    rating: 4.9,
    reviewCount: 102,
    manufacturer: "VoltPro",
    model: "VP-2000",
    discount: 10,
    isFeatured: true,
    bestSeller: false,
    freeShipping: false,
    source: "other"
  }
];

export default function ProductsManagement() {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortColumn, setSortColumn] = useState<keyof AffiliateProduct | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);

  // Get unique categories for filter
  const categories = Array.from(new Set(productsData.map(product => product.category)));

  // Filter products based on search and filters
  const filteredProducts = productsData.filter((product) => {
    const matchesSearch = 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.manufacturer.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = !filterCategory || product.category === filterCategory;
    const matchesStatus = !filterStatus || 
      (filterStatus === 'featured' && product.isFeatured) || 
      (filterStatus === 'bestseller' && product.bestSeller);
    
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Sort products based on current sort state
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortColumn) {
      const valueA = a[sortColumn];
      const valueB = b[sortColumn];

      if (typeof valueA === "string" && typeof valueB === "string") {
        return sortDirection === "asc"
          ? valueA.localeCompare(valueB)
          : valueB.localeCompare(valueA);
      } else if (typeof valueA === "number" && typeof valueB === "number") {
        return sortDirection === "asc" ? valueA - valueB : valueB - valueA;
      }
    }
    return 0;
  });

  // Handle sort column changes
  const handleSort = (column: keyof AffiliateProduct) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Manage Affiliate Products</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products by name or manufacturer..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              <div className="flex gap-2">
                <select 
                  className="border rounded px-2 py-2 text-sm"
                  value={filterCategory || ''}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  className="border rounded px-2 py-2 text-sm"
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                >
                  <option value="">All Status</option>
                  <option value="featured">Featured</option>
                  <option value="bestseller">Best Seller</option>
                </select>
                
                <Button variant="default">
                  <PlusCircle className="mr-2 h-4 w-4" /> Add Product
                </Button>
              </div>
            </div>
            
            <div className="overflow-auto rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("name")}
                      >
                        Name
                        {sortColumn === "name" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("category")}
                      >
                        Category
                        {sortColumn === "category" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("manufacturer")}
                      >
                        Manufacturer
                        {sortColumn === "manufacturer" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("retailPrice")}
                      >
                        Price
                        {sortColumn === "retailPrice" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>
                      <Button
                        variant="ghost"
                        onClick={() => handleSort("rating")}
                      >
                        Rating
                        {sortColumn === "rating" && (
                          <ArrowUpDown className="ml-2 h-4 w-4" />
                        )}
                      </Button>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">{product.category}</Badge>
                      </TableCell>
                      <TableCell>{product.manufacturer}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <DollarSign className="h-4 w-4 text-green-600 mr-1" />
                          {product.retailPrice.toFixed(2)}
                          {product.discount && (
                            <Badge variant="outline" className="ml-2 bg-red-100 text-red-800">
                              {product.discount}% OFF
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Star className="h-4 w-4 text-yellow-500 fill-yellow-500 mr-1" />
                          {product.rating} 
                          <span className="text-gray-500 text-xs ml-1">({product.reviewCount})</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-wrap gap-1">
                          {product.isFeatured && (
                            <Badge className="bg-yellow-100 text-yellow-800 border border-yellow-300">
                              <Sparkles className="h-3 w-3 mr-1" /> Featured
                            </Badge>
                          )}
                          {product.bestSeller && (
                            <Badge className="bg-green-100 text-green-800 border border-green-300">
                              Best Seller
                            </Badge>
                          )}
                          {product.freeShipping && (
                            <Badge className="bg-blue-100 text-blue-800 border border-blue-300">
                              Free Shipping
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">Open menu</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>
                              <Globe className="h-4 w-4 mr-2" /> View Affiliate Link
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-red-600">Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                  {sortedProducts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="h-24 text-center">
                        No products found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
