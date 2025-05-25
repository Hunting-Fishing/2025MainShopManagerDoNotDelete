
import React from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuthUser } from '@/hooks/useAuthUser';
import { Building2, Users, FileText, Settings, Calendar, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { EnhancedSeoHead } from '@/components/common/EnhancedSeoHead';

const Index = () => {
  const { isAuthenticated, isLoading } = useAuthUser();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-32 w-96" />
        </div>
      </div>
    );
  }

  // If user is authenticated, redirect to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Easy Shop Manager",
    "description": "Professional work order management system for automotive shops and service businesses",
    "applicationCategory": "BusinessApplication",
    "operatingSystem": "Web Browser",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": [
      "Work Order Management",
      "Equipment Tracking",
      "Inventory Control", 
      "Customer Management",
      "Team Scheduling",
      "Business Analytics"
    ]
  };

  return (
    <>
      <EnhancedSeoHead
        title="Easy Shop Manager - Professional Work Order Management System"
        description="Streamline your automotive shop operations with Easy Shop Manager's comprehensive work order, inventory, and team management solutions. Start your free trial today."
        keywords="work order management, automotive shop software, equipment tracking, inventory management, customer management, service business software"
        structuredData={structuredData}
        canonicalUrl="https://easyshopmanager.com"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Header */}
        <header className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center space-x-2">
                <Building2 className="h-8 w-8 text-blue-600" alt="" />
                <span className="text-2xl font-bold text-gray-900">Easy Shop Manager</span>
              </div>
              <nav className="flex items-center space-x-4" role="navigation" aria-label="Main navigation">
                <Link to="/login">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link to="/login">
                  <Button>Get Started</Button>
                </Link>
              </nav>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <section className="text-center mb-16" aria-labelledby="hero-heading">
            <h1 id="hero-heading" className="text-4xl font-bold text-gray-900 mb-4">
              Streamline Your Automotive Shop Operations
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Manage customers, work orders, inventory, and team members all in one powerful platform designed specifically for automotive shops and service businesses.
            </p>
            <div className="flex justify-center space-x-4">
              <Link to="/login">
                <Button size="lg" className="px-8 py-3">
                  Start Free Trial
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="px-8 py-3">
                Watch Demo
              </Button>
            </div>
          </section>

          {/* Features Section */}
          <section aria-labelledby="features-heading">
            <h2 id="features-heading" className="sr-only">Key Features</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Users className="h-12 w-12 text-blue-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Customer Management</h3>
                  </CardTitle>
                  <CardDescription>
                    Keep detailed customer records, vehicle information, and service history in one centralized location.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <FileText className="h-12 w-12 text-green-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Work Orders & Invoicing</h3>
                  </CardTitle>
                  <CardDescription>
                    Create professional work orders and invoices with automated calculations and customizable templates.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Building2 className="h-12 w-12 text-purple-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Equipment & Inventory Control</h3>
                  </CardTitle>
                  <CardDescription>
                    Track parts, supplies, and equipment with real-time inventory levels and automated reordering.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Calendar className="h-12 w-12 text-orange-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Scheduling & Calendar</h3>
                  </CardTitle>
                  <CardDescription>
                    Manage appointments, technician schedules, and shop capacity efficiently with smart scheduling.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <MessageSquare className="h-12 w-12 text-red-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Team Communication</h3>
                  </CardTitle>
                  <CardDescription>
                    Keep your team connected with built-in chat and collaboration tools for seamless communication.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <Settings className="h-12 w-12 text-indigo-600 mb-4" alt="" />
                  <CardTitle>
                    <h3>Business Analytics</h3>
                  </CardTitle>
                  <CardDescription>
                    Get insights into your shop's performance with detailed reports and analytics dashboards.
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </section>

          {/* CTA Section */}
          <section className="text-center bg-white rounded-2xl shadow-xl p-12" aria-labelledby="cta-heading">
            <h2 id="cta-heading" className="text-3xl font-bold text-gray-900 mb-4">
              Ready to Transform Your Shop?
            </h2>
            <p className="text-lg text-gray-600 mb-8">
              Join thousands of automotive shops already using Easy Shop Manager to grow their business and improve efficiency.
            </p>
            <Link to="/login">
              <Button size="lg" className="px-12 py-4 text-lg">
                Get Started Today
              </Button>
            </Link>
          </section>
        </main>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-12">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <div className="flex items-center justify-center space-x-2 mb-4">
                <Building2 className="h-6 w-6" alt="" />
                <span className="text-lg font-semibold">Easy Shop Manager</span>
              </div>
              <p className="text-gray-400">
                © 2024 Easy Shop Manager. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
};

export default Index;
