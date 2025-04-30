
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { ShoppingQuickLinks } from '@/components/shopping/ShoppingQuickLinks';
import { ShoppingCategories } from '@/components/shopping/ShoppingCategories';
import { ShoppingProducts } from '@/components/shopping/ShoppingProducts';

export default function Shopping() {
  const [searchQuery, setSearchQuery] = useState("");
  
  return (
    <div className="container py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Shopping</h1>
        <Button variant="default">
          Admin Dashboard
        </Button>
      </div>

      <ShoppingQuickLinks />
      
      <div className="mt-8">
        <div className="flex mb-6">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search products..." 
              className="pl-10" 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <Tabs defaultValue="all-products" className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="all-products">All Products</TabsTrigger>
            <TabsTrigger value="consumables">Consumables</TabsTrigger>
            <TabsTrigger value="tools">Tools</TabsTrigger>
            <TabsTrigger value="user-suggestions">User Suggestions</TabsTrigger>
          </TabsList>

          <TabsContent value="all-products">
            <Card className="p-6">
              <ShoppingProducts category="all" searchQuery={searchQuery} />
            </Card>
          </TabsContent>
          
          <TabsContent value="consumables">
            <Card className="p-6">
              <ShoppingProducts category="consumables" searchQuery={searchQuery} />
            </Card>
          </TabsContent>
          
          <TabsContent value="tools">
            <Card className="p-6">
              <ShoppingProducts category="tools" searchQuery={searchQuery} />
            </Card>
          </TabsContent>
          
          <TabsContent value="user-suggestions">
            <Card className="p-6">
              <ShoppingProducts category="user-suggestions" searchQuery={searchQuery} />
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
