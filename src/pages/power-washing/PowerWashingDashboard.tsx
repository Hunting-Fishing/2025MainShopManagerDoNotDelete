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
  BarChart3,
  Navigation,
  Star,
  Bell,
  Smartphone,
  Cloud,
  PieChart,
  BookOpen,
  Camera,
  Repeat,
  Users,
  CreditCard,
  CalendarDays,
  UserPlus,
  Car
} from 'lucide-react';
import { usePowerWashingStats, usePowerWashingJobs, usePowerWashingQuotes } from '@/hooks/usePowerWashing';
import { LowStockWidget } from '@/components/power-washing/LowStockWidget';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Skeleton } from '@/components/ui/skeleton';
import { NumberTicker, CurrencyTicker } from '@/components/ui/number-ticker';
import { AnimatedList } from '@/components/ui/animated-list';
import { FadeIn, SlideIn } from '@/components/layout/AnimatedPage';
import { motion } from 'framer-motion';

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
      <FadeIn className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
              <motion.div
                animate={{ rotate: [0, 15, -15, 0] }}
                transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
              >
                <Droplets className="h-8 w-8 text-blue-500" />
              </motion.div>
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
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button onClick={() => navigate('/power-washing/jobs/new')}>
                <Plus className="h-4 w-4 mr-2" />
                New Job
              </Button>
            </motion.div>
          </div>
        </div>
      </FadeIn>

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
      <AnimatedList className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8" variant="scale" staggerDelay={0.1}>
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            whileHover={{ y: -4, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 400, damping: 25 }}
          >
            <Card className="border-border hover:shadow-lg transition-shadow duration-300 group overflow-hidden">
              <div className={`h-1 ${stat.bgColor} group-hover:h-1.5 transition-all duration-300`} />
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.title}</p>
                    {statsLoading ? (
                      <Skeleton className="h-8 w-20 mt-1" />
                    ) : (
                      <p className="text-2xl font-bold text-foreground mt-1">
                        {typeof stat.value === 'number' ? (
                          stat.title.includes('Revenue') ? (
                            <CurrencyTicker value={stat.value} delay={index * 0.1} />
                          ) : (
                            <NumberTicker value={stat.value} delay={index * 0.1} />
                          )
                        ) : (
                          stat.value
                        )}
                      </p>
                    )}
                  </div>
                  <motion.div 
                    className={`p-3 rounded-full ${stat.bgColor}`}
                    whileHover={{ rotate: [0, -10, 10, 0], scale: 1.1 }}
                    transition={{ duration: 0.4 }}
                  >
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </motion.div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatedList>

      {/* Quick Actions */}
      <div className="grid grid-cols-3 md:grid-cols-6 lg:grid-cols-13 gap-4 mb-8">
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
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-indigo-500/30 hover:bg-indigo-500/5"
          onClick={() => navigate('/power-washing/routes')}
        >
          <Navigation className="h-6 w-6 text-indigo-500" />
          <span className="text-xs">Routes</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-yellow-500/30 hover:bg-yellow-500/5"
          onClick={() => navigate('/power-washing/reviews')}
        >
          <Star className="h-6 w-6 text-yellow-500" />
          <span className="text-xs">Reviews</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-pink-500/30 hover:bg-pink-500/5"
          onClick={() => navigate('/power-washing/notifications')}
        >
          <Bell className="h-6 w-6 text-pink-500" />
          <span className="text-xs">Alerts</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-teal-500/30 hover:bg-teal-500/5"
          onClick={() => navigate('/power-washing/field')}
        >
          <Smartphone className="h-6 w-6 text-teal-500" />
          <span className="text-xs">Field View</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-emerald-500/30 hover:bg-emerald-500/5"
          onClick={() => navigate('/power-washing/price-book')}
        >
          <BookOpen className="h-6 w-6 text-emerald-500" />
          <span className="text-xs">Price Book</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-violet-500/30 hover:bg-violet-500/5"
          onClick={() => navigate('/power-washing/analytics')}
        >
          <PieChart className="h-6 w-6 text-violet-500" />
          <span className="text-xs">Analytics</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-sky-500/30 hover:bg-sky-500/5"
          onClick={() => navigate('/power-washing/weather')}
        >
          <Cloud className="h-6 w-6 text-sky-500" />
          <span className="text-xs">Weather</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-rose-500/30 hover:bg-rose-500/5"
          onClick={() => navigate('/power-washing/photos')}
        >
          <Camera className="h-6 w-6 text-rose-500" />
          <span className="text-xs">Photos</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-cyan-500/30 hover:bg-cyan-500/5"
          onClick={() => navigate('/power-washing/subscriptions')}
        >
          <Repeat className="h-6 w-6 text-cyan-500" />
          <span className="text-xs">Subscriptions</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-lime-500/30 hover:bg-lime-500/5"
          onClick={() => navigate('/power-washing/portal')}
        >
          <Users className="h-6 w-6 text-lime-500" />
          <span className="text-xs">Portal</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-green-600/30 hover:bg-green-600/5"
          onClick={() => navigate('/power-washing/payments')}
        >
          <CreditCard className="h-6 w-6 text-green-600" />
          <span className="text-xs">Payments</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-blue-600/30 hover:bg-blue-600/5"
          onClick={() => navigate('/power-washing/schedule')}
        >
          <CalendarDays className="h-6 w-6 text-blue-600" />
          <span className="text-xs">Schedule</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-orange-500/30 hover:bg-orange-500/5"
          onClick={() => navigate('/power-washing/leads')}
        >
          <UserPlus className="h-6 w-6 text-orange-500" />
          <span className="text-xs">Leads</span>
        </Button>
        <Button
          variant="outline"
          className="h-24 flex flex-col gap-2 border-slate-500/30 hover:bg-slate-500/5"
          onClick={() => navigate('/power-washing/fleet')}
        >
          <Car className="h-6 w-6 text-slate-500" />
          <span className="text-xs">Fleet</span>
        </Button>
      </div>

      {/* Low Stock Alert */}
      <div className="mb-6">
        <LowStockWidget />
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
