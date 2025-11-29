import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Loader2, Save, Clock, Gauge } from 'lucide-react';
import { format } from 'date-fns';

export function EngineHoursTab() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedEquipment, setSelectedEquipment] = useState<string>('');
  const [hoursReading, setHoursReading] = useState<string>('');
  const [notes, setNotes] = useState<string>('');

  // Fetch equipment list
  const { data: equipment, isLoading: loadingEquipment } = useQuery({
    queryKey: ['equipment-for-logs'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_assets')
        .select('id, name, asset_number, current_hours')
        .order('name');
      if (error) throw error;
      return data;
    }
  });

  // Fetch recent engine hour logs
  const { data: recentLogs, isLoading: loadingLogs } = useQuery({
    queryKey: ['recent-engine-hours'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('equipment_usage_logs')
        .select(`
          id,
          reading_value,
          reading_type,
          reading_date,
          notes,
          equipment_id,
          equipment_assets (name, equipment_number)
        `)
        .eq('reading_type', 'hours')
        .order('reading_date', { ascending: false })
        .limit(10);
      if (error) throw error;
      return data;
    }
  });

  const submitMutation = useMutation({
    mutationFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { data: profile } = await supabase
        .from('profiles')
        .select('shop_id')
        .eq('user_id', user.id)
        .single();

      // Insert usage log
      const { error: logError } = await supabase
        .from('equipment_usage_logs')
        .insert({
          equipment_id: selectedEquipment,
          reading_type: 'hours',
          reading_value: parseFloat(hoursReading),
          reading_date: new Date().toISOString(),
          recorded_by: user.id,
          notes
        });

      if (logError) throw logError;

      // Update equipment current hours
      const { error: updateError } = await supabase
        .from('equipment_assets')
        .update({ current_hours: parseFloat(hoursReading) })
        .eq('id', selectedEquipment);

      if (updateError) throw updateError;
    },
    onSuccess: () => {
      toast({
        title: 'Engine Hours Recorded',
        description: 'The engine hours have been saved successfully.'
      });
      setSelectedEquipment('');
      setHoursReading('');
      setNotes('');
      queryClient.invalidateQueries({ queryKey: ['recent-engine-hours'] });
      queryClient.invalidateQueries({ queryKey: ['equipment-for-logs'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to save engine hours',
        variant: 'destructive'
      });
    }
  });

  const selectedEquipmentData = equipment?.find(e => e.id === selectedEquipment);

  return (
    <div className="grid gap-6 md:grid-cols-2">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gauge className="h-5 w-5" />
            Log Engine Hours
          </CardTitle>
          <CardDescription>
            Record the current engine hours reading for equipment
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="equipment">Equipment</Label>
            <Select value={selectedEquipment} onValueChange={setSelectedEquipment}>
              <SelectTrigger>
                <SelectValue placeholder="Select equipment" />
              </SelectTrigger>
              <SelectContent>
                {equipment?.map((item) => (
                  <SelectItem key={item.id} value={item.id}>
                    {item.asset_number ? `${item.asset_number} - ` : ''}{item.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedEquipmentData && (
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground">Current Hours</p>
              <p className="text-lg font-semibold">
                {selectedEquipmentData.current_hours?.toLocaleString() || 0} hrs
              </p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="hours">New Hours Reading</Label>
            <Input
              id="hours"
              type="number"
              placeholder="Enter hours reading"
              value={hoursReading}
              onChange={(e) => setHoursReading(e.target.value)}
              min="0"
              step="0.1"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any additional notes..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>

          <Button
            onClick={() => submitMutation.mutate()}
            disabled={!selectedEquipment || !hoursReading || submitMutation.isPending}
            className="w-full"
          >
            {submitMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin mr-2" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Engine Hours
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Recent Entries
          </CardTitle>
          <CardDescription>
            Last 10 engine hour entries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loadingLogs ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : recentLogs && recentLogs.length > 0 ? (
            <div className="space-y-3">
              {recentLogs.map((log: any) => (
                <div key={log.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium text-sm">
                      {log.equipment_assets?.name || 'Unknown Equipment'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(log.reading_date), 'MMM d, yyyy h:mm a')}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold">{log.reading_value?.toLocaleString()} hrs</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              No recent engine hour entries
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
