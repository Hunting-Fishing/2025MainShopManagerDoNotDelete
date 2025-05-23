
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuthUser } from "@/hooks/useAuthUser";
import { Loader2, User, Settings, FileText, Users } from "lucide-react";

export default function Index() {
  const { isAuthenticated, isLoading, userName } = useAuthUser();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <>
        <Helmet>
          <title>Welcome | Easy Shop Manager</title>
        </Helmet>
        
        <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-gray-900 mb-4">
                Welcome to Easy Shop Manager
              </h1>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Your complete automotive service shop management solution. 
                Streamline operations, manage customers, track work orders, and grow your business.
              </p>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3 mb-12">
              <Card className="shadow-lg border-blue-100 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-blue-100 mb-4">
                      <User className="h-8 w-8 text-blue-700" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Customer Management</h3>
                    <p className="text-muted-foreground mb-4">
                      Track customer information, vehicles, service history, and communications all in one place.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-green-100 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-green-100 mb-4">
                      <Settings className="h-8 w-8 text-green-700" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Work Order Tracking</h3>
                    <p className="text-muted-foreground mb-4">
                      Create, manage, and track work orders from start to finish with real-time updates.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="shadow-lg border-purple-100 hover:shadow-xl transition-shadow">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-purple-100 mb-4">
                      <FileText className="h-8 w-8 text-purple-700" />
                    </div>
                    <h3 className="text-xl font-bold mb-2">Invoicing & Billing</h3>
                    <p className="text-muted-foreground mb-4">
                      Generate professional invoices, track payments, and manage your shop's finances.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="text-center">
              <div className="space-y-4">
                <h2 className="text-2xl font-bold text-gray-900">Ready to get started?</h2>
                <p className="text-gray-600">Join thousands of shop owners who trust Easy Shop Manager</p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/login">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700">
                      Sign In
                    </Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="outline" size="lg">
                      Create Account
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // Authenticated user view
  return (
    <>
      <Helmet>
        <title>Dashboard | Easy Shop Manager</title>
      </Helmet>
      
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900">
              Welcome back, {userName || 'User'}!
            </h1>
            <p className="text-gray-600 mt-2">
              Here's what's happening with your shop today.
            </p>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            <Link to="/dashboard">
              <Card className="shadow-md border-blue-100 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-blue-100 mb-4">
                      <Settings className="h-8 w-8 text-blue-700" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Dashboard</h2>
                    <p className="text-muted-foreground">
                      View your shop's overview, stats, and recent activity.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/customer-portal">
              <Card className="shadow-md border-green-100 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-green-100 mb-4">
                      <Users className="h-8 w-8 text-green-700" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Customer Portal</h2>
                    <p className="text-muted-foreground">
                      Manage customer relationships and service history.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
            
            <Link to="/invoice/create">
              <Card className="shadow-md border-purple-100 hover:shadow-lg transition-shadow cursor-pointer">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center text-center p-6">
                    <div className="p-3 rounded-full bg-purple-100 mb-4">
                      <FileText className="h-8 w-8 text-purple-700" />
                    </div>
                    <h2 className="text-xl font-bold mb-2">Create Invoice</h2>
                    <p className="text-muted-foreground">
                      Generate new invoices and manage billing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
