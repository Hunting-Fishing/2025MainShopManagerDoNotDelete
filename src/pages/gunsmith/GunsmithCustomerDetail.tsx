import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  User, 
  Phone, 
  Mail, 
  MapPin, 
  Crosshair, 
  FileText, 
  Wrench,
  Calendar,
  CreditCard,
  Edit,
  AlertTriangle,
  Plus,
  KeyRound
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';
import { EditGunsmithCustomerDialog } from '@/components/gunsmith/EditGunsmithCustomerDialog';

export default function GunsmithCustomerDetail() {
  const { customerId } = useParams<{ customerId: string }>();
  const navigate = useNavigate();
  const [editDialogOpen, setEditDialogOpen] = useState(false);

  // Fetch customer details
  const { data: customer, isLoading: customerLoading, refetch: refetchCustomer } = useQuery({
    queryKey: ['gunsmith-customer', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Fetch customer's firearms
  const { data: firearms, isLoading: firearmsLoading } = useQuery({
    queryKey: ['gunsmith-customer-firearms', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gunsmith_firearms')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Fetch customer's jobs
  const { data: jobs, isLoading: jobsLoading } = useQuery({
    queryKey: ['gunsmith-customer-jobs', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gunsmith_jobs')
        .select('*, gunsmith_firearms(make, model)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Fetch customer's quotes
  const { data: quotes, isLoading: quotesLoading } = useQuery({
    queryKey: ['gunsmith-customer-quotes', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gunsmith_quotes')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Fetch customer's invoices
  const { data: invoices, isLoading: invoicesLoading } = useQuery({
    queryKey: ['gunsmith-customer-invoices', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gunsmith_invoices')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  // Fetch customer's appointments
  const { data: appointments, isLoading: appointmentsLoading } = useQuery({
    queryKey: ['gunsmith-customer-appointments', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('gunsmith_appointments')
        .select('*')
        .eq('customer_id', customerId)
        .order('appointment_date', { ascending: false });
      
      if (error) throw error;
      return data;
    },
    enabled: !!customerId
  });

  if (!customerId) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Invalid customer ID.</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (customerLoading) {
    return (
      <div className="min-h-screen bg-background p-6">
        <div className="space-y-6">
          <Skeleton className="h-12 w-64" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="min-h-screen bg-background p-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>Customer not found.</AlertDescription>
        </Alert>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'completed': return 'bg-green-500/20 text-green-700 border-green-500/30';
      case 'in_progress': case 'in progress': return 'bg-blue-500/20 text-blue-700 border-blue-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-700 border-yellow-500/30';
      case 'cancelled': return 'bg-red-500/20 text-red-700 border-red-500/30';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith/customers')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <User className="h-8 w-8 text-amber-600" />
              {customer.first_name} {customer.last_name}
            </h1>
            <p className="text-muted-foreground mt-1">Customer Details</p>
          </div>
        </div>
        <Button onClick={() => setEditDialogOpen(true)} className="bg-amber-600 hover:bg-amber-700">
          <Edit className="h-4 w-4 mr-2" />
          Edit Customer
        </Button>
      </div>

      {/* Customer Info Card */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5 text-amber-600" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {customer.phone && (
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{customer.phone}</span>
              </div>
            )}
            {customer.email && (
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.address && (
              <div className="flex items-center gap-2 col-span-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{customer.address}</span>
              </div>
            )}
            <div className="flex items-center gap-2">
              <KeyRound className="h-4 w-4 text-muted-foreground" />
              {customer.user_id ? (
                <Badge className="bg-green-100 text-green-800">Portal Access Enabled</Badge>
              ) : (
                <Badge variant="outline" className="text-muted-foreground">No Portal Access</Badge>
              )}
            </div>
          </div>
          {customer.notes && (
            <div className="mt-4 p-3 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">{customer.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for related data */}
      <Tabs defaultValue="firearms" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5 lg:w-auto lg:inline-grid">
          <TabsTrigger value="firearms" className="gap-2">
            <Crosshair className="h-4 w-4" />
            Firearms ({firearms?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="jobs" className="gap-2">
            <Wrench className="h-4 w-4" />
            Jobs ({jobs?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="quotes" className="gap-2">
            <FileText className="h-4 w-4" />
            Quotes ({quotes?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="invoices" className="gap-2">
            <CreditCard className="h-4 w-4" />
            Invoices ({invoices?.length || 0})
          </TabsTrigger>
          <TabsTrigger value="appointments" className="gap-2">
            <Calendar className="h-4 w-4" />
            Appointments ({appointments?.length || 0})
          </TabsTrigger>
        </TabsList>

        {/* Firearms Tab */}
        <TabsContent value="firearms">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Registered Firearms</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate(`/gunsmith/firearms/new?customer=${customerId}`)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Firearm
              </Button>
            </CardHeader>
            <CardContent>
              {firearmsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : firearms?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No firearms registered</p>
              ) : (
                <div className="space-y-3">
                  {firearms?.map((firearm) => (
                    <div 
                      key={firearm.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/gunsmith/firearms/${firearm.id}`)}
                    >
                      <div>
                        <span className="font-medium">{firearm.make} {firearm.model}</span>
                        <div className="text-sm text-muted-foreground">
                          {firearm.firearm_type} • S/N: {firearm.serial_number}
                        </div>
                      </div>
                      <Badge variant="outline">{firearm.caliber}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Jobs Tab */}
        <TabsContent value="jobs">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Service Jobs</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate(`/gunsmith/jobs/new?customer=${customerId}`)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Job
              </Button>
            </CardHeader>
            <CardContent>
              {jobsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : jobs?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No jobs found</p>
              ) : (
                <div className="space-y-3">
                  {jobs?.map((job) => (
                    <div 
                      key={job.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/gunsmith/jobs/${job.id}`)}
                    >
                      <div>
                        <span className="font-medium">{job.job_number}</span>
                        <div className="text-sm text-muted-foreground">
                          {job.gunsmith_firearms?.make} {job.gunsmith_firearms?.model} • {job.job_type}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(job.status)}>{job.status}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {format(new Date(job.created_at), 'MMM d, yyyy')}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Quotes Tab */}
        <TabsContent value="quotes">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Quotes</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate(`/gunsmith/quotes/new?customer=${customerId}`)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Quote
              </Button>
            </CardHeader>
            <CardContent>
              {quotesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : quotes?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No quotes found</p>
              ) : (
                <div className="space-y-3">
                  {quotes?.map((quote) => (
                    <div 
                      key={quote.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/gunsmith/quotes/${quote.id}`)}
                    >
                      <div>
                        <span className="font-medium">{quote.quote_number}</span>
                        <div className="text-sm text-muted-foreground">
                          {quote.description || 'No description'}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(quote.status)}>{quote.status}</Badge>
                        <span className="font-medium">${quote.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Invoices Tab */}
        <TabsContent value="invoices">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Invoices</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate(`/gunsmith/invoices/new?customer=${customerId}`)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Invoice
              </Button>
            </CardHeader>
            <CardContent>
              {invoicesLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : invoices?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No invoices found</p>
              ) : (
                <div className="space-y-3">
                  {invoices?.map((invoice) => (
                    <div 
                      key={invoice.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors cursor-pointer"
                      onClick={() => navigate(`/gunsmith/invoices/${invoice.id}`)}
                    >
                      <div>
                        <span className="font-medium">{invoice.invoice_number}</span>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(invoice.created_at), 'MMM d, yyyy')}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                        <span className="font-medium">${invoice.total?.toFixed(2) || '0.00'}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appointments Tab */}
        <TabsContent value="appointments">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Appointments</CardTitle>
              <Button 
                size="sm" 
                onClick={() => navigate(`/gunsmith/appointments/new?customer=${customerId}`)}
                className="bg-amber-600 hover:bg-amber-700"
              >
                <Plus className="h-4 w-4 mr-1" />
                New Appointment
              </Button>
            </CardHeader>
            <CardContent>
              {appointmentsLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-16 w-full" />)}
                </div>
              ) : appointments?.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No appointments found</p>
              ) : (
                <div className="space-y-3">
                  {appointments?.map((appt) => (
                    <div 
                      key={appt.id}
                      className="flex items-center justify-between p-4 bg-muted/50 rounded-lg hover:bg-muted/70 transition-colors"
                    >
                      <div>
                        <span className="font-medium">{appt.appointment_type}</span>
                        <div className="text-sm text-muted-foreground">
                          {format(new Date(appt.appointment_date), 'MMM d, yyyy h:mm a')}
                        </div>
                      </div>
                      <Badge className={getStatusColor(appt.status)}>{appt.status}</Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Edit Dialog */}
      <EditGunsmithCustomerDialog
        customer={customer}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
        onSave={() => {
          refetchCustomer();
          setEditDialogOpen(false);
        }}
      />
    </div>
  );
}
