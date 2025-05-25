
import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Wrench, 
  Users, 
  Package, 
  ClipboardList, 
  BarChart3, 
  Settings,
  ArrowRight,
  CheckCircle
} from 'lucide-react';
import { SeoHead } from '@/components/common/SeoHead';

export default function Index() {
  return (
    <>
      <SeoHead
        title="Easy Shop Manager - Professional Work Order Management System"
        description="Streamline your automotive shop operations with our comprehensive work order management system. Track equipment, manage inventory, handle customer relationships, and boost efficiency."
        keywords="work order management, automotive shop software, equipment tracking, inventory management, customer management system, maintenance scheduling"
      />
      
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
        {/* Hero Section */}
        <section className="relative py-20 px-4">
          <div className="container mx-auto max-w-6xl text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
              Professional Work Order Management for Modern Shops
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
              Streamline operations, track equipment maintenance, manage inventory, and deliver exceptional customer service with our comprehensive shop management solution.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="text-lg px-8 py-3 bg-blue-600 hover:bg-blue-700">
                <Link to="/dashboard">
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5" aria-label="Navigate to dashboard" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="text-lg px-8 py-3">
                <Link to="/equipment">
                  View Equipment
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4 bg-white">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Everything You Need to Manage Your Shop
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                From work order tracking to equipment maintenance, our platform provides all the tools you need for efficient shop operations.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-blue-100 rounded-full w-fit">
                    <ClipboardList className="h-8 w-8 text-blue-600" aria-label="Work order management icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Work Order Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Create, assign, and track work orders from start to finish. Monitor progress, manage priorities, and ensure timely completion of all service requests.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-green-100 rounded-full w-fit">
                    <Wrench className="h-8 w-8 text-green-600" aria-label="Equipment tracking icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Equipment Tracking</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Monitor all shop equipment, schedule preventive maintenance, track service history, and prevent costly breakdowns with proactive maintenance alerts.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-purple-100 rounded-full w-fit">
                    <Package className="h-8 w-8 text-purple-600" aria-label="Inventory management icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Inventory Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Track parts and supplies in real-time, set automatic reorder points, manage suppliers, and never run out of critical inventory items.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-orange-100 rounded-full w-fit">
                    <Users className="h-8 w-8 text-orange-600" aria-label="Customer management icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Customer Management</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Maintain comprehensive customer profiles, track service history, manage vehicle information, and build lasting customer relationships.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-red-100 rounded-full w-fit">
                    <BarChart3 className="h-8 w-8 text-red-600" aria-label="Analytics and reporting icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Analytics & Reporting</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Generate detailed reports on shop performance, track key metrics, analyze trends, and make data-driven decisions to grow your business.
                  </p>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow border-gray-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-3 bg-gray-100 rounded-full w-fit">
                    <Settings className="h-8 w-8 text-gray-600" aria-label="Configuration and settings icon" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Easy Configuration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-center leading-relaxed">
                    Customize the system to match your workflow, set up user permissions, configure notifications, and adapt the platform to your shop's unique needs.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Benefits Section */}
        <section className="py-20 px-4 bg-gray-50">
          <div className="container mx-auto max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Why Choose Easy Shop Manager?
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Built specifically for automotive shops and service businesses, our platform delivers measurable results.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" aria-label="Benefit checkmark" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Increased Efficiency</h3>
                    <p className="text-gray-600">Streamline workflows and reduce manual tasks by up to 40% with automated processes and intelligent scheduling.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" aria-label="Benefit checkmark" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Better Customer Service</h3>
                    <p className="text-gray-600">Provide faster responses and more accurate service estimates with centralized customer and vehicle information.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" aria-label="Benefit checkmark" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Reduced Downtime</h3>
                    <p className="text-gray-600">Prevent equipment failures with proactive maintenance scheduling and real-time monitoring alerts.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <CheckCircle className="h-6 w-6 text-green-500 mt-1 flex-shrink-0" aria-label="Benefit checkmark" />
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Cost Savings</h3>
                    <p className="text-gray-600">Optimize inventory levels, reduce waste, and lower operational costs through data-driven insights.</p>
                  </div>
                </div>
              </div>
              
              <div className="bg-white p-8 rounded-lg shadow-lg">
                <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Ready to Get Started?</h3>
                <p className="text-gray-600 mb-6 text-center">
                  Join hundreds of shops that have transformed their operations with Easy Shop Manager.
                </p>
                <Button asChild className="w-full text-lg py-3 bg-blue-600 hover:bg-blue-700">
                  <Link to="/dashboard">
                    Start Managing Your Shop
                    <ArrowRight className="ml-2 h-5 w-5" aria-label="Get started arrow" />
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
