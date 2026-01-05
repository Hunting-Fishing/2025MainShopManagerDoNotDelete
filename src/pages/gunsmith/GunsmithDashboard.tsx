import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Crosshair,
  Calendar,
  DollarSign,
  FileText,
  AlertTriangle,
  Plus,
  ClipboardList,
  Package,
  Users,
  Shield,
  ArrowRightLeft,
  Receipt,
  CreditCard,
  CalendarDays,
  ShoppingBag,
  BarChart3,
  Link
} from 'lucide-react';
import { useGunsmithStats, useGunsmithJobs, useGunsmithAppointments, useGunsmithConsignments, useGunsmithTransfers } from '@/hooks/useGunsmith';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';

export default function GunsmithDashboard() {
  const navigate = useNavigate();
  const { data: stats, isLoading: statsLoading } = useGunsmithStats();
  const { data: recentJobs, isLoading: jobsLoading } = useGunsmithJobs();
  const { data: appointments, isLoading: appointmentsLoading } = useGunsmithAppointments();
  const { data: consignments, isLoading: consignmentsLoading } = useGunsmithConsignments();
  const { data: transfers, isLoading: transfersLoading } = useGunsmithTransfers();

  const upcomingAppointments = (appointments || [])
    .filter((appointment) => appointment.appointment_date)
    .filter((appointment) => appointment.status !== 'cancelled')
    .filter((appointment) => new Date(appointment.appointment_date) >= new Date())
    .sort((a, b) => new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime())
    .slice(0, 5);

  const statCards = [
    {
      title: 'Pending Jobs',
      value: stats?.pendingJobs || 0,
      icon: ClipboardList,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      title: 'In Progress',
      value: stats?.inProgressJobs || 0,
      icon: Crosshair,
      color: 'text-blue-500',
      bgColor: 'bg-blue-500/10',
    },
    {
      title: 'Awaiting Parts',
      value: stats?.awaitingPartsJobs || 0,
      icon: Package,
      color: 'text-yellow-500',
      bgColor: 'bg-yellow-500/10',
    },
    {
      title: 'Completed',
      value: stats?.completedJobs || 0,
      icon: Calendar,
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
    {
      title: 'Pending Transfers',
      value: transfers?.filter((transfer) => transfer.status !== 'completed').length || 0,
      icon: ArrowRightLeft,
      color: 'text-purple-500',
      bgColor: 'bg-purple-500/10',
    },
    {
      title: 'Active Consignments',
      value: consignments?.filter((consignment) => consignment.status === 'active').length || 0,
      icon: ShoppingBag,
      color: 'text-orange-500',
      bgColor: 'bg-orange-500/10',
    },
    {
      title: 'Licenses Expiring',
      value: stats?.expiringLicenses || 0,
      icon: Shield,
      color: 'text-red-500',
      bgColor: 'bg-red-500/10',
    },
  ];

  const alerts = [];
  if (stats?.lowStockParts && stats.lowStockParts > 0) {
    alerts.push({
      type: 'warning',
      message: `${stats.lowStockParts} part(s) running low on stock`,
      action: () => navigate('/gunsmith/parts'),
    });
  }
  if (stats?.expiringLicenses && stats.expiringLicenses > 0) {
    alerts.push({
      type: 'critical',
      message: `${stats.expiringLicenses} customer license(s) expiring within 30 days`,
      action: () => navigate('/gunsmith/compliance'),
    });
  }

  return (
    <div className="min-h-screen bg-background p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <Crosshair className="h-8 w-8 text-amber-600" />
              Gunsmith
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage firearm repairs, compliance, transfers, and inventory
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/gunsmith/quotes/new')}>
              <FileText className="h-4 w-4 mr-2" />
              New Quote
            </Button>
            <Button onClick={() => navigate('/gunsmith/jobs/new')}>
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
              className={`flex items-center justify-between p-4 border rounded-lg cursor-pointer transition-colors ${
                alert.type === 'critical' 
                  ? 'bg-red-500/10 border-red-500/20 hover:bg-red-500/15' 
                  : 'bg-amber-500/10 border-amber-500/20 hover:bg-amber-500/15'
              }`}
              onClick={alert.action}
            >
              <div className="flex items-center gap-3">
                <AlertTriangle className={`h-5 w-5 ${alert.type === 'critical' ? 'text-red-500' : 'text-amber-500'}`} />
                <span className="text-foreground">{alert.message}</span>
              </div>
              <Badge variant="outline" className={alert.type === 'critical' ? 'text-red-500 border-red-500' : 'text-amber-500 border-amber-500'}>
                {alert.type === 'critical' ? 'Critical' : 'Action Required'}
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
                  {statsLoading || consignmentsLoading || transfersLoading ? (
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
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-12 gap-4 mb-8">
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/gunsmith/jobs')}
        >
          <ClipboardList className="h-6 w-6" />
          <span className="text-xs">All Jobs</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/gunsmith/firearms')}
        >
          <Crosshair className="h-6 w-6" />
          <span className="text-xs">Firearms</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2"
          onClick={() => navigate('/gunsmith/parts')}
        >
          <Package className="h-6 w-6" />
          <span className="text-xs">Parts</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/5"
          onClick={() => navigate('/gunsmith/inventory')}
        >
          <BarChart3 className="h-6 w-6 text-purple-500" />
          <span className="text-xs">Inventory</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-amber-500/30 hover:bg-amber-500/5"
          onClick={() => navigate('/gunsmith/quotes')}
        >
          <FileText className="h-6 w-6 text-amber-500" />
          <span className="text-xs">Quotes</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-green-500/30 hover:bg-green-500/5"
          onClick={() => navigate('/gunsmith/invoices')}
        >
          <Receipt className="h-6 w-6 text-green-500" />
          <span className="text-xs">Invoices</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-emerald-500/30 hover:bg-emerald-500/5"
          onClick={() => navigate('/gunsmith/payments')}
        >
          <CreditCard className="h-6 w-6 text-emerald-500" />
          <span className="text-xs">Payments</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-blue-500/30 hover:bg-blue-500/5"
          onClick={() => navigate('/gunsmith/appointments')}
        >
          <CalendarDays className="h-6 w-6 text-blue-500" />
          <span className="text-xs">Appointments</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-red-500/30 hover:bg-red-500/5"
          onClick={() => navigate('/gunsmith/compliance')}
        >
          <Shield className="h-6 w-6 text-red-500" />
          <span className="text-xs">Compliance</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-purple-500/30 hover:bg-purple-500/5"
          onClick={() => navigate('/gunsmith/transfers')}
        >
          <ArrowRightLeft className="h-6 w-6 text-purple-500" />
          <span className="text-xs">Transfers</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-orange-500/30 hover:bg-orange-500/5"
          onClick={() => navigate('/gunsmith/consignments')}
        >
          <ShoppingBag className="h-6 w-6 text-orange-500" />
          <span className="text-xs">Consignments</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-cyan-500/30 hover:bg-cyan-500/5"
          onClick={() => navigate('/gunsmith/parts-on-order')}
        >
          <ShoppingBag className="h-6 w-6 text-cyan-500" />
          <span className="text-xs">Parts on Order</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-slate-500/30 hover:bg-slate-500/5"
          onClick={() => navigate('/gunsmith/useful-links')}
        >
          <Link className="h-6 w-6 text-slate-500" />
          <span className="text-xs">Useful Links</span>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Jobs */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Recent Jobs</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/gunsmith/jobs')}>
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
            ) : recentJobs && recentJobs.length > 0 ? (
              <div className="space-y-3">
                {recentJobs.slice(0, 5).map((job) => (
                  <div
                    key={job.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate(`/gunsmith/jobs/${job.id}`)}
                  >
                    <div>
                      <p className="font-medium text-foreground">{job.job_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {job.customers?.first_name} {job.customers?.last_name} - {job.job_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant={
                        job.status === 'completed' ? 'default' : 
                        job.status === 'in_progress' ? 'secondary' : 
                        'outline'
                      }>
                        {job.status.replace('_', ' ')}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {job.gunsmith_firearms?.make} {job.gunsmith_firearms?.model}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Crosshair className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No jobs yet</p>
                <Button variant="link" onClick={() => navigate('/gunsmith/jobs/new')}>
                  Create your first job
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Appointments */}
        <Card className="border-border">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-lg font-semibold">Upcoming Appointments</CardTitle>
            <Button variant="ghost" size="sm" onClick={() => navigate('/gunsmith/appointments')}>
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {appointmentsLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Skeleton key={i} className="h-16 w-full" />
                ))}
              </div>
            ) : upcomingAppointments.length > 0 ? (
              <div className="space-y-3">
                {upcomingAppointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted transition-colors"
                    onClick={() => navigate('/gunsmith/appointments')}
                  >
                    <div>
                      <p className="font-medium text-foreground">
                        {appointment.customers?.first_name} {appointment.customers?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {appointment.appointment_type}
                      </p>
                    </div>
                    <div className="text-right">
                      <Badge variant="outline">{appointment.status.replace('_', ' ')}</Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(appointment.appointment_date), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No upcoming appointments</p>
                <Button variant="link" onClick={() => navigate('/gunsmith/appointments')}>
                  Schedule an appointment
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
