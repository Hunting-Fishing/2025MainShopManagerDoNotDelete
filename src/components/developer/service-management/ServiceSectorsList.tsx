
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Loader2, Building } from 'lucide-react';

export function ServiceSectorsList() {
  const { sectors, loading, error } = useServiceSectors();

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Sectors</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Service Sectors</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-red-600">Error loading service sectors: {error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Service Sectors ({sectors.length})</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {sectors.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Building className="h-12 w-12 mx-auto mb-4 text-gray-300" />
            <p>No service sectors found</p>
            <p className="text-sm">Import services to populate the hierarchy</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {sectors.map((sector) => (
              <div key={sector.id} className="border rounded-lg p-4">
                <h3 className="font-semibold text-lg mb-2">{sector.name}</h3>
                <div className="text-sm text-gray-600">
                  <p>{sector.categories.length} categories</p>
                  <p>
                    {sector.categories.reduce((total, cat) => 
                      total + cat.subcategories.reduce((subTotal, sub) => 
                        subTotal + sub.jobs.length, 0), 0)} total services
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
