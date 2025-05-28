
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Wrench, Calendar, TrendingUp, Users, DollarSign, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { StatsCards } from '@/components/dashboard/StatsCards';
import { RecentWorkOrders } from '@/components/dashboard/RecentWorkOrders';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { RevenueChart } from '@/components/dashboard/RevenueChart';
import { WorkOrdersByStatusChart } from '@/components/dashboard/WorkOrdersByStatusChart';
import { TechnicianPerformanceChart } from '@/components/dashboard/TechnicianPerformanceChart';
import { ServiceTypeDistributionChart } from '@/components/dashboard/ServiceTypeDistributionChart';
import { MonthlyRevenueChart } from '@/components/dashboard/MonthlyRevenueChart';
import { DashboardSeo } from '@/components/seo/DashboardSeo';

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentActivity = async () => {
      try {
        const { data, error } = await supabase
          .from('work_orders')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(5);

        if (error) {
          console.error('Error fetching recent activity:', error);
        } else {
          setRecentActivity(data || []);
        }
      } catch (error) {
        console.error('Error fetching recent activity:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentActivity();
  }, []);

  const handleCreateWorkOrder = () => {
    navigate('/work-orders/create');
  };

  const handleViewAllWorkOrders = () => {
    navigate('/work-orders');
  };

  const handleCreateCustomer = () => {
    navigate('/customers/create');
  };

  const handleViewAllCustomers = () => {
    navigate('/customers');
  };

  return (
    <>
      <DashboardSeo />
      <div className="space-y-6">
        <DashboardHeader />
        
        <StatsCards />
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Quick Actions</CardTitle>
              <Wrench className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                onClick={handleCreateWorkOrder}
                className="w-full justify-start"
                variant="outline"
              >
                <Plus className="mr-2 h-4 w-4" />
                New Work Order
              </Button>
              <Button 
                onClick={handleCreateCustomer}
                className="w-full justify-start"
                variant="outline"
              >
                <Users className="mr-2 h-4 w-4" />
                Add Customer
              </Button>
              <Button 
                onClick={() => navigate('/calendar')}
                className="w-full justify-start"
                variant="outline"
              >
                <Calendar className="mr-2 h-4 w-4" />
                View Calendar
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Today's Schedule</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">
                Appointments scheduled
              </p>
              <div className="mt-4 space-y-2">
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">9:00 AM</Badge>
                  <span className="text-sm">Oil Change - Honda Civic</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">11:30 AM</Badge>
                  <span className="text-sm">Brake Inspection - Ford F-150</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center">
                  <Badge variant="destructive" className="mr-2">Low Stock</Badge>
                  <span className="text-sm">Engine Oil</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="outline" className="mr-2">Maintenance</Badge>
                  <span className="text-sm">Lift #2 Due</span>
                </div>
                <div className="flex items-center">
                  <Badge variant="secondary" className="mr-2">Follow-up</Badge>
                  <span className="text-sm">3 customers pending</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart />
          <WorkOrdersByStatusChart />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TechnicianPerformanceChart />
          <ServiceTypeDistributionChart />
        </div>

        <MonthlyRevenueChart />

        <RecentWorkOrders />
      </div>
    </>
  );
};

export default Dashboard;
