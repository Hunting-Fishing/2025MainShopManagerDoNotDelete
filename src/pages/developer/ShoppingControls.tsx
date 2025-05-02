
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import ProductsManagement from '@/components/developer/shopping/ProductsManagement';
import CategoriesManagement from '@/components/developer/shopping/CategoriesManagement';
import SubmissionsManagement from '@/components/developer/shopping/SubmissionsManagement';
import AnalyticsTab from '@/components/developer/shopping/AnalyticsTab';
import initializeStorage from '@/utils/initializeStorage';
import { toast } from '@/hooks/use-toast';

export default function ShoppingControls() {
  const [activeTab, setActiveTab] = useState("products");
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);

  useEffect(() => {
    // Initialize storage on component mount
    const setupStorage = async () => {
      try {
        setIsInitializing(true);
        const initialized = await initializeStorage();
        setIsStorageInitialized(initialized);
        if (initialized) {
          console.log("Storage initialized successfully");
        }
      } catch (error) {
        console.error("Error initializing storage:", error);
        toast({
          title: "Storage Error",
          description: "Failed to initialize image storage. Image uploads may not work correctly.",
          variant: "destructive",
        });
      } finally {
        setIsInitializing(false);
      }
    };
    
    setupStorage();
  }, []);

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

      {isInitializing && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-md">
          <p className="text-sm text-blue-700 dark:text-blue-300">
            Initializing storage for image uploads...
          </p>
        </div>
      )}
      
      {!isInitializing && !isStorageInitialized && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
          <p className="text-sm text-yellow-700 dark:text-yellow-300">
            Storage initialization failed. Image uploads may not work correctly.
          </p>
          <Button 
            variant="outline" 
            size="sm" 
            className="mt-2"
            onClick={async () => {
              try {
                setIsInitializing(true);
                const initialized = await initializeStorage();
                setIsStorageInitialized(initialized);
                if (initialized) {
                  toast({
                    title: "Success",
                    description: "Storage initialized successfully",
                    variant: "success",
                  });
                }
              } catch (error) {
                console.error("Error initializing storage:", error);
              } finally {
                setIsInitializing(false);
              }
            }}
          >
            Retry Storage Initialization
          </Button>
        </div>
      )}

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
