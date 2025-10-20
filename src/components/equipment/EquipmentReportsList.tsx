import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

export function EquipmentReportsList() {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Daily/Weekly Reports</CardTitle>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Submit Report
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Equipment reports coming soon...</p>
      </CardContent>
    </Card>
  );
}
