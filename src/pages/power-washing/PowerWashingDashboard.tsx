import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Droplets, 
  Calendar, 
  DollarSign, 
  FileText, 
  AlertTriangle,
  Plus,
  ClipboardList,
  Truck,
  FlaskConical,
  Beaker,
  Calculator,
  RefreshCw,
  Receipt,
  BarChart3
} from 'lucide-react';
import { usePowerWashingStats, usePowerWashingJobs, usePowerWashingQuotes } from '@/hooks/usePowerWashing';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function PowerWashingDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = usePowerWashingStats();
  const { data: upcomingJobs, isLoading: jobsLoading } = usePowerWashingJobs('scheduled');
  const { data: pendingQuotes, isLoading: quotesLoading } = usePowerWashingQuotes('pending');

  const statCards = [
    {
      title: 'Scheduled Jobs',
      value: stats?.scheduledJobs || 0,
      icon: Calendar,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Pending Quotes',
      value: stats?.pendingQuotes || 0,
      icon: FileText,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'Completed Jobs',
      value: stats?.completedJobs || 0,
      icon: Droplets,
      color: 'text-green-500',
      bgColor: 'bg-green-500/10',
    },
    {
      title: 'Revenue (MTD)',
      value: `$${(stats?.revenue || 0).toLocaleString()}`,
      icon: DollarSign,
      color: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
    },
  ];

  const alerts = [];
  if (stats?.equipmentNeedingMaintenance && stats.equipmentNeedingMaintenance > 0) {
    alerts.push({
      type: 'warning',
      message: `${stats.equipmentNeedingMaintenance} equipment item(s) need maintenance`,
      action: () => navigate('/power-washing/equipment'),
    });
  }
  if (stats?.lowChemicals && stats.lowChemicals > 0) {
    alerts.push({
      type: 'warning',
      message: `${stats.lowChemicals} chemical(s) running low`,
      action: () => navigate('/power-washing/chemicals'),
    });
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Droplets className="h-8 w-8 text-blue-500" />
              Power Washing
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage your power washing jobs, quotes, equipment, and supplies
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/power-washing/quotes/new')}>
              <FileText className="h-4 w-4 mr-2" />
              New Quote
            </Button>
            <Button onClick={() => navigate('/power-washing/jobs/new')}>
              <Plus className="h-4 w-4 mr-2" />
              New Job
            </Button>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {alerts.length > 0 && (
        <div className="mb-6 space-y-2">
          {alerts.map((alert, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg cursor-pointer hover:bg-amber-500/15 transition-colors"
              onClick={alert.action}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                <span className="text-foreground">{alert.message}</span>
              </div>
              <Badge variant="outline" className="text-amber-500 border-amber-500">
                Action Required
              </Badge>
            </div>
          ))}
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => (
          <Card key={stat.title} className="border-border">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.title}</p>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-20 mt-1" />
                  ) : (
                    <p className="text-2xl font-bold text-foreground mt-1">{stat.value}</p>
                  )}
                </div>
                <div className={`p-3 rounded-full ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.color}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-9 gap-4 mb-8">
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/power-washing/jobs')}
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs">All Jobs</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/power-washing/quotes')}
        >
          <FileText className="h-6 w-6" />
          <span className="text-xs">Quotes</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/power-washing/equipment')}
        >
          <Truck className="h-6 w-6" />
          <span className="text-xs">Equipment</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/power-washing/chemicals')}
        >
          <FlaskConical className="h-6 w-6" />
          <span className="text-xs">Chemicals</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-primary/30 hover:bg-primary/5"
          onClick={() => navigate('/power-washing/formulas')}
        >
          <Beaker className="h-6 w-6 text-primary" />
          <span className="text-xs">Formulas</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-green-500/30 hover:bg-green-500/5"
          onClick={() => navigate('/power-washing/surface-calculator')}
        >
          <Calculator className="h-6 w-6 text-green-600" />
          <span className="text-xs">Calculator</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/5"
          onClick={() => navigate('/power-washing/recurring')}
        >
          <RefreshCw className="h-6 w-6 text-purple-500" />
          <span className="text-xs">Recurring</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-amber-500/30 hover:bg-amber-500/5"
          onClick={() => navigate('/power-washing/invoices')}
        >
          <Receipt className="h-6 w-6 text-amber-500" />
          <span className="text-xs">Invoices</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/5"
          onClick={() => navigate('/power-washing/reports')}
        >
          <BarChart3 className="h-6 w-6 text-blue-500" />
          <span className="text-xs">Reports</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Jobs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Upcoming Jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/power-washing/jobs')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {jobsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingJobs && upcomingJobs.length > 0 ? (
              <div className="space-y-3">
                {upcomingJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/power-washing/jobs/${job.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{job.job_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.property_type} • {job.property_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-foreground">
                        {job.scheduled_date ? format(new Date(job.scheduled_date), 'MMM d') : 'Not scheduled'}
                      </p>
                      <Badge variant={job.priority === 'urgent' ? 'destructive' : 'secondary'}>
                        {job.priority}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming jobs scheduled</p>
                <Button variant="link" onClick={() => navigate('/power-washing/jobs/new')}>
                  Schedule a job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Quotes */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Pending Quote Requests</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/power-washing/quotes')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {quotesLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : pendingQuotes && pendingQuotes.length > 0 ? (
              <div className="space-y-3">
                {pendingQuotes.slice(0, 5).map((quote) => (
                  <div
                    key={quote.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/power-washing/quotes/${quote.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{quote.customer_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {quote.property_type} • {quote.property_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(quote.created_at), 'MMM d')}
                      </p>
                      <Badge variant="outline">{quote.source}</Badge>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No pending quote requests</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
