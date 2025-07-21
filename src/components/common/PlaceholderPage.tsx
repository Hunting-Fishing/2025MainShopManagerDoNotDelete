
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertTriangle } from 'lucide-react';

interface PlaceholderPageProps {
  title: string;
  description?: string;
}

// DEPRECATED: This component should no longer be used.
// All routes should use real page components instead.
export function PlaceholderPage({ title, description }: PlaceholderPageProps) {
  const navigate = useNavigate();

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Button>
      </div>
      
      <Card className="border-orange-200 bg-orange-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-orange-800">
            <AlertTriangle className="h-5 w-5" />
            {title} - Development Notice
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-orange-700 space-y-4">
            <p>
              This page is using a deprecated placeholder component. 
              {description ? ` ${description}` : ` ${title} functionality should be implemented with a real page component.`}
            </p>
            <p className="text-sm">
              <strong>Developer Note:</strong> Replace this PlaceholderPage with a proper page component 
              that connects to real data and provides actual functionality.
            </p>
            <div className="mt-4">
              <Button variant="outline" onClick={() => navigate('/dashboard')}>
                Return to Dashboard
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
