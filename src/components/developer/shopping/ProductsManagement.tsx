
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Plus, Store } from 'lucide-react';
import ProductsList from './ProductsList';
import FeaturedProductsManagement from './FeaturedProductsManagement';

/**
 * Products Management component provides a comprehensive interface to manage
 * all product-related entities including categories, manufacturers, and featured products.
 */
const ProductsManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>("products");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Products Management</h1>
          <p className="text-slate-500">Manage your product catalog and featured items</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New Product
        </Button>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">All Products</TabsTrigger>
          <TabsTrigger value="featured">Featured Products</TabsTrigger>
          <TabsTrigger value="recent">Recently Added</TabsTrigger>
        </TabsList>
        
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Product Catalog</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsList />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="featured">
          <FeaturedProductsManagement />
        </TabsContent>
        
        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recently Added Products</CardTitle>
            </CardHeader>
            <CardContent>
              <ProductsList sortBy="created_at" />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default ProductsManagement;
