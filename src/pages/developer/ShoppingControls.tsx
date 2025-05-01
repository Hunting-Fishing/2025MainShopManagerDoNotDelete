
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductsManagement from '@/components/developer/shopping/ProductsManagement';
import CategoriesManagement from '@/components/developer/shopping/CategoriesManagement';
import SubmissionsManagement from '@/components/developer/shopping/SubmissionsManagement';
import AnalyticsTab from '@/components/developer/shopping/AnalyticsTab';

export default function ShoppingControls() {
  const [activeTab, setActiveTab] = useState("products");

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <h1 className="text-3xl font-bold mb-2">Shopping Controls</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage affiliate products, categories, and user submissions for the Tools Shop.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-8 grid grid-cols-2 md:grid-cols-4 w-full md:w-auto">
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="submissions">User Submissions</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="products">
          <ProductsManagement />
        </TabsContent>

        <TabsContent value="categories">
          <CategoriesManagement />
        </TabsContent>

        <TabsContent value="submissions">
          <SubmissionsManagement />
        </TabsContent>

        <TabsContent value="analytics">
          <AnalyticsTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
