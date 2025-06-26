
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertCircle, CheckCircle, Clock, RefreshCw } from 'lucide-react';
import { databaseHealthMonitor } from '@/services/database/DatabaseHealthMonitor';
import { hardcodedWorkOrderService } from '@/services/workOrder/HardcodedWorkOrderService';
import { startupDiagnostics, DiagnosticResult } from '@/services/database/StartupDiagnostics';

export function DatabaseStatusIndicator() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date | null>(null);

  const refreshDiagnostics = async () => {
    setIsRefreshing(true);
    try {
      const results = await startupDiagnostics.runStartupDiagnostics();
      setDiagnostics(results);
      setLastCheck(new Date());
    } catch (error) {
      console.error('Failed to refresh diagnostics:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    // Load initial diagnostics
    const initialResults = startupDiagnostics.getLastResults();
    if (initialResults.length > 0) {
      setDiagnostics(initialResults);
    } else {
      refreshDiagnostics();
    }
  }, []);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800';
      case 'error':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const overallStatus = diagnostics.some(d => d.status === 'error') ? 'error' :
    diagnostics.some(d => d.status === 'warning') ? 'warning' : 'success';

  const cacheStatus = hardcodedWorkOrderService.getCacheStatus();

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold flex items-center gap-2">
          {getStatusIcon(overallStatus)}
          Database Status
        </CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={refreshDiagnostics}
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Overall Status */}
        <div className="flex items-center justify-between">
          <span className="font-medium">Overall Status:</span>
          <Badge className={getStatusColor(overallStatus)}>
            {overallStatus.toUpperCase()}
          </Badge>
        </div>

        {/* Individual Components */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Components:</h4>
          {diagnostics.map((diagnostic, index) => (
            <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
              <div className="flex items-center gap-2">
                {getStatusIcon(diagnostic.status)}
                <span className="text-sm font-medium">{diagnostic.component}</span>
              </div>
              <Badge className={getStatusColor(diagnostic.status)} variant="outline">
                {diagnostic.status}
              </Badge>
            </div>
          ))}
        </div>

        {/* Cache Status */}
        <div className="space-y-2">
          <h4 className="font-medium text-sm text-gray-700">Cache Status:</h4>
          <div className="p-2 bg-blue-50 rounded">
            <div className="flex justify-between text-sm">
              <span>Cached Items:</span>
              <span className="font-medium">{cacheStatus.size}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Last Fetch:</span>
              <span className="font-medium">
                {cacheStatus.lastFetch ? 
                  new Date(cacheStatus.lastFetch).toLocaleTimeString() : 
                  'Never'
                }
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Cache Age:</span>
              <span className="font-medium">
                {cacheStatus.cacheAge ? 
                  `${Math.round(cacheStatus.cacheAge / 1000)}s` : 
                  'N/A'
                }
              </span>
            </div>
          </div>
        </div>

        {/* Last Check */}
        {lastCheck && (
          <div className="text-xs text-gray-500 text-center">
            Last checked: {lastCheck.toLocaleString()}
          </div>
        )}

        {/* Error Details */}
        {diagnostics.some(d => d.status === 'error') && (
          <div className="space-y-2">
            <h4 className="font-medium text-sm text-red-700">Error Details:</h4>
            {diagnostics
              .filter(d => d.status === 'error')
              .map((diagnostic, index) => (
                <div key={index} className="p-2 bg-red-50 rounded text-sm">
                  <div className="font-medium text-red-800">{diagnostic.component}</div>
                  <div className="text-red-700">{diagnostic.message}</div>
                </div>
              ))
            }
          </div>
        )}
      </CardContent>
    </Card>
  );
}
