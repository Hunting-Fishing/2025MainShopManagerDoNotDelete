
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Eye, ExternalLink, Search, User } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useImpersonation } from '@/contexts/ImpersonationContext';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface Customer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  booking_enabled?: boolean;
}

export function CustomerPortalAccess() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const { startImpersonation, stopImpersonation, isImpersonating, impersonatedCustomer } = useImpersonation();

  React.useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          id,
          first_name,
          last_name,
          email,
          customer_shop_relationships!inner(booking_enabled)
        `)
        .limit(50);

      if (error) throw error;

      const customersWithPermissions = data?.map(customer => ({
        ...customer,
        booking_enabled: customer.customer_shop_relationships?.[0]?.booking_enabled ?? true
      })) || [];

      setCustomers(customersWithPermissions);
    } catch (error) {
      console.error('Error fetching customers:', error);
      toast({
        title: "Error",
        description: "Failed to fetch customers",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImpersonate = (customer: Customer) => {
    startImpersonation({
      id: customer.id,
      name: `${customer.first_name} ${customer.last_name}`.trim() || customer.email,
      email: customer.email
    });
    
    toast({
      title: "Impersonation Started",
      description: `Now viewing as ${customer.first_name} ${customer.last_name}`,
    });
  };

  const handleStopImpersonation = () => {
    stopImpersonation();
    toast({
      title: "Impersonation Stopped",
      description: "Returned to admin view",
    });
  };

  const filteredCustomers = customers.filter(customer =>
    `${customer.first_name} ${customer.last_name} ${customer.email}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  const getInitials = (firstName: string, lastName: string): string => {
    return `${firstName?.charAt(0) || ''}${lastName?.charAt(0) || ''}`.toUpperCase() || 'U';
  };

  return (
    <div className="space-y-6">
      {/* Portal Access Header */}
      <Card className="shadow-md border border-blue-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ExternalLink className="h-5 w-5 text-blue-600" />
            Customer Portal Access
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isImpersonating ? (
            <div className="flex items-center justify-between p-4 bg-amber-50 border border-amber-200 rounded-lg">
              <div className="flex items-center gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-amber-100 text-amber-700">
                    {impersonatedCustomer?.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-medium text-amber-800">Currently viewing as: {impersonatedCustomer?.name}</p>
                  <p className="text-sm text-amber-600">{impersonatedCustomer?.email}</p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={handleStopImpersonation}>
                Stop Impersonation
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              <Link to="/customer-portal" target="_blank">
                <Button className="w-full flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                  <ExternalLink className="h-4 w-4" />
                  View Customer Portal (Admin)
                </Button>
              </Link>
              <Link to="/customer-portal">
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Eye className="h-4 w-4" />
                  Preview Customer Portal
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Customer Impersonation */}
      <Card className="shadow-md border border-purple-100">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-purple-600" />
            Customer Impersonation
          </CardTitle>
          <p className="text-sm text-gray-600">
            Impersonate customers to test their portal experience and troubleshoot issues
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search customers by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button variant="outline" onClick={fetchCustomers} disabled={loading}>
              {loading ? 'Loading...' : 'Refresh'}
            </Button>
          </div>

          <div className="max-h-96 overflow-y-auto space-y-2">
            {filteredCustomers.map((customer) => (
              <div
                key={customer.id}
                className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {getInitials(customer.first_name, customer.last_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">
                      {customer.first_name} {customer.last_name}
                    </p>
                    <p className="text-sm text-gray-500">{customer.email}</p>
                  </div>
                  <Badge 
                    variant={customer.booking_enabled ? "default" : "secondary"}
                    className={customer.booking_enabled ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}
                  >
                    {customer.booking_enabled ? "Booking Enabled" : "Booking Disabled"}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleImpersonate(customer)}
                  disabled={isImpersonating}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View As
                </Button>
              </div>
            ))}
            
            {filteredCustomers.length === 0 && !loading && (
              <div className="text-center py-8 text-gray-500">
                No customers found matching your search.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
