
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Tag, ShoppingCart, Heart, Gift, Truck, Coffee, Bookmark, Sparkles } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from "@/components/ui/breadcrumb";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Button } from '@/components/ui/button';
import { useProducts } from '@/hooks/useProducts';
import { useCategories } from '@/hooks/useCategories';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveContainer } from '@/components/ui/responsive-container';

const Shopping = () => {
  const [activeTab, setActiveTab] = useState("grid");
  const navigate = useNavigate();
  const { isAdmin } = useAuthUser();
  const isMobile = useIsMobile();
  
  const toggleView = (view: string) => {
    setActiveTab(view);
  };

  const shoppingCategories = [
    {
      id: "all-products",
      title: "All Products",
      description: "Browse our complete product catalog",
      icon: ShoppingBag,
      path: "/shopping/products"
    },
    {
      id: "categories",
      title: "Categories",
      description: "Shop by product categories",
      icon: Tag,
      path: "/shopping/categories",
    },
    {
      id: "cart",
      title: "Shopping Cart",
      description: "View and manage your shopping cart",
      icon: ShoppingCart,
      path: "/shopping/cart",
      badge: "3 items"
    },
    {
      id: "wishlist",
      title: "Wishlist",
      description: "Products you've saved for later",
      icon: Heart,
      path: "/shopping/wishlist"
    },
    {
      id: "deals",
      title: "Special Deals",
      description: "Limited-time offers and discounts",
      icon: Sparkles,
      path: "/shopping/deals",
      badge: "New"
    },
    {
      id: "recommendations",
      title: "Recommended for You",
      description: "Products picked just for you",
      icon: Gift,
      path: "/shopping/recommendations"
    },
    {
      id: "orders",
      title: "My Orders",
      description: "Track and manage your orders",
      icon: Truck,
      path: "/shopping/orders"
    },
    {
      id: "suggestions",
      title: "Product Suggestions",
      description: "Submit and view customer suggestions",
      icon: Coffee,
      path: "/shopping/suggestions"
    },
    {
      id: "saved",
      title: "Saved Items",
      description: "Your saved product collections",
      icon: Bookmark,
      path: "/shopping/saved"
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Shop</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold">Shop</h1>
        <div className="flex space-x-2 bg-muted/20 rounded-md p-1">
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "list" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => toggleView("list")}
          >
            List View
          </button>
          <button
            className={`px-3 py-1 rounded-md ${
              activeTab === "grid" ? "bg-white shadow-sm" : ""
            }`}
            onClick={() => toggleView("grid")}
          >
            Grid View
          </button>
        </div>
      </div>

      {isAdmin && (
        <div className="flex justify-end mb-4">
          <Button onClick={() => navigate('/shopping/admin')}>
            Admin Dashboard
          </Button>
        </div>
      )}

      {activeTab === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shoppingCategories.map((category) => (
            <Link to={category.path} className="block" key={category.id}>
              <Card 
                className="cursor-pointer transition-all duration-200 hover:shadow-md border overflow-hidden hover:border-slate-300"
              >
                <CardContent className="p-0">
                  <div className="p-5">
                    <div className="flex items-start">
                      <div className="rounded-full p-2 mr-3 text-slate-600 bg-slate-100">
                        <category.icon className="h-5 w-5" />
                      </div>
                      <div className="flex-grow">
                        <div className="flex items-center justify-between">
                          <h3 className="text-lg font-medium text-slate-900">{category.title}</h3>
                          {category.badge && (
                            <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                              {category.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1 text-sm text-slate-500 line-clamp-2">{category.description}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {shoppingCategories.map((category) => (
                <Link 
                  to={category.path}
                  key={category.id} 
                  className="block"
                >
                  <div className="flex items-center justify-between p-4 hover:bg-muted/10 cursor-pointer">
                    <div className="flex items-center">
                      <div className="bg-gray-100 p-2 rounded-full mr-4">
                        <category.icon className="h-5 w-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="font-medium">{category.title}</h3>
                        <p className="text-sm text-muted-foreground">
                          {category.description}
                        </p>
                      </div>
                    </div>
                    {category.badge && (
                      <Badge variant="outline" className="bg-purple-100 text-purple-800 border-purple-300">
                        {category.badge}
                      </Badge>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Shopping;
