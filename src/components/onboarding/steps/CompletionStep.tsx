
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Users, Calendar, FileText, Package, Settings, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompletionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: any;
  updateData: (data: any) => void;
}

const nextSteps = [
  {
    icon: <Users className="h-5 w-5" />,
    title: 'Add Your First Customer',
    description: 'Start by adding real customer information',
    action: 'Go to Customers',
    route: '/customers/create',
    priority: 'high'
  },
  {
    icon: <Calendar className="h-5 w-5" />,
    title: 'Schedule Appointments',
    description: 'Set up your calendar and start booking',
    action: 'Open Calendar',
    route: '/calendar',
    priority: 'medium'
  },
  {
    icon: <FileText className="h-5 w-5" />,
    title: 'Create Work Orders',
    description: 'Track service jobs and repairs',
    action: 'Work Orders',
    route: '/work-orders/create',
    priority: 'high'
  },
  {
    icon: <Package className="h-5 w-5" />,
    title: 'Manage Inventory',
    description: 'Track parts and supplies',
    action: 'View Inventory',
    route: '/inventory',
    priority: 'medium'
  },
  {
    icon: <Settings className="h-5 w-5" />,
    title: 'Fine-tune Settings',
    description: 'Customize your shop preferences',
    action: 'Open Settings',
    route: '/settings',
    priority: 'low'
  },
];

export function CompletionStep({ data }: CompletionStepProps) {
  const navigate = useNavigate();

  const handleGetStarted = () => {
    navigate('/dashboard');
  };

  const handleQuickAction = (route: string) => {
    navigate(route);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center">
            <CheckCircle className="h-8 w-8 text-white" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">🎉 Congratulations!</h3>
        <p className="text-lg text-gray-600 mb-4">
          Your automotive shop is now set up and ready to go!
        </p>
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <p className="text-blue-800 font-medium">{data.basicInfo?.shopName || 'Your Shop'} is ready for business</p>
          <p className="text-blue-600 text-sm">
            You can start managing customers, scheduling appointments, and tracking work orders.
          </p>
        </div>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Summary</CardTitle>
          <CardDescription>
            Here's what we've configured for your shop
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Business Information</h4>
              <p className="text-sm text-gray-600">{data.basicInfo?.shopName}</p>
              <p className="text-sm text-gray-600">{data.basicInfo?.address}, {data.basicInfo?.city}</p>
              <p className="text-sm text-gray-600">{data.basicInfo?.phone}</p>
            </div>
            <div className="space-y-2">
              <h4 className="font-medium text-gray-900">Features Enabled</h4>
              <div className="flex flex-wrap gap-1">
                {data.businessSettings?.features?.onlineBooking && (
                  <Badge variant="secondary">Online Booking</Badge>
                )}
                {data.businessSettings?.features?.emailNotifications && (
                  <Badge variant="secondary">Email Notifications</Badge>
                )}
                {data.businessSettings?.features?.digitalInvoicing && (
                  <Badge variant="secondary">Digital Invoicing</Badge>
                )}
                {data.businessSettings?.features?.workOrderTracking && (
                  <Badge variant="secondary">Work Order Tracking</Badge>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
          <CardDescription>
            Here are some things you might want to do to get the most out of your new system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {nextSteps.map((step, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-medium text-gray-900">{step.title}</h4>
                      <Badge className={getPriorityColor(step.priority)}>
                        {step.priority}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600">{step.description}</p>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleQuickAction(step.route)}
                  className="flex items-center space-x-1"
                >
                  <span>{step.action}</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Get Started Button */}
      <div className="text-center">
        <Button onClick={handleGetStarted} size="lg" className="px-12">
          Go to Dashboard
        </Button>
        <p className="text-sm text-gray-500 mt-4">
          You can access these setup options anytime from the Settings page.
        </p>
      </div>
    </div>
  );
}
