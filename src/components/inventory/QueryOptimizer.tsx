import React from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RefreshCw, Database, Zap, AlertTriangle } from 'lucide-react';

export function QueryOptimizer() {
  const queryClient = useQueryClient();
  const [cacheStats, setCacheStats] = React.useState({
    totalQueries: 0,
    staleQueries: 0,
    errorQueries: 0,
    cacheSize: 0
  });

  React.useEffect(() => {
    const updateStats = () => {
      const cache = queryClient.getQueryCache();
      const queries = cache.getAll();
      
      setCacheStats({
        totalQueries: queries.length,
        staleQueries: queries.filter(q => q.isStale()).length,
        errorQueries: queries.filter(q => q.state.status === 'error').length,
        cacheSize: JSON.stringify(cache).length
      });
    };

    updateStats();
    const interval = setInterval(updateStats, 5000);
    return () => clearInterval(interval);
  }, [queryClient]);

  const clearCache = () => {
    queryClient.clear();
    console.log('🧹 Query cache cleared');
  };

  const refetchStale = () => {
    queryClient.refetchQueries({
      type: 'all',
      stale: true
    });
    console.log('🔄 Stale queries refetched');
  };

  const invalidateInventory = () => {
    queryClient.invalidateQueries({ queryKey: ['inventory-items'] });
    queryClient.invalidateQueries({ queryKey: ['inventory-filter-options'] });
    console.log('📦 Inventory queries invalidated');
  };

  if (process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Card className="w-80 bg-black/90 text-white border-gray-600 shadow-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-sm">
            <Database className="h-4 w-4" />
            <span>Query Optimizer</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="flex items-center justify-between">
              <span>Total Queries:</span>
              <Badge variant="secondary">{cacheStats.totalQueries}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Stale:</span>
              <Badge variant={cacheStats.staleQueries > 0 ? "destructive" : "secondary"}>
                {cacheStats.staleQueries}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Errors:</span>
              <Badge variant={cacheStats.errorQueries > 0 ? "destructive" : "secondary"}>
                {cacheStats.errorQueries}
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>Cache Size:</span>
              <Badge variant="outline">
                {Math.round(cacheStats.cacheSize / 1024)}KB
              </Badge>
            </div>
          </div>

          <div className="flex flex-col space-y-1">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refetchStale}
              className="h-7 text-xs"
              disabled={cacheStats.staleQueries === 0}
            >
              <RefreshCw className="h-3 w-3 mr-1" />
              Refetch Stale ({cacheStats.staleQueries})
            </Button>
            
            <Button 
              variant="outline" 
              size="sm" 
              onClick={invalidateInventory}
              className="h-7 text-xs"
            >
              <Zap className="h-3 w-3 mr-1" />
              Refresh Inventory
            </Button>
            
            <Button 
              variant="destructive" 
              size="sm" 
              onClick={clearCache}
              className="h-7 text-xs"
            >
              <AlertTriangle className="h-3 w-3 mr-1" />
              Clear Cache
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}