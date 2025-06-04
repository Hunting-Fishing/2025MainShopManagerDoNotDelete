
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, AlertTriangle } from 'lucide-react';

interface ServiceDuplicateResolverProps {
  duplicates: any[];
  resolutions: Record<string, string>;
  onUpdateResolution: (itemId: string, action: string) => void;
  onBack: () => void;
  onProceed: () => void;
}

export const ServiceDuplicateResolver: React.FC<ServiceDuplicateResolverProps> = ({
  duplicates,
  resolutions,
  onUpdateResolution,
  onBack,
  onProceed
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-yellow-600" />
          Resolve Duplicates
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <p className="text-sm text-yellow-700">
            Found {duplicates.length} potential duplicates. Choose how to handle each one:
          </p>
        </div>

        <div className="space-y-3">
          {duplicates.map((duplicate, index) => (
            <div key={index} className="border rounded-lg p-3">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h4 className="font-medium">{duplicate.name}</h4>
                  <p className="text-sm text-gray-600">{duplicate.category}</p>
                </div>
                <Badge variant="outline">Duplicate</Badge>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant={resolutions[duplicate.id] === 'skip' ? 'default' : 'outline'}
                  onClick={() => onUpdateResolution(duplicate.id, 'skip')}
                >
                  Skip
                </Button>
                <Button
                  size="sm"
                  variant={resolutions[duplicate.id] === 'replace' ? 'default' : 'outline'}
                  onClick={() => onUpdateResolution(duplicate.id, 'replace')}
                >
                  Replace
                </Button>
                <Button
                  size="sm"
                  variant={resolutions[duplicate.id] === 'rename' ? 'default' : 'outline'}
                  onClick={() => onUpdateResolution(duplicate.id, 'rename')}
                >
                  Rename
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <Button onClick={onProceed}>
            Proceed with Import
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
