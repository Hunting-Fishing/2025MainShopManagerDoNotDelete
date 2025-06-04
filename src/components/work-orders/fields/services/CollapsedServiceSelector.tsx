
import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Plus, Settings } from 'lucide-react';

interface CollapsedServiceSelectorProps {
  onExpand: () => void;
  serviceCount: number;
}

export function CollapsedServiceSelector({ onExpand, serviceCount }: CollapsedServiceSelectorProps) {
  return (
    <Card className="border-dashed border-2 border-gray-300 bg-gray-50/50">
      <CardContent className="flex items-center justify-between p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Settings className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h4 className="font-medium text-gray-900">Service Selection</h4>
            <p className="text-sm text-gray-600">
              {serviceCount > 0 
                ? `${serviceCount} service${serviceCount !== 1 ? 's' : ''} selected`
                : 'Add services to this work order'
              }
            </p>
          </div>
        </div>
        <Button onClick={onExpand} variant="outline" size="sm">
          <Plus className="h-4 w-4 mr-2" />
          {serviceCount > 0 ? 'Add More' : 'Select Services'}
        </Button>
      </CardContent>
    </Card>
  );
}
