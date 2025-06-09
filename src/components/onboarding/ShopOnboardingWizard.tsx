
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ShopOnboardingWizard() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Shop Onboarding</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Shop onboarding wizard will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
