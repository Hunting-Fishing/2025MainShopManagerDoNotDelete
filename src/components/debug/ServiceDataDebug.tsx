
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Bug, Database, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceDebugInfo } from '@/components/developer/service-management/ServiceDebugInfo';

export const ServiceDataDebug: React.FC = () => {
  const { categories, loading, error, refetch } = useServiceCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <Button variant="outline" size="sm" className="mb-4" asChild>
          <Link to="/developer">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Developer Console
          </Link>
        </Button>
        <div className="flex items-center gap-3 mb-2">
          <Bug className="h-8 w-8 text-red-600" />
          <h1 className="text-3xl font-bold">Service Data Debug</h1>
        </div>
        <p className="text-slate-600 dark:text-slate-300">
          Debug and analyze service data issues using live database information
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <Database className="h-5 w-5 text-blue-600" />
          <span className="font-medium">Live Database Connection</span>
          <Badge variant={error ? "destructive" : "success"}>
            {error ? "Error" : "Connected"}
          </Badge>
        </div>
        <Button onClick={refetch} disabled={loading} className="gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh Data
        </Button>
      </div>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <Bug className="h-4 w-4" />
          <AlertDescription>
            <strong>Database Error:</strong> {error}
          </AlertDescription>
        </Alert>
      )}

      <ServiceDebugInfo 
        categories={categories}
        isLoading={loading}
        error={error}
      />
    </div>
  );
};
