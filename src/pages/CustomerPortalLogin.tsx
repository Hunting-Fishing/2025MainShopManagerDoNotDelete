
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CustomerPortalLogin() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Customer Portal Login</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Customer login form will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
