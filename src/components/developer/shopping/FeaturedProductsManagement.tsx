
import React, { useState } from 'react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Star, Search, Pencil, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { Label } from '@/components/ui/label';

// Mock data for featured products - in a real implementation, this would come from an API
const mockProducts = [
  { id: '1', name: 'Premium Socket Set', category: 'Hand Tools', isFeatured: true, priority: 1 },
  { id: '2', name: 'Professional Digital Multimeter', category: 'Electronic Tools', isFeatured: true, priority: 2 },
  { id: '3', name: 'Heavy-Duty Impact Wrench', category: 'Power Tools', isFeatured: true, priority: 3 },
  { id: '4', name: 'Automotive Diagnostic Scanner', category: 'Diagnostic Tools', isFeatured: false, priority: 0 },
  { id: '5', name: 'Mechanic Tool Set (250pc)', category: 'Hand Tools', isFeatured: false, priority: 0 },
];

const FeaturedProductsManagement: React.FC = () => {
  const [products, setProducts] = useState(mockProducts);
  const [searchTerm, setSearchTerm] = useState('');
  const { toast } = useToast();

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const toggleFeatured = (id: string) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        return { 
          ...product, 
          isFeatured: !product.isFeatured,
          priority: !product.isFeatured ? Math.max(...products.filter(p => p.isFeatured).map(p => p.priority), 0) + 1 : 0
        };
      }
      return product;
    }));

    toast({
      title: "Product updated",
      description: `Product has been ${products.find(p => p.id === id)?.isFeatured ? "removed from" : "added to"} featured products.`,
    });
  };

  const updatePriority = (id: string, newPriority: number) => {
    setProducts(products.map(product => {
      if (product.id === id) {
        return { ...product, priority: newPriority };
      }
      return product;
    }));

    toast({
      title: "Priority updated",
      description: "Product display priority has been updated.",
    });
  };

  const featuredProducts = products.filter(product => product.isFeatured)
    .sort((a, b) => a.priority - b.priority);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Featured Products</CardTitle>
          <CardDescription>
            Manage which products are showcased on the shopping homepage
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between mb-4">
            <div className="relative w-64">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input 
                placeholder="Search products..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="auto-rotate" className="text-sm">Auto-rotate featured products</Label>
              <Switch id="auto-rotate" />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">Featured</TableHead>
                  <TableHead>Product Name</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead className="w-24 text-center">Priority</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.map((product) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Checkbox 
                        checked={product.isFeatured}
                        onCheckedChange={() => toggleFeatured(product.id)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">
                      {product.name}
                      {product.isFeatured && (
                        <Star className="inline-block ml-2 h-4 w-4 text-amber-400 fill-amber-400" />
                      )}
                    </TableCell>
                    <TableCell>{product.category}</TableCell>
                    <TableCell>
                      {product.isFeatured ? (
                        <Input
                          type="number"
                          min="1"
                          className="w-16 mx-auto text-center"
                          value={product.priority}
                          onChange={(e) => updatePriority(product.id, parseInt(e.target.value) || 0)}
                        />
                      ) : (
                        <span className="text-center block text-gray-400">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Featured Products Preview</CardTitle>
          <CardDescription>Current order of featured products on the homepage</CardDescription>
        </CardHeader>
        <CardContent>
          {featuredProducts.length > 0 ? (
            <div className="space-y-2">
              {featuredProducts.map((product, index) => (
                <div key={product.id} className="flex items-center p-2 bg-gray-50 rounded-md">
                  <div className="w-8 h-8 bg-blue-100 text-blue-800 rounded-full flex items-center justify-center font-bold mr-3">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-gray-500">{product.category}</p>
                  </div>
                  <div className="ml-auto flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => toggleFeatured(product.id)}>
                      <X className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500">
              <p>No featured products selected.</p>
              <p className="text-sm">Use the table above to feature products.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FeaturedProductsManagement;
