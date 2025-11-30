import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSafetyCertifications } from '@/hooks/useSafetyCertifications';
import { Award, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format } from 'date-fns';

export default function SafetyCertifications() {
  const { loading, certificates, getExpiredCertificates, getExpiringCertificates, getValidCertificates } = useSafetyCertifications();

  const expired = getExpiredCertificates();
  const expiring = getExpiringCertificates(30);
  const valid = getValidCertificates();

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-3">
          {[1,2,3].map(i => <Skeleton key={i} className="h-32" />)}
        </div>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Safety Certifications | Safety</title>
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Award className="h-8 w-8 text-primary" />
            Safety Certifications
          </h1>
          <p className="text-muted-foreground mt-1">Staff certifications and training records</p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-red-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-500" />
                Expired
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{expired.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border-yellow-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Expiring (30 days)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-yellow-600">{expiring.length}</p>
            </CardContent>
          </Card>
          
          <Card className="border-green-200">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                Valid
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{valid.length}</p>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="all">
          <TabsList>
            <TabsTrigger value="all">All ({certificates.length})</TabsTrigger>
            <TabsTrigger value="expired" className="text-red-600">Expired ({expired.length})</TabsTrigger>
            <TabsTrigger value="expiring" className="text-yellow-600">Expiring ({expiring.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-3">
            {certificates.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </TabsContent>

          <TabsContent value="expired" className="space-y-3">
            {expired.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </TabsContent>

          <TabsContent value="expiring" className="space-y-3">
            {expiring.map((cert) => (
              <CertificateCard key={cert.id} certificate={cert} />
            ))}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}

function CertificateCard({ certificate }: { certificate: any }) {
  const today = new Date().toISOString().split('T')[0];
  const isExpired = certificate.expiry_date && certificate.expiry_date < today;
  
  return (
    <Card className={isExpired ? 'border-red-200' : ''}>
      <CardContent className="py-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{certificate.certificate_type?.name || 'Certificate'}</p>
            <p className="text-sm text-muted-foreground">
              {certificate.staff?.first_name} {certificate.staff?.last_name}
            </p>
            {certificate.expiry_date && (
              <p className="text-xs text-muted-foreground">
                Expires: {format(new Date(certificate.expiry_date), 'PPP')}
              </p>
            )}
          </div>
          <Badge variant={isExpired ? 'destructive' : 'default'}>
            {isExpired ? 'Expired' : 'Valid'}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
