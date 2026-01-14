import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { 
  Package, 
  ShoppingBag, 
  BarChart3, 
  FileText, 
  Code, 
  ClipboardList,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export default function DeveloperPortalDashboard() {
  // Fetch submissions stats
  const { data: submissionsStats } = useQuery({
    queryKey: ['developer-portal-submissions-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('product_submissions')
        .select('status');
      
      if (error) throw error;
      
      const pending = data?.filter(s => s.status === 'pending').length || 0;
      const approved = data?.filter(s => s.status === 'approved').length || 0;
      const rejected = data?.filter(s => s.status === 'rejected').length || 0;
      
      return { pending, approved, rejected, total: data?.length || 0 };
    }
  });

  const kpiCards = [
    {
      title: 'Pending Submissions',
      value: submissionsStats?.pending || 0,
      icon: Clock,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Awaiting review'
    },
    {
      title: 'Approved',
      value: submissionsStats?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Products approved'
    },
    {
      title: 'Total Submissions',
      value: submissionsStats?.total || 0,
      icon: ShoppingBag,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'All time submissions'
    },
    {
      title: 'Rejection Rate',
      value: submissionsStats?.total ? Math.round((submissionsStats.rejected / submissionsStats.total) * 100) + '%' : '0%',
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Of total submissions'
    }
  ];

  const quickActions = [
    {
      title: 'Product Submissions',
      description: 'Review and approve user-submitted products',
      href: '/developer-portal/submissions',
      icon: Package,
      badge: submissionsStats?.pending || 0
    },
    {
      title: 'Affiliate Products',
      description: 'Manage all affiliate products across modules',
      href: '/developer-portal/products',
      icon: ShoppingBag
    },
    {
      title: 'Store Analytics',
      description: 'View module store performance metrics',
      href: '/developer-portal/analytics',
      icon: BarChart3
    },
    {
      title: 'API Documentation',
      description: 'Platform API reference and guides',
      href: '/developer-portal/api-docs',
      icon: FileText
    },
    {
      title: 'API Testing Tools',
      description: 'Test and debug API endpoints',
      href: '/developer-portal/api-tools',
      icon: Code
    },
    {
      title: 'Changelog',
      description: 'Platform updates and release notes',
      href: '/developer-portal/changelog',
      icon: ClipboardList
    }
  ];

  return (
    <>
      <Helmet>
        <title>Developer Portal | All Business 365</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
          <p className="text-muted-foreground">
            Platform development tools and store management
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {kpiCards.map((kpi) => (
            <Card key={kpi.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">{kpi.title}</CardTitle>
                <div className={`p-2 rounded-lg ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <p className="text-xs text-muted-foreground">{kpi.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-lg font-semibold mb-4">Quick Actions</h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {quickActions.map((action) => (
              <Card key={action.title} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="p-2 rounded-lg bg-orange-100">
                      <action.icon className="h-5 w-5 text-orange-600" />
                    </div>
                    {action.badge !== undefined && action.badge > 0 && (
                      <Badge variant="destructive">{action.badge}</Badge>
                    )}
                  </div>
                  <CardTitle className="text-base mt-2">{action.title}</CardTitle>
                  <CardDescription>{action.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <Button asChild variant="ghost" className="w-full justify-between">
                    <Link to={action.href}>
                      Open
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Recent Activity
            </CardTitle>
            <CardDescription>Latest platform development activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Activity tracking coming soon</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
