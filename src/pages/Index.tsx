
import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Users, Wrench, Calendar, FileText, BarChart3 } from 'lucide-react';

export default function Index() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AutoShop Pro</h1>
              <p className="text-gray-600 mt-1">Professional Automotive Management System</p>
            </div>
            <div className="flex gap-3">
              <Link to="/customer-portal-login">
                <Button variant="outline" className="flex items-center gap-2">
                  <Users className="h-4 w-4" />
                  Customer Login
                </Button>
              </Link>
              <Link to="/staff-login">
                <Button className="flex items-center gap-2">
                  <Wrench className="h-4 w-4" />
                  Staff Login
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Hero Section */}
        <div className="text-center mb-16">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Streamline Your Auto Shop Operations
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Manage customers, work orders, inventory, and team members all in one comprehensive platform. 
            Built for modern automotive service centers.
          </p>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Users className="h-12 w-12 text-blue-600 mx-auto mb-4" />
              <CardTitle>Customer Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track customer information, vehicle history, and service records all in one place.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wrench className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <CardTitle>Work Order Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Create, track, and manage work orders from start to finish with detailed job tracking.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <Calendar className="h-12 w-12 text-purple-600 mx-auto mb-4" />
              <CardTitle>Scheduling & Reminders</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Schedule appointments and set up automated service reminders for customers.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-orange-600 mx-auto mb-4" />
              <CardTitle>Analytics & Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track performance, revenue, and operational metrics with comprehensive reporting.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <h3 className="text-3xl font-bold text-gray-900 mb-6">Ready to Get Started?</h3>
          <div className="flex justify-center gap-6">
            <Link to="/customer-portal-login">
              <Button size="lg" variant="outline" className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Customer Portal
              </Button>
            </Link>
            <Link to="/staff-login">
              <Button size="lg" className="flex items-center gap-2">
                <Wrench className="h-5 w-5" />
                Staff Portal
              </Button>
            </Link>
          </div>
          <p className="text-gray-600 mt-4">
            Choose your portal to access the features you need.
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white border-t mt-16">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center text-gray-600">
            <p>&copy; 2024 AutoShop Pro. Professional automotive management solution.</p>
          </div>
        </div>
      </div>
    </div>
  );
}
