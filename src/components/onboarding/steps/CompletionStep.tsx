
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, ArrowRight, Users, Package, Wrench, BarChart3, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface CompletionStepProps {
  onNext: () => void;
  onPrevious: () => void;
  data: {
    basicInfo: any;
    businessSettings: any;
    sampleData: any;
  };
  updateData: (data: any) => void;
}

export function CompletionStep({ data }: CompletionStepProps) {
  const navigate = useNavigate();
  const { basicInfo, businessSettings, sampleData } = data;

  const handleNavigate = (path: string) => {
    try {
      navigate(path);
    } catch (error) {
      console.error('Navigation error:', error);
      // Fallback to window.location for troubleshooting
      window.location.href = path;
    }
  };

  const getBusinessHoursDisplay = () => {
    if (!businessSettings?.businessHours) return 'Not configured';
    
    const hours = businessSettings.businessHours;
    const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
    
    return daysOfWeek.map((day, index) => {
      const dayHours = hours[index];
      if (!dayHours || dayHours.is_closed) {
        return `${day}: Closed`;
      }
      return `${day}: ${dayHours.open_time} - ${dayHours.close_time}`;
    }).join(', ');
  };

  const recommendedNextSteps = [
    {
      title: 'Add Your First Customer',
      description: 'Start building your customer database',
      icon: <Users className="h-5 w-5" />,
      path: '/customers/create',
      color: 'bg-blue-500'
    },
    {
      title: 'Manage Inventory',
      description: 'Set up your parts and supplies',
      icon: <Package className="h-5 w-5" />,
      path: '/inventory',
      color: 'bg-green-500'
    },
    {
      title: 'Create Work Order',
      description: 'Start tracking jobs and services',
      icon: <Wrench className="h-5 w-5" />,
      path: '/work-orders/create',
      color: 'bg-purple-500'
    },
    {
      title: 'View Dashboard',
      description: 'Monitor your shop performance',
      icon: <BarChart3 className="h-5 w-5" />,
      path: '/dashboard',
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Success Message */}
      <div className="text-center">
        <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          🎉 Congratulations! Your shop is ready!
        </h2>
        <p className="text-gray-600">
          You've successfully completed the setup process. Here's a summary of what you've configured:
        </p>
      </div>

      {/* Setup Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5 text-green-500" />
            Setup Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Basic Information */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Shop Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Shop Name:</span>
                <span className="ml-2 font-medium">{basicInfo?.name || 'Not provided'}</span>
              </div>
              <div>
                <span className="text-gray-600">Business Type:</span>
                <span className="ml-2 font-medium">{basicInfo?.businessType || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600">Industry:</span>
                <span className="ml-2 font-medium">{basicInfo?.industry || 'Not specified'}</span>
              </div>
              <div>
                <span className="text-gray-600">Phone:</span>
                <span className="ml-2 font-medium">{basicInfo?.phone || 'Not provided'}</span>
              </div>
              <div className="md:col-span-2">
                <span className="text-gray-600">Address:</span>
                <span className="ml-2 font-medium">{basicInfo?.address || 'Not provided'}</span>
              </div>
            </div>
          </div>

          {/* Business Settings */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Business Settings</h4>
            <div className="text-sm">
              <div className="mb-2">
                <span className="text-gray-600">Business Hours:</span>
                <div className="mt-1 text-xs text-gray-500 max-w-full break-words">
                  {getBusinessHoursDisplay()}
                </div>
              </div>
              {businessSettings?.laborRates && (
                <div>
                  <span className="text-gray-600">Labor Rates:</span>
                  <span className="ml-2 font-medium">
                    ${businessSettings.laborRates.standard || '0'}/hr standard, 
                    ${businessSettings.laborRates.premium || '0'}/hr premium
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Sample Data */}
          <div>
            <h4 className="font-semibold text-gray-900 mb-2">Sample Data Imported</h4>
            <div className="flex flex-wrap gap-2">
              {sampleData?.importCustomers && (
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  <Users className="h-3 w-3 mr-1" />
                  Sample Customers
                </Badge>
              )}
              {sampleData?.importInventory && (
                <Badge variant="secondary" className="bg-green-100 text-green-800">
                  <Package className="h-3 w-3 mr-1" />
                  Sample Inventory
                </Badge>
              )}
              {sampleData?.importServices && (
                <Badge variant="secondary" className="bg-purple-100 text-purple-800">
                  <Wrench className="h-3 w-3 mr-1" />
                  Sample Services
                </Badge>
              )}
              {!sampleData?.importCustomers && !sampleData?.importInventory && !sampleData?.importServices && (
                <Badge variant="outline">No sample data imported</Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recommended Next Steps */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Next Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {recommendedNextSteps.map((step, index) => (
              <Card key={index} className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <div className={`${step.color} p-2 rounded-lg text-white flex-shrink-0`}>
                      {step.icon}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-1">{step.title}</h4>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleNavigate(step.path)}
                        className="w-full justify-between"
                      >
                        Get Started
                        <ArrowRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Go to Dashboard Button */}
      <div className="text-center">
        <Button 
          size="lg" 
          onClick={() => handleNavigate('/dashboard')}
          className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-8 py-3"
        >
          <BarChart3 className="mr-2 h-5 w-5" />
          Go to Dashboard
        </Button>
      </div>
    </div>
  );
}
