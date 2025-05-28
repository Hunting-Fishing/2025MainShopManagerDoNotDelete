
import React, { useState } from 'react';
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import ProductsManagement from '@/components/developer/shopping/ProductsManagement';
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
        <h1 className="text-3xl font-bold">Shopping Controls</h1>
        <p className="text-slate-600 dark:text-slate-300">
          Manage affiliate products, categories, and user submissions
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
          <TabsTrigger value="products" className="rounded-full text-sm px-4 py-2">
            Products
          </TabsTrigger>
          <TabsTrigger value="categories" className="rounded-full text-sm px-4 py-2">
            Categories
          </TabsTrigger>
          <TabsTrigger value="analytics" className="rounded-full text-sm px-4 py-2">
            Analytics
          </TabsTrigger>
          <TabsTrigger value="settings" className="rounded-full text-sm px-4 py-2">
            Settings
          </TabsTrigger>
        </TabsList>

        <div className="mt-6 space-y-6">
          <TabsContent value="products" className="space-y-6">
            <ProductsManagement />
          </TabsContent>

          <TabsContent value="categories" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Category Management</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Manage product categories and organizational structure for the shopping section.
              </p>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <AnalyticsTab />
          </TabsContent>

          <TabsContent value="settings" className="space-y-6">
            <div className="bg-white dark:bg-slate-800 p-6 rounded-lg border">
              <h2 className="text-xl font-semibold mb-4">Shopping Settings</h2>
              <p className="text-slate-600 dark:text-slate-300">
                Configure global settings for the shopping and affiliate system.
              </p>
            </div>
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
