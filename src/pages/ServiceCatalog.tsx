
import React from 'react';
import { Layout } from '@/components/layout/Layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function ServiceCatalog() {
  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Service Catalog</h1>
          <p className="text-muted-foreground">
            Browse and manage your automotive services
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Oil Change</CardTitle>
              <CardDescription>Standard oil change service</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$49.99</p>
              <p className="text-sm text-muted-foreground">30-45 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Brake Inspection</CardTitle>
              <CardDescription>Complete brake system inspection</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$89.99</p>
              <p className="text-sm text-muted-foreground">60-90 minutes</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Tire Rotation</CardTitle>
              <CardDescription>Tire rotation and alignment check</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">$39.99</p>
              <p className="text-sm text-muted-foreground">30 minutes</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
}
