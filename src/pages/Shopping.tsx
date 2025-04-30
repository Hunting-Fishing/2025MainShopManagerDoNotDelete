
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, Wrench } from 'lucide-react';
import { Card, CardContent } from "@/components/ui/card";
import { useNavigate } from 'react-router-dom';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Button } from '@/components/ui/button';
import { ShoppingCard } from '@/components/shopping/ShoppingCard';
import { ShoppingPageLayout } from '@/components/shopping/ShoppingPageLayout';

const Shopping = () => {
  const [activeTab, setActiveTab] = useState("grid");
  const navigate = useNavigate();
  const { isAdmin } = useAuthUser();
  
  const toggleView = (view: string) => {
    setActiveTab(view);
  };

  const shoppingCategories = [
    {
      id: "all-products",
      title: "All Products",
      description: "Browse our complete product catalog",
      icon: ShoppingBag,
      path: "/shopping/products",
      badgeColor: "blue"
    },
    {
      id: "categories",
      title: "Tool Categories",
      description: "Shop by automotive tool categories",
      icon: Wrench,
      path: "/shopping/categories",
      badge: "Updated",
      badgeColor: "green"
    }
  ];

  return (
    <ShoppingPageLayout
      title="Amazon Shop"
      description="Browse our complete collection of automotive tools and equipment"
      onSearch={(term) => console.log('Search:', term)}
    >
      <div className="flex justify-between items-center my-6">
        <h1 className="text-2xl font-bold">Amazon Shop</h1>
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

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-blue-800">
          As an Amazon Associate, we earn from qualifying purchases. This helps support our shop and allows us to continue bringing you quality content.
        </p>
      </div>

      {activeTab === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {shoppingCategories.map((category) => (
            <ShoppingCard
              key={category.id}
              title={category.title}
              description={category.description}
              icon={category.icon}
              path={category.path}
              badge={category.badge}
              badgeColor={category.badgeColor as any}
            />
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
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="mt-8 pt-4 border-t">
        <h2 className="text-lg font-medium mb-2">About Our Amazon Shop</h2>
        <p className="text-muted-foreground">
          Our shop features carefully selected products from Amazon. We've curated the best options across various categories to help you find quality items. When you purchase through our links, you support our business at no additional cost to you.
        </p>
      </div>
    </ShoppingPageLayout>
  );
};

export default Shopping;
