
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Developer() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Developer Tools</h1>
        <p className="text-muted-foreground">
          Development and debugging tools
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Developer Console</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Developer tools will be implemented here.</p>
        </CardContent>
      </Card>
    </div>
  );
}
