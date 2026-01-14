import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ShoppingBag, 
  Plus
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function AffiliateProducts() {
  return (
    <>
      <Helmet>
        <title>Affiliate Products | Developer Portal</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <ShoppingBag className="h-8 w-8 text-orange-600" />
              Affiliate Products
            </h1>
            <p className="text-muted-foreground">
              Manage affiliate products across all modules
            </p>
          </div>
          <Button className="bg-orange-600 hover:bg-orange-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Product
          </Button>
        </div>

        {/* Placeholder */}
        <Card>
          <CardHeader>
            <CardTitle>All Products</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center py-12 text-muted-foreground">
              <ShoppingBag className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">Affiliate Products Coming Soon</p>
              <p className="text-sm mt-2">This feature is under development</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
