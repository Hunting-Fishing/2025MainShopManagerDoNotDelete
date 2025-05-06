
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { ArrowLeft, Info, RefreshCw } from "lucide-react";
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { toast } from '@/components/ui/use-toast';
import { Helmet } from 'react-helmet-async';

export default function ShoppingControls() {
  const [activeTab, setActiveTab] = useState("products");
  const [isStorageInitialized, setIsStorageInitialized] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    // Initialize storage on component mount
    const setupStorage = async () => {
      try {
        setIsInitializing(true);
        // Mock initialization for now
        setTimeout(() => {
          setIsStorageInitialized(true);
          setLastUpdated(new Date());
          setIsInitializing(false);
        }, 1000);
      } catch (error) {
        console.error("Error initializing storage:", error);
        toast({
          variant: "destructive",
          title: "Failed to initialize image storage",
          description: "Image uploads may not work correctly."
        });
        setIsInitializing(false);
      }
    };
    
    setupStorage();
  }, []);

  const handleRefresh = async () => {
    try {
      setIsInitializing(true);
      // Mock refresh for now
      setTimeout(() => {
        setIsStorageInitialized(true);
        setLastUpdated(new Date());
        toast({
          title: "Storage refreshed successfully"
        });
        setIsInitializing(false);
      }, 1000);
    } catch (error) {
      console.error("Error refreshing storage:", error);
      toast({
        variant: "destructive",
        title: "Failed to refresh storage"
      });
      setIsInitializing(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <Helmet>
        <title>Shopping Controls | Developer Portal</title>
        <meta name="description" content="Manage affiliate products, categories, and user submissions" />
      </Helmet>
      
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Portal
          </Link>
        </Button>
        <div className="flex justify-between items-center mb-2">
          <h1 className="text-3xl font-bold">Shopping Controls</h1>
          <div className="flex items-center gap-2">
            {lastUpdated && (
              <span className="text-sm text-slate-500">
                Last updated: {lastUpdated.toLocaleTimeString()}
              </span>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="flex items-center gap-1"
              onClick={handleRefresh}
              disabled={isInitializing}
            >
              <RefreshCw className={`h-4 w-4 ${isInitializing ? 'animate-spin' : ''}`} /> 
              Refresh
            </Button>
          </div>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Manage affiliate products, categories, and user submissions for the Tools Shop.
        </p>
      </div>

      {isInitializing && (
        <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl">
          <p className="text-sm text-blue-700 dark:text-blue-300 flex items-center">
            <Info className="h-4 w-4 mr-2" />
            Initializing storage for image uploads...
          </p>
        </div>
      )}
      
      {!isInitializing && !isStorageInitialized && (
        <div className="mb-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-yellow-700 dark:text-yellow-300 flex items-center">
              <Info className="h-4 w-4 mr-2" />
              Storage initialization failed. Image uploads may not work correctly.
            </p>
            <Button 
              variant="outline" 
              size="sm" 
              className="ml-6 w-fit"
              onClick={handleRefresh}
            >
              Retry Storage Initialization
            </Button>
          </div>
        </div>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-white dark:bg-slate-800 rounded-full p-1 border shadow-sm">
            <TabsTrigger value="products" className="rounded-full text-sm px-4 py-2">
              Products
              <Badge variant="outline" className="ml-2 bg-blue-100 text-blue-800 border-blue-200">
                Shop
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="categories" className="rounded-full text-sm px-4 py-2">
              Categories
            </TabsTrigger>
            <TabsTrigger value="submissions" className="rounded-full text-sm px-4 py-2">
              User Submissions
              <Badge variant="outline" className="ml-2 bg-amber-100 text-amber-800 border-amber-200">
                New
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="rounded-full text-sm px-4 py-2">
              Analytics
            </TabsTrigger>
          </TabsList>

          <div className="hidden md:block">
            <Button 
              variant="outline" 
              asChild
              className="rounded-full"
            >
              <Link to="/shop">
                Preview Shop
              </Link>
            </Button>
          </div>
        </div>

        <Card className="bg-white border-gray-100 shadow-md rounded-xl p-6">
          <TabsContent value="products" className="m-0">
            <p>Product management interface will be implemented here.</p>
          </TabsContent>

          <TabsContent value="categories" className="m-0">
            <p>Categories management interface will be implemented here.</p>
          </TabsContent>

          <TabsContent value="submissions" className="m-0">
            <p>User submissions management interface will be implemented here.</p>
          </TabsContent>

          <TabsContent value="analytics" className="m-0">
            <p>Analytics dashboard will be implemented here.</p>
          </TabsContent>
        </Card>
      </Tabs>
    </div>
  );
}
