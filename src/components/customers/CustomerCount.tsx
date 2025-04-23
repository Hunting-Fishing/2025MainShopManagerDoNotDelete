
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, Loader2, AlertCircle } from 'lucide-react';

interface CustomerCountProps {
  loading?: boolean;
  error?: boolean;
  count: number;
}

export const CustomerCount: React.FC<CustomerCountProps> = ({ loading = false, error = false, count = 0 }) => {
  return (
    <Card className="border border-gray-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Total Customers</CardTitle>
        {loading ? (
          <Loader2 className="h-4 w-4 text-muted-foreground animate-spin" />
        ) : error ? (
          <AlertCircle className="h-4 w-4 text-red-500" />
        ) : (
          <Users className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="h-6 w-12 bg-gray-200 animate-pulse rounded-md" />
        ) : error ? (
          <div className="text-2xl font-bold text-red-500">-</div>
        ) : (
          <div className="text-2xl font-bold">{count}</div>
        )}
      </CardContent>
    </Card>
  );
};
