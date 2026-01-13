import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { StickyNote } from 'lucide-react';

interface CustomerNotesTabProps {
  customerId: string;
}

export function CustomerNotesTab({ customerId }: CustomerNotesTabProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Notes & Activity</h3>
      <Card>
        <CardContent className="p-8 text-center">
          <StickyNote className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <p className="text-muted-foreground">Customer notes feature coming soon</p>
        </CardContent>
      </Card>
    </div>
  );
}
