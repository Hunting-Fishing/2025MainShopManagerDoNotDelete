import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  Plus, 
  Search,
  ArrowLeft,
  AlertTriangle,
  CheckCircle,
  Clock,
  FileText
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import { format, differenceInDays } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

const LICENSE_TYPES = [
  { value: 'PAL', label: 'PAL (Possession and Acquisition License)' },
  { value: 'RPAL', label: 'RPAL (Restricted PAL)' },
  { value: 'POL', label: 'POL (Possession Only License)' },
  { value: 'MINOR', label: 'Minor\'s License' }
];

const PROVINCES = [
  'AB', 'BC', 'MB', 'NB', 'NL', 'NS', 'NT', 'NU', 'ON', 'PE', 'QC', 'SK', 'YT'
];

export default function GunsmithCompliance() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    license_type: '',
    license_number: '',
    issue_date: '',
    expiry_date: '',
    province: ''
  });

  const { data: licenses, isLoading } = useQuery({
    queryKey: ['gunsmith-licenses'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_customer_licenses')
        .select('*, customers(first_name, last_name)')
        .order('expiry_date');
      if (error) throw error;
      return data;
    }
  });

  const { data: records } = useQuery({
    queryKey: ['gunsmith-acquisition-records'],
    queryFn: async () => {
      const { data, error } = await (supabase as any)
        .from('gunsmith_acquisition_records')
        .select('*, customers(first_name, last_name)')
        .order('transaction_date', { ascending: false })
        .limit(50);
      if (error) throw error;
      return data;
    }
  });

  const { data: customers } = useQuery({
    queryKey: ['customers'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customers')
        .select('id, first_name, last_name')
        .order('first_name');
      if (error) throw error;
      return data;
    }
  });

  const createLicense = useMutation({
    mutationFn: async (data: typeof formData) => {
      const { error } = await (supabase as any)
        .from('gunsmith_customer_licenses')
        .insert({
          customer_id: data.customer_id,
          license_type: data.license_type,
          license_number: data.license_number,
          issue_date: data.issue_date || null,
          expiry_date: data.expiry_date,
          province: data.province || null
        });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-licenses'] });
      toast({ title: 'License added successfully' });
      setIsDialogOpen(false);
      setFormData({ customer_id: '', license_type: '', license_number: '', issue_date: '', expiry_date: '', province: '' });
    },
    onError: () => {
      toast({ title: 'Failed to add license', variant: 'destructive' });
    }
  });

  const verifyLicense = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase as any)
        .from('gunsmith_customer_licenses')
        .update({ verified: true, verified_date: new Date().toISOString().split('T')[0] })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gunsmith-licenses'] });
      toast({ title: 'License verified' });
    }
  });

  const filteredLicenses = licenses?.filter((l: any) => 
    l.license_number?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.customers?.first_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.customers?.last_name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getLicenseStatus = (expiryDate: string) => {
    const days = differenceInDays(new Date(expiryDate), new Date());
    if (days < 0) return { status: 'Expired', color: 'destructive', icon: AlertTriangle };
    if (days <= 30) return { status: 'Expiring Soon', color: 'warning', icon: Clock };
    return { status: 'Valid', color: 'default', icon: CheckCircle };
  };

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="mb-8 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate('/gunsmith')}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Shield className="h-8 w-8 text-red-500" />
              Compliance
            </h1>
            <p className="text-muted-foreground mt-1">Canadian firearms license tracking & records</p>
          </div>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add License
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Customer License</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Customer *</Label>
                <Select value={formData.customer_id} onValueChange={(v) => setFormData({ ...formData, customer_id: v })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select customer" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers?.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.first_name} {c.last_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>License Type *</Label>
                  <Select value={formData.license_type} onValueChange={(v) => setFormData({ ...formData, license_type: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LICENSE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Province</Label>
                  <Select value={formData.province} onValueChange={(v) => setFormData({ ...formData, province: v })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {PROVINCES.map((p) => (
                        <SelectItem key={p} value={p}>{p}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>License Number *</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => setFormData({ ...formData, license_number: e.target.value })}
                  placeholder="Enter PAL/RPAL number"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Issue Date</Label>
                  <Input
                    type="date"
                    value={formData.issue_date}
                    onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>Expiry Date *</Label>
                  <Input
                    type="date"
                    value={formData.expiry_date}
                    onChange={(e) => setFormData({ ...formData, expiry_date: e.target.value })}
                  />
                </div>
              </div>
              <Button 
                className="w-full" 
                onClick={() => createLicense.mutate(formData)}
                disabled={!formData.customer_id || !formData.license_type || !formData.license_number || !formData.expiry_date || createLicense.isPending}
              >
                {createLicense.isPending ? 'Adding...' : 'Add License'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="licenses" className="space-y-6">
        <TabsList>
          <TabsTrigger value="licenses" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            PAL/RPAL Licenses
          </TabsTrigger>
          <TabsTrigger value="records" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Acquisition Records
          </TabsTrigger>
        </TabsList>

        <TabsContent value="licenses">
          <div className="mb-6 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search licenses..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Customer Licenses</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full" />)}
                </div>
              ) : filteredLicenses?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No licenses on file</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredLicenses?.map((license: any) => {
                    const status = getLicenseStatus(license.expiry_date);
                    return (
                      <div key={license.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-1">
                            <span className="font-medium">
                              {license.customers?.first_name} {license.customers?.last_name}
                            </span>
                            <Badge variant={status.color as any}>
                              <status.icon className="h-3 w-3 mr-1" />
                              {status.status}
                            </Badge>
                            {license.verified && (
                              <Badge variant="outline" className="text-green-600 border-green-600">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Verified
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-muted-foreground">
                            {license.license_type} • {license.license_number}
                            {license.province && ` • ${license.province}`}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Expires: {format(new Date(license.expiry_date), 'MMM d, yyyy')}
                          </p>
                        </div>
                        <div>
                          {!license.verified && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => verifyLicense.mutate(license.id)}
                            >
                              Verify
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="records">
          <Card>
            <CardHeader>
              <CardTitle>Acquisition & Disposition Records</CardTitle>
            </CardHeader>
            <CardContent>
              {records?.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No records yet</p>
                  <p className="text-sm">Records will be created automatically when transfers are completed</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {records?.map((record: any) => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <Badge variant="outline">{record.transaction_type}</Badge>
                          <span className="font-medium">
                            {record.firearm_make} {record.firearm_model}
                          </span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {record.customers?.first_name} {record.customers?.last_name}
                          {record.firearm_serial && ` • S/N: ${record.firearm_serial}`}
                        </p>
                        {record.pal_rpal_number && (
                          <p className="text-sm text-muted-foreground">
                            PAL/RPAL: {record.pal_rpal_number}
                          </p>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-sm">
                          {format(new Date(record.transaction_date), 'MMM d, yyyy')}
                        </p>
                        {record.sale_price && (
                          <p className="text-sm text-green-600">${record.sale_price.toFixed(2)}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
