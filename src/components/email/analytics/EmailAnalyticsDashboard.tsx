import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CalendarDateRangePicker } from '@/components/ui/date-range-picker';
import { supabase } from '@/integrations/supabase/client';
import { EmailMetricsOverview } from './EmailMetricsOverview';
import { CampaignPerformanceChart } from './CampaignPerformanceChart';
import { TopPerformingCampaigns } from './TopPerformingCampaigns';

interface EmailAnalyticsDashboardProps {
  shopId: string | null | undefined;
}

const EmailAnalyticsDashboard: React.FC<EmailAnalyticsDashboardProps> = ({ shopId }) => {
  const [dateRange, setDateRange] = React.useState<Range<Date> | undefined>({
    from: new Date(new Date().setDate(new Date().getDate() - 30)),
    to: new Date(),
  });
  const [campaigns, setCampaigns] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCampaigns = async () => {
      if (!shopId) {
        console.warn('No shop ID provided, skipping campaign fetch.');
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const { data, error } = await supabase
          .from('email_campaigns')
          .select('*')
          .eq('shop_id', shopId)
          .gte('created_at', dateRange?.from?.toISOString() || '')
          .lte('created_at', dateRange?.to?.toISOString() || '')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('Error fetching campaigns:', error);
          setError('Failed to load email campaigns.');
        } else {
          setCampaigns(data || []);
        }
      } catch (err) {
        console.error('Error fetching campaigns:', err);
        setError('Failed to load email campaigns.');
      } finally {
        setLoading(false);
      }
    };

    fetchCampaigns();
  }, [shopId, dateRange]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">Email Analytics</CardTitle>
        <CalendarDateRangePicker onDateChange={setDateRange} />
      </CardHeader>
      <CardContent>
        {loading && <p>Loading email analytics...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaign Performance</TabsTrigger>
              <TabsTrigger value="top">Top Campaigns</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <EmailMetricsOverview campaigns={campaigns} />
              </div>
            </TabsContent>
            <TabsContent value="campaigns" className="space-y-2">
              <CampaignPerformanceChart campaigns={campaigns} />
            </TabsContent>
            <TabsContent value="top" className="space-y-2">
              <TopPerformingCampaigns campaigns={campaigns} />
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailAnalyticsDashboard;
