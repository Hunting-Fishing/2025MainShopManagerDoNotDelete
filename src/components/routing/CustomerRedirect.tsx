
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

export const CustomerRedirect: React.FC = () => {
  const navigate = useNavigate();
  
  useEffect(() => {
    // Log the redirect for debugging purposes
    console.log('CustomerRedirect: Invalid customer ID detected, redirecting to customers list');
  }, []);

  return (
    <div className="space-y-6">
      <Alert variant="destructive">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle>Customer not found</AlertTitle>
        <AlertDescription>
          The customer you're looking for doesn't exist or the ID is invalid.
        </AlertDescription>
      </Alert>
      
      <div className="flex justify-center">
        <Button onClick={() => navigate('/customers')} variant="default">
          Return to Customers List
        </Button>
      </div>
    </div>
  );
};
