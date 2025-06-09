
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, AlertTriangle, Calendar, Clock, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { WorkOrderPart } from '@/types/workOrderPart';
import { format, differenceInDays, addDays, addMonths, addYears } from 'date-fns';

interface WarrantyStatus {
  part: WorkOrderPart;
  daysRemaining: number;
  status: 'active' | 'expiring' | 'expired' | 'no-warranty';
  expiryDate: Date | null;
}

export function PartsWarrantyTracking() {
  const [warranties, setWarranties] = useState<WarrantyStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWarrantyData();
  }, []);

  const loadWarrantyData = async () => {
    try {
      setLoading(true);
      
      const { data: parts, error } = await supabase
        .from('work_order_parts')
        .select('*')
        .eq('status', 'installed');

      if (error) throw error;

      if (!parts || parts.length === 0) {
        setWarranties([]);
        return;
      }

      const warrantyStatuses = parts.map(part => {
        let expiryDate: Date | null = null;
        let daysRemaining = 0;
        let status: 'active' | 'expiring' | 'expired' | 'no-warranty' = 'no-warranty';

        if (part.warranty_expiry_date) {
          expiryDate = new Date(part.warranty_expiry_date);
          daysRemaining = differenceInDays(expiryDate, new Date());
          
          if (daysRemaining < 0) {
            status = 'expired';
          } else if (daysRemaining <= 30) {
            status = 'expiring';
          } else {
            status = 'active';
          }
        } else if (part.warranty_duration && part.warranty_duration !== 'No Warranty' && part.install_date) {
          // Calculate expiry date from install date and warranty duration
          const installDate = new Date(part.install_date);
          
          switch (part.warranty_duration) {
            case '30 Days':
              expiryDate = addDays(installDate, 30);
              break;
            case '90 Days':
              expiryDate = addDays(installDate, 90);
              break;
            case '6 Months':
              expiryDate = addMonths(installDate, 6);
              break;
            case '1 Year':
              expiryDate = addYears(installDate, 1);
              break;
            case '2 Years':
              expiryDate = addYears(installDate, 2);
              break;
            case '3 Years':
              expiryDate = addYears(installDate, 3);
              break;
            case 'Lifetime':
              status = 'active';
              daysRemaining = 999999; // Represent as "never expires"
              break;
            default:
              status = 'no-warranty';
          }

          if (expiryDate && part.warranty_duration !== 'Lifetime') {
            daysRemaining = differenceInDays(expiryDate, new Date());
            
            if (daysRemaining < 0) {
              status = 'expired';
            } else if (daysRemaining <= 30) {
              status = 'expiring';
            } else {
              status = 'active';
            }
          }
        }

        return {
          part,
          daysRemaining,
          status,
          expiryDate
        };
      });

      // Sort by days remaining (ascending)
      warrantyStatuses.sort((a, b) => {
        if (a.status === 'expired' && b.status !== 'expired') return -1;
        if (b.status === 'expired' && a.status !== 'expired') return 1;
        if (a.status === 'expiring' && b.status === 'active') return -1;
        if (b.status === 'expiring' && a.status === 'active') return 1;
        return a.daysRemaining - b.daysRemaining;
      });

      setWarranties(warrantyStatuses);

    } catch (error) {
      console.error('Error loading warranty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: WarrantyStatus['status']) => {
    const variants = {
      'active': 'bg-green-100 text-green-800',
      'expiring': 'bg-yellow-100 text-yellow-800',
      'expired': 'bg-red-100 text-red-800',
      'no-warranty': 'bg-gray-100 text-gray-800'
    };

    const labels = {
      'active': 'Active',
      'expiring': 'Expiring Soon',
      'expired': 'Expired',
      'no-warranty': 'No Warranty'
    };

    return (
      <Badge className={variants[status]}>
        {labels[status]}
      </Badge>
    );
  };

  const getStatusIcon = (status: WarrantyStatus['status']) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'expiring': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'expired': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'no-warranty': return <Shield className="h-4 w-4 text-gray-600" />;
    }
  };

  const formatDaysRemaining = (daysRemaining: number, status: WarrantyStatus['status']) => {
    if (status === 'no-warranty') return 'No Warranty';
    if (daysRemaining > 999) return 'Lifetime';
    if (daysRemaining < 0) return `Expired ${Math.abs(daysRemaining)} days ago`;
    if (daysRemaining === 0) return 'Expires today';
    if (daysRemaining === 1) return '1 day remaining';
    return `${daysRemaining} days remaining`;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  <div className="h-8 bg-gray-200 rounded w-3/4"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  const activeWarranties = warranties.filter(w => w.status === 'active').length;
  const expiringWarranties = warranties.filter(w => w.status === 'expiring').length;
  const expiredWarranties = warranties.filter(w => w.status === 'expired').length;
  const noWarrantyParts = warranties.filter(w => w.status === 'no-warranty').length;

  return (
    <div className="space-y-6">
      <Alert>
        <Shield className="h-4 w-4" />
        <AlertDescription>
          Warranty tracking for installed parts. Monitor coverage, expiration dates, and get alerts for expiring warranties.
        </AlertDescription>
      </Alert>

      {/* Warranty Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Active Warranties
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeWarranties}</div>
            <Badge variant="outline" className="mt-1 bg-green-50 text-green-700">Protected</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Expiring Soon
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiringWarranties}</div>
            <Badge variant="outline" className="mt-1 bg-yellow-50 text-yellow-700">
              {expiringWarranties > 0 ? 'Action Needed' : 'All Good'}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Expired
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{expiredWarranties}</div>
            <Badge variant="outline" className="mt-1 bg-red-50 text-red-700">No Coverage</Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <Shield className="h-4 w-4" />
              No Warranty
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{noWarrantyParts}</div>
            <Badge variant="outline" className="mt-1 bg-gray-50 text-gray-700">No Coverage</Badge>
          </CardContent>
        </Card>
      </div>

      {/* Warranty Alerts */}
      {expiringWarranties > 0 && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            You have {expiringWarranties} warranties expiring within 30 days. Consider proactive customer outreach for warranty claims or renewals.
          </AlertDescription>
        </Alert>
      )}

      {/* Warranty List */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty Status Details</CardTitle>
          <CardDescription>
            Complete warranty information for all installed parts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {warranties.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-lg">
                <Shield className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">No installed parts with warranty information</p>
              </div>
            ) : (
              warranties.map((warranty) => (
                <div key={warranty.part.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        {getStatusIcon(warranty.status)}
                        <h3 className="font-medium">{warranty.part.part_name}</h3>
                        {getStatusBadge(warranty.status)}
                        {warranty.part.category && (
                          <Badge variant="outline">{warranty.part.category}</Badge>
                        )}
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm text-muted-foreground">
                        <div>
                          <span className="font-medium">Part #:</span> {warranty.part.part_number || 'N/A'}
                        </div>
                        <div>
                          <span className="font-medium">Warranty:</span> {warranty.part.warranty_duration || 'None'}
                        </div>
                        <div>
                          <span className="font-medium">Install Date:</span> {
                            warranty.part.install_date 
                              ? format(new Date(warranty.part.install_date), 'MMM dd, yyyy')
                              : 'N/A'
                          }
                        </div>
                        <div>
                          <span className="font-medium">Expires:</span> {
                            warranty.expiryDate 
                              ? format(warranty.expiryDate, 'MMM dd, yyyy')
                              : 'N/A'
                          }
                        </div>
                      </div>

                      <div className="flex items-center gap-4 text-sm">
                        <span className="font-medium">Status:</span>
                        <span className={
                          warranty.status === 'expired' ? 'text-red-600' :
                          warranty.status === 'expiring' ? 'text-yellow-600' :
                          warranty.status === 'active' ? 'text-green-600' :
                          'text-gray-600'
                        }>
                          {formatDaysRemaining(warranty.daysRemaining, warranty.status)}
                        </span>
                        
                        {warranty.part.installed_by && (
                          <>
                            <span className="text-gray-300">•</span>
                            <span>Installed by: {warranty.part.installed_by}</span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {warranty.status === 'expiring' && (
                        <Button variant="outline" size="sm">
                          <Calendar className="h-4 w-4 mr-2" />
                          Contact Customer
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
