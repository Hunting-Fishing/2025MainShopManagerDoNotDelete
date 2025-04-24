
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle } from 'lucide-react';

export function CustomerRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      navigate('/customers');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="space-y-6 p-4">
      <Alert variant="destructive" className="border-red-500 bg-red-50">
        <AlertTriangle className="h-5 w-5" />
        <AlertTitle className="text-lg font-medium">Invalid Customer ID</AlertTitle>
        <AlertDescription className="mt-2">
          <p>The customer ID provided is invalid or not properly formatted. You will be redirected to the customers list.</p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
