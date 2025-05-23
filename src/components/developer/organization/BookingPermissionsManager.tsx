
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';
import { useShopId } from '@/hooks/useShopId';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle, Check, X } from 'lucide-react';
import { Alert, AlertDescription } from "@/components/ui/alert";

interface CustomerWithBookingPermission {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  booking_enabled: boolean;
  relationship_id: string;
}

export function BookingPermissionsManager() {
  const { shopId } = useShopId();
  const [globalBookingEnabled, setGlobalBookingEnabled] = useState(true);
  const [customers, setCustomers] = useState<CustomerWithBookingPermission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingGlobal, setSavingGlobal] = useState(false);
  const [savingCustomerId, setSavingCustomerId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Fetch shop settings and customer list with booking permissions
  useEffect(() => {
    if (!shopId) return;
    
    async function loadData() {
      setLoading(true);
      setError(null);
      
      try {
        // Fetch global setting
        const { data: shopData, error: shopError } = await supabase
          .from('shop_settings')
          .select('booking_enabled')
          .eq('shop_id', shopId)
          .single();
        
        if (shopError) {
          console.error('Error fetching shop settings:', shopError);
          setError('Failed to load shop settings');
        } else if (shopData) {
          setGlobalBookingEnabled(shopData.booking_enabled);
        }
        
        // Fetch customers with their booking permission status
        const { data: customerData, error: customerError } = await supabase
          .from('customers')
          .select(`
            id, 
            first_name, 
            last_name, 
            email,
            customer_shop_relationships!inner(id, shop_id, booking_enabled)
          `)
          .eq('customer_shop_relationships.shop_id', shopId);
        
        if (customerError) {
          console.error('Error fetching customers:', customerError);
          setError('Failed to load customer data');
        } else if (customerData) {
          // Transform the nested data structure
          const formattedCustomers = customerData.map(customer => ({
            id: customer.id,
            first_name: customer.first_name,
            last_name: customer.last_name,
            email: customer.email,
            booking_enabled: customer.customer_shop_relationships[0].booking_enabled,
            relationship_id: customer.customer_shop_relationships[0].id
          }));
          
          setCustomers(formattedCustomers);
        }
      } catch (err) {
        console.error('Error in BookingPermissionsManager:', err);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    }
    
    loadData();
  }, [shopId]);

  // Toggle global booking setting
  const handleGlobalToggle = async (enabled: boolean) => {
    if (!shopId) return;
    
    setSavingGlobal(true);
    try {
      const { error } = await supabase
        .from('shop_settings')
        .update({ booking_enabled: enabled })
        .eq('shop_id', shopId);
      
      if (error) {
        console.error('Error updating shop settings:', error);
        toast({
          title: 'Failed to update setting',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      setGlobalBookingEnabled(enabled);
      toast({
        title: 'Setting updated',
        description: `Booking has been ${enabled ? 'enabled' : 'disabled'} for all customers`
      });
    } catch (err) {
      console.error('Error toggling global booking:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSavingGlobal(false);
    }
  };

  // Toggle individual customer booking permission
  const handleCustomerToggle = async (customerId: string, relationshipId: string, enabled: boolean) => {
    if (!shopId) return;
    
    setSavingCustomerId(customerId);
    try {
      const { error } = await supabase
        .from('customer_shop_relationships')
        .update({ booking_enabled: enabled })
        .eq('id', relationshipId);
      
      if (error) {
        console.error('Error updating customer booking permission:', error);
        toast({
          title: 'Failed to update permission',
          description: error.message,
          variant: 'destructive'
        });
        return;
      }
      
      // Update local state
      setCustomers(customers.map(c => 
        c.id === customerId ? { ...c, booking_enabled: enabled } : c
      ));
      
      toast({
        title: 'Permission updated',
        description: `Booking has been ${enabled ? 'enabled' : 'disabled'} for this customer`
      });
    } catch (err) {
      console.error('Error toggling customer booking:', err);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
    } finally {
      setSavingCustomerId(null);
    }
  };

  return (
    <Card className="mb-8">
      <CardHeader>
        <CardTitle>Booking Permissions</CardTitle>
        <CardDescription>
          Manage which customers can request appointments through the customer portal
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        {/* Global booking toggle */}
        <div className="flex items-center justify-between border p-4 rounded-lg bg-slate-50">
          <div>
            <Label htmlFor="global-booking" className="text-base font-semibold">
              Allow Booking Requests
            </Label>
            <p className="text-sm text-slate-500 mt-1">
              When disabled, no customers can request appointments
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Switch
              id="global-booking"
              checked={globalBookingEnabled}
              onCheckedChange={handleGlobalToggle}
              disabled={loading || savingGlobal}
            />
            {savingGlobal && <span className="text-sm text-slate-500">Saving...</span>}
          </div>
        </div>
        
        {/* Customer-specific permissions */}
        <div>
          <h3 className="text-sm font-medium mb-3">Customer-Specific Permissions</h3>
          <div className="border rounded-lg overflow-hidden">
            {loading ? (
              <div className="p-4 space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            ) : customers.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                No customers found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Booking Enabled</TableHead>
                    <TableHead className="w-24 text-right">Toggle</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {customers.map((customer) => (
                    <TableRow key={customer.id}>
                      <TableCell>
                        {customer.first_name} {customer.last_name}
                      </TableCell>
                      <TableCell>{customer.email}</TableCell>
                      <TableCell>
                        {customer.booking_enabled ? (
                          <span className="text-green-600 flex items-center gap-1">
                            <Check className="h-4 w-4" /> Enabled
                          </span>
                        ) : (
                          <span className="text-red-600 flex items-center gap-1">
                            <X className="h-4 w-4" /> Disabled
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Switch
                          checked={customer.booking_enabled}
                          onCheckedChange={(enabled) => handleCustomerToggle(customer.id, customer.relationship_id, enabled)}
                          disabled={loading || savingCustomerId === customer.id || !globalBookingEnabled}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          {globalBookingEnabled === false && customers.length > 0 && (
            <p className="text-sm text-amber-500 mt-2 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              Individual settings have no effect while global booking is disabled
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
