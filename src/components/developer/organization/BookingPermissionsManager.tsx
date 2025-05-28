
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface BookingPermission {
  id: string;
  shop_name: string;
  allow_online_booking: boolean;
  allow_customer_portal: boolean;
  require_approval: boolean;
}

export function BookingPermissionsManager() {
  const [permissions, setPermissions] = useState<BookingPermission[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadBookingPermissions();
  }, []);

  const loadBookingPermissions = async () => {
    try {
      setIsLoading(true);
      // This would typically fetch from your API/database
      // For now, showing placeholder data structure
      setPermissions([]);
    } catch (error) {
      console.error('Error fetching booking permissions:', error);
      toast({
        title: "Error",
        description: "Failed to load booking permissions",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const updatePermission = async (shopId: string, field: string, value: boolean) => {
    try {
      // API call would go here
      console.log(`Updating ${field} for shop ${shopId} to ${value}`);
      
      toast({
        title: "Success",
        description: "Booking permissions updated successfully",
      });
    } catch (error) {
      console.error('Error updating permission:', error);
      toast({
        title: "Error",
        description: "Failed to update booking permissions",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Booking Permissions</CardTitle>
          <CardDescription>Loading booking permissions...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
            <div className="animate-pulse h-4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Booking Permissions</CardTitle>
        <CardDescription>
          Configure which shops can accept online bookings and customer portal access
        </CardDescription>
      </CardHeader>
      <CardContent>
        {permissions.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No shops configured yet</p>
            <p className="text-sm text-gray-400 mt-2">
              Shops will appear here once they are set up in your organization
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {permissions.map((permission) => (
              <div key={permission.id} className="border rounded-lg p-4">
                <h4 className="font-medium mb-4">{permission.shop_name}</h4>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`online-booking-${permission.id}`}>
                      Allow Online Booking
                    </Label>
                    <Switch
                      id={`online-booking-${permission.id}`}
                      checked={permission.allow_online_booking}
                      onCheckedChange={(checked) =>
                        updatePermission(permission.id, 'allow_online_booking', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`customer-portal-${permission.id}`}>
                      Allow Customer Portal Access
                    </Label>
                    <Switch
                      id={`customer-portal-${permission.id}`}
                      checked={permission.allow_customer_portal}
                      onCheckedChange={(checked) =>
                        updatePermission(permission.id, 'allow_customer_portal', checked)
                      }
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor={`require-approval-${permission.id}`}>
                      Require Booking Approval
                    </Label>
                    <Switch
                      id={`require-approval-${permission.id}`}
                      checked={permission.require_approval}
                      onCheckedChange={(checked) =>
                        updatePermission(permission.id, 'require_approval', checked)
                      }
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
