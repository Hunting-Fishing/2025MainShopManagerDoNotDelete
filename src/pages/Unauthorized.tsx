
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ShieldX } from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { useShopName } from "@/hooks/useShopName";

export default function Unauthorized() {
  const { shopName } = useShopName();
  return (
    <>
      <Helmet>
        <title>{`Unauthorized | ${shopName || "Easy Shop Manager"}`}</title>
      </Helmet>
      
      <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
        <Card className="w-full max-w-md shadow-lg">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center text-center">
              <div className="p-3 rounded-full bg-red-100 mb-4">
                <ShieldX className="h-8 w-8 text-red-700" />
              </div>
              <h2 className="text-2xl font-bold mb-2">Access Denied</h2>
              <p className="text-gray-600 mb-6">
                You don't have permission to access this page. Please contact your administrator if you believe this is an error.
              </p>
              
              <div className="space-y-4 w-full max-w-xs">
                <Link to="/">
                  <Button className="w-full">
                    Go to Dashboard
                  </Button>
                </Link>
                
                <Link to="/login">
                  <Button variant="outline" className="w-full">
                    Sign In with Different Account
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
