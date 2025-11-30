import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useSafetyReminders } from '@/hooks/useSafetyReminders';
import { 
  CalendarClock, 
  Bell, 
  AlertTriangle, 
  CheckCircle, 
  Clock, 
  ArrowRight,
  Shield,
  Wrench,
  FileCheck,
  Award
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { format, differenceInDays } from 'date-fns';
import { useNavigate } from 'react-router-dom';

const frequencyLabels: Record<string, string> = {
  daily: 'Daily',
  weekly: 'Weekly',
  monthly: 'Monthly',
  quarterly: 'Quarterly',
  annual: 'Annual'
};

const typeIcons: Record<string, React.ElementType> = {
  inspection: FileCheck,
  certification: Award,
  dvir: Wrench,
  equipment: Shield
};

const priorityColors: Record<string, string> = {
  critical: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  high: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  medium: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  low: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
};

export default function SafetySchedules() {
  const navigate = useNavigate();
  const { 
    loading, 
    reminders, 
    schedules,
    getOverdueReminders,
    getDueTodayReminders,
    getUpcomingReminders,
    getCriticalReminders
  } = useSafetyReminders();

  const overdue = getOverdueReminders();
  const dueToday = getDueTodayReminders();
  const upcoming = getUpcomingReminders();
  const critical = getCriticalReminders();

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-6">
        <Skeleton className="h-10 w-64" />
        <div className="grid gap-4 md:grid-cols-4">
          {[1,2,3,4].map(i => <Skeleton key={i} className="h-24" />)}
        </div>
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Safety Schedules & Reminders | Safety</title>
        <meta name="description" content="Manage safety inspection schedules and track upcoming compliance reminders" />
      </Helmet>

      <div className="container mx-auto py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-3">
              <CalendarClock className="h-8 w-8 text-primary" />
              Schedules & Reminders
            </h1>
            <p className="text-muted-foreground mt-1">
              Track inspections, certifications, and compliance deadlines
            </p>
          </div>
          <Button onClick={() => navigate('/safety')}>
            <Shield className="h-4 w-4 mr-2" />
            Back to Safety Dashboard
          </Button>
        </div>

        {/* Summary Stats */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card className={overdue.length > 0 ? 'border-red-300' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className={`text-2xl font-bold ${overdue.length > 0 ? 'text-red-600' : ''}`}>
                    {overdue.length}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${overdue.length > 0 ? 'text-red-500' : 'text-muted-foreground'}`} />
              </div>
            </CardContent>
          </Card>

          <Card className={dueToday.length > 0 ? 'border-yellow-300' : ''}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Due Today</p>
                  <p className={`text-2xl font-bold ${dueToday.length > 0 ? 'text-yellow-600' : ''}`}>
                    {dueToday.length}
                  </p>
                </div>
                <Clock className={`h-8 w-8 ${dueToday.length > 0 ? 'text-yellow-500' : 'text-muted-foreground'}`} />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Upcoming</p>
                  <p className="text-2xl font-bold">{upcoming.length}</p>
                </div>
                <Bell className="h-8 w-8 text-muted-foreground" />
              </div>
            </CardContent>
          </Card>

          <Card className={critical.length > 0 ? 'border-red-300' : 'border-green-300'}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical</p>
                  <p className={`text-2xl font-bold ${critical.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                    {critical.length}
                  </p>
                </div>
                {critical.length > 0 ? (
                  <AlertTriangle className="h-8 w-8 text-red-500" />
                ) : (
                  <CheckCircle className="h-8 w-8 text-green-500" />
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="reminders" className="space-y-4">
          <TabsList>
            <TabsTrigger value="reminders">
              Active Reminders ({reminders.length})
            </TabsTrigger>
            <TabsTrigger value="schedules">
              Inspection Schedules
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reminders" className="space-y-4">
            {reminders.length === 0 ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                  <h3 className="text-lg font-medium">All Clear!</h3>
                  <p className="text-muted-foreground">No pending safety reminders</p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {reminders.map((reminder) => {
                  const Icon = typeIcons[reminder.type] || Bell;
                  const daysUntil = differenceInDays(new Date(reminder.dueDate), new Date());
                  
                  return (
                    <Card 
                      key={reminder.id}
                      className={`cursor-pointer transition-colors hover:bg-muted/50 ${
                        reminder.status === 'overdue' ? 'border-red-300' : 
                        reminder.status === 'due_today' ? 'border-yellow-300' : ''
                      }`}
                    >
                      <CardContent className="py-4">
                        <div className="flex items-center gap-4">
                          <div className={`p-2 rounded-lg ${priorityColors[reminder.priority]}`}>
                            <Icon className="h-5 w-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium">{reminder.title}</p>
                              <Badge 
                                variant={
                                  reminder.status === 'overdue' ? 'destructive' :
                                  reminder.status === 'due_today' ? 'secondary' : 'outline'
                                }
                                className="text-xs"
                              >
                                {reminder.status === 'overdue' ? 'Overdue' :
                                 reminder.status === 'due_today' ? 'Due Today' :
                                 `${daysUntil} days`}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground">{reminder.description}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium">
                              {format(new Date(reminder.dueDate), 'MMM d, yyyy')}
                            </p>
                            <Badge variant="outline" className="capitalize text-xs">
                              {reminder.type}
                            </Badge>
                          </div>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          <TabsContent value="schedules" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Inspection Schedules</CardTitle>
                <CardDescription>
                  Configure recurring safety inspection schedules
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {schedules.map((schedule) => (
                    <div 
                      key={schedule.id}
                      className="flex items-center justify-between p-4 border rounded-lg"
                    >
                      <div className="flex items-center gap-4">
                        <Switch checked={schedule.enabled} />
                        <div>
                          <p className="font-medium">{schedule.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {frequencyLabels[schedule.frequency]} • Next: {format(new Date(schedule.nextDue), 'MMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline">{frequencyLabels[schedule.frequency]}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid gap-4 md:grid-cols-2">
              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/safety/inspections/new')}>
                <CardContent className="py-6 flex items-center gap-4">
                  <FileCheck className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">Start Daily Inspection</p>
                    <p className="text-sm text-muted-foreground">Complete today's shop safety check</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto" />
                </CardContent>
              </Card>

              <Card className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => navigate('/safety/equipment/inspect')}>
                <CardContent className="py-6 flex items-center gap-4">
                  <Wrench className="h-10 w-10 text-primary" />
                  <div>
                    <p className="font-medium">Inspect Equipment</p>
                    <p className="text-sm text-muted-foreground">Complete lift/hoist safety check</p>
                  </div>
                  <ArrowRight className="h-5 w-5 ml-auto" />
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
