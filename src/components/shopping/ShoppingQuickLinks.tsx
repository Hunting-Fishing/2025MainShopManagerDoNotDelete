
import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart } from 'lucide-react';

export function ShoppingQuickLinks() {
  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Shopping Quick Links</CardTitle>
        <Heart className="text-gray-400 hover:text-red-500 cursor-pointer" />
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="all-products" className="w-full">
          <TabsList className="mb-4">
            <TabsTrigger value="all-products">All Products</TabsTrigger>
            <TabsTrigger value="user-suggestions">
              <div className="flex items-center">
                User Suggestions
                <span className="ml-2 bg-primary text-primary-foreground text-xs rounded-full px-2 py-0.5">
                  New
                </span>
              </div>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </CardContent>
    </Card>
  );
}
