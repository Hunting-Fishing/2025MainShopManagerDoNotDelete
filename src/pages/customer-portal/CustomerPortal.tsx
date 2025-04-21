
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

export default function CustomerPortal() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Welcome to Your Customer Portal</h1>
        <p className="text-gray-500">View and manage your vehicle service information</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Active Work Orders</h3>
            <p className="text-3xl font-bold text-blue-700">2</p>
            <p className="text-sm text-blue-600 mt-2">View your current service requests</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Your Vehicles</h3>
            <p className="text-3xl font-bold text-green-700">3</p>
            <p className="text-sm text-green-600 mt-2">Manage your vehicle information</p>
          </CardContent>
        </Card>
        
        <Card className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200">
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-2">Upcoming Service</h3>
            <p className="text-3xl font-bold text-amber-700">1</p>
            <p className="text-sm text-amber-600 mt-2">View scheduled maintenance</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Recent Activity</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-4">
                <div className="min-w-[2px] h-full bg-blue-200 rounded-full"></div>
                <div>
                  <p className="font-medium">Oil change completed</p>
                  <p className="text-sm text-gray-500">April 16, 2025 - Honda Civic</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="min-w-[2px] h-full bg-blue-200 rounded-full"></div>
                <div>
                  <p className="font-medium">New work order created</p>
                  <p className="text-sm text-gray-500">April 15, 2025 - Honda Accord</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="min-w-[2px] h-full bg-blue-200 rounded-full"></div>
                <div>
                  <p className="font-medium">Message from technician</p>
                  <p className="text-sm text-gray-500">April 14, 2025 - Additional parts needed</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <h3 className="text-lg font-medium mb-4">Maintenance Reminders</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-amber-50 border border-amber-200 rounded-lg">
                <div>
                  <p className="font-medium">Honda Accord - Brake Service</p>
                  <p className="text-sm text-gray-500">Due in 14 days</p>
                </div>
                <div className="text-amber-500 font-medium">May 5</div>
              </div>
              
              <div className="flex justify-between items-center p-3 bg-green-50 border border-green-200 rounded-lg">
                <div>
                  <p className="font-medium">Honda Civic - Tire Rotation</p>
                  <p className="text-sm text-gray-500">Due in 45 days</p>
                </div>
                <div className="text-green-600 font-medium">June 5</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
