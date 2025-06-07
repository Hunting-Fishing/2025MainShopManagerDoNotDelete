
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';

interface EmailAnalyticsDashboardProps {
  shopId: string | null | undefined;
}

const EmailAnalyticsDashboard: React.FC<EmailAnalyticsDashboardProps> = ({ shopId }) => {
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
  }, [shopId]);

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-2xl font-semibold">Email Analytics</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading email analytics...</p>}
        {error && <p className="text-red-500">Error: {error}</p>}
        {!loading && !error && (
          <Tabs defaultValue="overview" className="space-y-4">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-2">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{campaigns.length}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Opens</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaigns.reduce((sum: number, campaign: any) => sum + (campaign.opened || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Clicks</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaigns.reduce((sum: number, campaign: any) => sum + (campaign.clicked || 0), 0)}
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Average Open Rate</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {campaigns.length > 0 ? 
                        Math.round(campaigns.reduce((sum: number, campaign: any) => {
                          const openRate = campaign.total_recipients > 0 ? (campaign.opened || 0) / campaign.total_recipients * 100 : 0;
                          return sum + openRate;
                        }, 0) / campaigns.length) : 0}%
                    </div>
                  </CardContent>
                </Card>
              </div>
            </TabsContent>
            <TabsContent value="campaigns" className="space-y-2">
              <div className="space-y-4">
                {campaigns.map((campaign: any) => (
                  <Card key={campaign.id}>
                    <CardHeader>
                      <CardTitle className="text-lg">{campaign.name}</CardTitle>
                      <CardDescription>{campaign.subject}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-4 gap-4 text-center">
                        <div>
                          <p className="text-2xl font-bold">{campaign.total_recipients || 0}</p>
                          <p className="text-sm text-muted-foreground">Recipients</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.opened || 0}</p>
                          <p className="text-sm text-muted-foreground">Opens</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">{campaign.clicked || 0}</p>
                          <p className="text-sm text-muted-foreground">Clicks</p>
                        </div>
                        <div>
                          <p className="text-2xl font-bold">
                            {campaign.total_recipients > 0 ? 
                              Math.round((campaign.opened || 0) / campaign.total_recipients * 100) : 0}%
                          </p>
                          <p className="text-sm text-muted-foreground">Open Rate</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default EmailAnalyticsDashboard;
