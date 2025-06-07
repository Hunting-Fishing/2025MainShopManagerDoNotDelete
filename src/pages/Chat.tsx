
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function Chat() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">
          Team communication and messaging
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Team Chat</CardTitle>
          <CardDescription>Chat features will be implemented here</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">Chat functionality is under development.</p>
        </CardContent>
      </Card>
    </div>
  );
}
