
import React, { useState, useEffect } from 'react';
import { TimeEntry } from '@/types/workOrder';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Clock, Play, Pause, Plus, User } from 'lucide-react';
import { 
  getWorkOrderTimeEntries, 
  addTimeEntryToWorkOrder,
  updateTimeEntry,
  deleteTimeEntry 
} from '@/services/workOrder/workOrderTimeTrackingService';

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
  isEditMode: boolean;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries,
  isEditMode
}: TimeTrackingSectionProps) {
  const [isLoading, setIsLoading] = useState(false);

  const formatTime = (minutes: number) => {
    if (minutes === 0) return "No time logged";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`;
  };

  const formatDateTime = (dateTimeString: string) => {
    try {
      return new Date(dateTimeString).toLocaleString();
    } catch {
      return dateTimeString;
    }
  };

  // Calculate totals
  const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableTime = timeEntries.reduce((sum, entry) => {
    return entry.billable ? sum + (entry.duration || 0) : sum;
  }, 0);
  const nonBillableTime = totalTime - billableTime;

  const activeEntries = timeEntries.filter(entry => !entry.end_time);
  const completedEntries = timeEntries.filter(entry => entry.end_time);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Clock className="h-5 w-5 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-2xl font-bold">{formatTime(totalTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Play className="h-5 w-5 text-green-600" />
              <div>
                <p className="text-sm font-medium">Billable Time</p>
                <p className="text-2xl font-bold">{formatTime(billableTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Pause className="h-5 w-5 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Non-Billable</p>
                <p className="text-2xl font-bold">{formatTime(nonBillableTime)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div>
              <p className="text-sm font-medium">Total Entries</p>
              <p className="text-2xl font-bold">{timeEntries.length}</p>
              <p className="text-xs text-muted-foreground">
                {activeEntries.length} active
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Time Entries */}
      {activeEntries.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Play className="h-5 w-5 text-green-600" />
              Active Time Entries
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {activeEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <div>
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="font-medium">{entry.employee_name}</span>
                        <Badge variant={entry.billable ? "default" : "secondary"}>
                          {entry.billable ? "Billable" : "Non-billable"}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Started: {formatDateTime(entry.start_time)}
                      </p>
                      {entry.notes && (
                        <p className="text-sm text-muted-foreground mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                  {isEditMode && (
                    <Button variant="outline" size="sm">
                      Stop Timer
                    </Button>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Completed Time Entries */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Time Entries History</CardTitle>
            {isEditMode && (
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Entry
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {completedEntries.length === 0 && activeEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No time logged</p>
              <p className="text-sm">Time entries will appear here when work begins</p>
            </div>
          ) : completedEntries.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No completed time entries yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <User className="h-4 w-4" />
                      <span className="font-medium">{entry.employee_name}</span>
                      <Badge variant={entry.billable ? "default" : "secondary"}>
                        {entry.billable ? "Billable" : "Non-billable"}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>Duration: {formatTime(entry.duration || 0)}</p>
                      <p>
                        {formatDateTime(entry.start_time)} - {entry.end_time ? formatDateTime(entry.end_time) : 'Active'}
                      </p>
                      {entry.notes && <p>Notes: {entry.notes}</p>}
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-lg">{formatTime(entry.duration || 0)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
