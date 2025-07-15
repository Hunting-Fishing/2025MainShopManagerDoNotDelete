import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Clock, Users, Calendar, MapPin, Trash2, Edit } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { VolunteerForm } from './forms/VolunteerForm';

interface VolunteerHour {
  id: string;
  volunteer_id: string;
  activity_type: string;
  hours_worked: number;
  date_worked: string;
  location?: string;
  supervisor?: string;
  notes?: string;
  verified: boolean;
  verified_by?: string;
  created_at: string;
  // Join data
  volunteer_name?: string;
  volunteer_email?: string;
}

interface Volunteer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  total_hours: number;
  volunteer_type: string;
  status: string;
}

export function VolunteerHourTracking() {
  const [volunteerHours, setVolunteerHours] = useState<VolunteerHour[]>([]);
  const [volunteers, setVolunteers] = useState<Volunteer[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      // Load volunteer hours with volunteer names
      const { data: hoursData, error: hoursError } = await supabase
        .from('volunteer_hours')
        .select(`
          *,
          volunteers(first_name, last_name, email)
        `)
        .order('date_worked', { ascending: false });

      if (hoursError) throw hoursError;

      // Transform data to include volunteer names
      const transformedHours = (hoursData || []).map(hour => ({
        ...hour,
        volunteer_name: hour.volunteers ? `${hour.volunteers.first_name} ${hour.volunteers.last_name}` : 'Unknown',
        volunteer_email: hour.volunteers?.email || ''
      }));

      setVolunteerHours(transformedHours);

      // Load volunteers summary
      const { data: volunteersData, error: volunteersError } = await supabase
        .from('volunteers')
        .select('*')
        .eq('status', 'active');

      if (volunteersError) throw volunteersError;
      setVolunteers(volunteersData || []);

    } catch (error) {
      console.error('Error loading volunteer data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load volunteer data',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVolunteerSubmit = async () => {
    await loadData();
    setIsDialogOpen(false);
    toast({
      title: 'Success',
      description: 'Volunteer data updated successfully'
    });
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this hour entry?')) return;

    try {
      const { error } = await supabase
        .from('volunteer_hours')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await loadData();
      toast({
        title: 'Success',
        description: 'Hour entry deleted successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete hour entry',
        variant: 'destructive'
      });
    }
  };

  const verifyHours = async (hourId: string) => {
    try {
      const { error } = await supabase
        .from('volunteer_hours')
        .update({ 
          verified: true,
          verified_by: (await supabase.auth.getUser()).data.user?.id
        })
        .eq('id', hourId);

      if (error) throw error;
      await loadData();
      toast({
        title: 'Success',
        description: 'Hours verified successfully'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to verify hours',
        variant: 'destructive'
      });
    }
  };

  // Calculate summary statistics
  const totalHours = volunteerHours.reduce((sum, vh) => sum + vh.hours_worked, 0);
  const thisMonthHours = volunteerHours
    .filter(vh => {
      const date = new Date(vh.date_worked);
      const now = new Date();
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    })
    .reduce((sum, vh) => sum + vh.hours_worked, 0);
  const unverifiedHours = volunteerHours.filter(vh => !vh.verified).length;

  if (loading) {
    return <div className="p-6">Loading volunteer data...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Hours</CardTitle>
            <Clock className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{totalHours.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">All time</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{thisMonthHours}</div>
            <p className="text-xs text-muted-foreground">Hours logged</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Volunteers</CardTitle>
            <Users className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{volunteers.length}</div>
            <p className="text-xs text-muted-foreground">Registered volunteers</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Verification</CardTitle>
            <Clock className="h-4 w-4 ml-auto text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{unverifiedHours}</div>
            <p className="text-xs text-muted-foreground">Hours to verify</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Volunteer Hour Tracking</h2>
          <p className="text-muted-foreground">
            Track and manage volunteer hours and activities
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Volunteer/Hours
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add Volunteer & Log Hours</DialogTitle>
            </DialogHeader>
            <VolunteerForm onSubmit={handleVolunteerSubmit} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Top Volunteers */}
      <Card>
        <CardHeader>
          <CardTitle>Top Volunteers This Month</CardTitle>
          <CardDescription>Volunteers with the most hours logged this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {volunteers
              .sort((a, b) => {
                const aMonthlyHours = volunteerHours
                  .filter(vh => vh.volunteer_id === a.id && new Date(vh.date_worked).getMonth() === new Date().getMonth())
                  .reduce((sum, vh) => sum + vh.hours_worked, 0);
                const bMonthlyHours = volunteerHours
                  .filter(vh => vh.volunteer_id === b.id && new Date(vh.date_worked).getMonth() === new Date().getMonth())
                  .reduce((sum, vh) => sum + vh.hours_worked, 0);
                return bMonthlyHours - aMonthlyHours;
              })
              .slice(0, 5)
              .map((volunteer) => {
                const monthlyHours = volunteerHours
                  .filter(vh => vh.volunteer_id === volunteer.id && new Date(vh.date_worked).getMonth() === new Date().getMonth())
                  .reduce((sum, vh) => sum + vh.hours_worked, 0);
                
                return (
                  <div key={volunteer.id} className="flex justify-between items-center">
                    <div>
                      <p className="font-medium">{volunteer.first_name} {volunteer.last_name}</p>
                      <p className="text-sm text-muted-foreground">{volunteer.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold">{monthlyHours} hrs</p>
                      <p className="text-sm text-muted-foreground">{volunteer.total_hours} total</p>
                    </div>
                  </div>
                );
              })}
          </div>
        </CardContent>
      </Card>

      {/* Hour Entries */}
      <div className="grid gap-4">
        {volunteerHours.map((hour) => (
          <Card key={hour.id}>
            <CardContent className="p-4">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <h3 className="font-semibold">{hour.volunteer_name}</h3>
                    <Badge variant={hour.verified ? 'default' : 'secondary'}>
                      {hour.verified ? 'Verified' : 'Pending'}
                    </Badge>
                    <Badge variant="outline">{hour.activity_type}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{hour.volunteer_email}</p>
                  <div className="flex items-center gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      {hour.hours_worked} hours
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      {new Date(hour.date_worked).toLocaleDateString()}
                    </span>
                    {hour.location && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {hour.location}
                      </span>
                    )}
                  </div>
                  {hour.supervisor && (
                    <p className="text-sm">
                      <span className="font-medium">Supervisor:</span> {hour.supervisor}
                    </p>
                  )}
                  {hour.notes && (
                    <p className="text-sm text-muted-foreground">{hour.notes}</p>
                  )}
                </div>
                <div className="flex gap-1">
                  {!hour.verified && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => verifyHours(hour.id)}
                    >
                      Verify
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {/* Edit functionality */}}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDelete(hour.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {volunteerHours.length === 0 && (
          <Card>
            <CardContent className="p-8 text-center">
              <p className="text-muted-foreground">No volunteer hours recorded yet. Add your first entry to get started.</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}