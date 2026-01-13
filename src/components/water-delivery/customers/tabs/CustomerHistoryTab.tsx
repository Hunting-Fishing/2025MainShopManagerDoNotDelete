import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { History, TrendingUp, Droplet, Calendar, Truck, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, subMonths, differenceInDays, parseISO } from 'date-fns';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface CustomerHistoryTabProps {
  customerId: string;
}

interface DeliveryCompletion {
  id: string;
  delivery_date: string;
  gallons_delivered: number | null;
  tank_level_before: number | null;
  tank_level_after: number | null;
  notes: string | null;
  total_amount: number | null;
  water_delivery_orders: {
    order_number: string;
  } | null;
  water_delivery_drivers: {
    first_name: string;
    last_name: string;
  } | null;
}

export function CustomerHistoryTab({ customerId }: CustomerHistoryTabProps) {
  // Fetch delivery completions for this customer
  const { data: completions, isLoading } = useQuery({
    queryKey: ['water-delivery-history', customerId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('water_delivery_completions')
        .select(`
          id,
          delivery_date,
          gallons_delivered,
          tank_level_before,
          tank_level_after,
          notes,
          total_amount,
          water_delivery_orders (
            order_number
          ),
          water_delivery_drivers (
            first_name,
            last_name
          )
        `)
        .eq('customer_id', customerId)
        .order('delivery_date', { ascending: false });
      
      if (error) throw error;
      return (data || []) as DeliveryCompletion[];
    },
    enabled: !!customerId,
  });

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (!completions || completions.length === 0) {
      return {
        totalDeliveries: 0,
        totalGallons: 0,
        avgGallons: 0,
        avgDaysBetween: 0,
        thisYearGallons: 0,
        lastYearGallons: 0,
        yearOverYearChange: 0,
      };
    }

    const now = new Date();
    const thisYearStart = new Date(now.getFullYear(), 0, 1);
    const lastYearStart = new Date(now.getFullYear() - 1, 0, 1);
    const lastYearEnd = new Date(now.getFullYear() - 1, 11, 31);

    const totalGallons = completions.reduce((sum, c) => sum + (c.gallons_delivered || 0), 0);
    const avgGallons = totalGallons / completions.length;

    // Calculate avg days between deliveries
    let totalDays = 0;
    let intervals = 0;
    for (let i = 1; i < completions.length; i++) {
      const days = differenceInDays(
        parseISO(completions[i - 1].delivery_date),
        parseISO(completions[i].delivery_date)
      );
      totalDays += days;
      intervals++;
    }
    const avgDaysBetween = intervals > 0 ? totalDays / intervals : 0;

    // Year over year
    const thisYearGallons = completions
      .filter(c => parseISO(c.delivery_date) >= thisYearStart)
      .reduce((sum, c) => sum + (c.gallons_delivered || 0), 0);

    const lastYearGallons = completions
      .filter(c => {
        const date = parseISO(c.delivery_date);
        return date >= lastYearStart && date <= lastYearEnd;
      })
      .reduce((sum, c) => sum + (c.gallons_delivered || 0), 0);

    const yearOverYearChange = lastYearGallons > 0
      ? ((thisYearGallons - lastYearGallons) / lastYearGallons) * 100
      : 0;

    return {
      totalDeliveries: completions.length,
      totalGallons,
      avgGallons,
      avgDaysBetween,
      thisYearGallons,
      lastYearGallons,
      yearOverYearChange,
    };
  }, [completions]);

  // Prepare monthly chart data (last 12 months)
  const chartData = React.useMemo(() => {
    if (!completions) return [];

    const months: { [key: string]: number } = {};
    const now = new Date();

    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const month = subMonths(now, i);
      const key = format(month, 'MMM yyyy');
      months[key] = 0;
    }

    // Aggregate gallons by month
    completions.forEach(c => {
      const date = parseISO(c.delivery_date);
      const key = format(date, 'MMM yyyy');
      if (months[key] !== undefined) {
        months[key] += c.gallons_delivered || 0;
      }
    });

    return Object.entries(months).map(([month, gallons]) => ({
      month,
      gallons: Math.round(gallons),
    }));
  }, [completions]);

  const getDriverName = (driver: DeliveryCompletion['water_delivery_drivers']) => {
    if (!driver) return '-';
    return `${driver.first_name} ${driver.last_name}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
        <Skeleton className="h-64" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Deliveries</p>
                <p className="text-2xl font-bold">{stats.totalDeliveries}</p>
              </div>
              <Truck className="h-8 w-8 text-cyan-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Delivery Size</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgGallons).toLocaleString()} gal</p>
              </div>
              <Droplet className="h-8 w-8 text-cyan-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Frequency</p>
                <p className="text-2xl font-bold">{Math.round(stats.avgDaysBetween)} days</p>
              </div>
              <Calendar className="h-8 w-8 text-cyan-600 opacity-50" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Year-over-Year</p>
                <div className="flex items-center gap-2">
                  <p className="text-2xl font-bold">
                    {stats.yearOverYearChange >= 0 ? '+' : ''}{stats.yearOverYearChange.toFixed(1)}%
                  </p>
                  {stats.yearOverYearChange >= 0 ? (
                    <ArrowUpRight className="h-5 w-5 text-green-600" />
                  ) : (
                    <ArrowDownRight className="h-5 w-5 text-red-600" />
                  )}
                </div>
              </div>
              <TrendingUp className="h-8 w-8 text-cyan-600 opacity-50" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-cyan-600" />
            Monthly Usage Trend (Last 12 Months)
          </CardTitle>
        </CardHeader>
        <CardContent>
          {chartData.length > 0 && stats.totalDeliveries > 0 ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorGallons" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis 
                    dataKey="month" 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    className="text-muted-foreground"
                  />
                  <YAxis 
                    tick={{ fontSize: 12 }}
                    tickLine={false}
                    className="text-muted-foreground"
                    tickFormatter={(value) => `${value.toLocaleString()}`}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--background))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number) => [`${value.toLocaleString()} gallons`, 'Delivered']}
                  />
                  <Area
                    type="monotone"
                    dataKey="gallons"
                    stroke="hsl(var(--primary))"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorGallons)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-muted-foreground">
              No delivery data available for chart
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delivery History Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <History className="h-5 w-5 text-cyan-600" />
            Delivery History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {completions && completions.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Date</TableHead>
                  <TableHead>Order #</TableHead>
                  <TableHead>Gallons</TableHead>
                  <TableHead>Driver</TableHead>
                  <TableHead>Tank Level</TableHead>
                  <TableHead>Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {completions.map((completion) => (
                  <TableRow key={completion.id}>
                    <TableCell>
                      {format(parseISO(completion.delivery_date), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {completion.water_delivery_orders?.order_number || '-'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">
                      {completion.gallons_delivered?.toLocaleString() || '-'} gal
                    </TableCell>
                    <TableCell>{getDriverName(completion.water_delivery_drivers)}</TableCell>
                    <TableCell>
                      {completion.tank_level_before != null && completion.tank_level_after != null ? (
                        <span className="text-sm">
                          {completion.tank_level_before}% → {completion.tank_level_after}%
                        </span>
                      ) : '-'}
                    </TableCell>
                    <TableCell>
                      ${completion.total_amount?.toFixed(2) || '0.00'}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <Alert>
              <AlertDescription>
                No delivery history found for this customer. Completed deliveries will appear here.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>
    </div>
  );
}