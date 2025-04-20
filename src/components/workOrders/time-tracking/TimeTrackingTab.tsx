
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Clock, Check, Trash2, Plus, Edit2, Play, Pause } from "lucide-react";
import { TimeEntry } from "@/types/workOrder";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from "@/components/ui/table";
import { formatDistanceToNow } from 'date-fns';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TimeTrackingTabProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onAddTimeEntry: (entry: TimeEntry) => void;
  onUpdateTimeEntry: (entry: TimeEntry) => void;
  onDeleteTimeEntry: (entryId: string) => void;
  userId: string;
  userName: string;
}

export function TimeTrackingTab({
  workOrderId,
  timeEntries,
  onAddTimeEntry,
  onUpdateTimeEntry,
  onDeleteTimeEntry,
  userId,
  userName
}: TimeTrackingTabProps) {
  const [isTracking, setIsTracking] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [activeTimeEntry, setActiveTimeEntry] = useState<TimeEntry | null>(null);
  const [notes, setNotes] = useState('');
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  
  const formatTime = (date: Date | string) => {
    if (!date) return '';
    return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const getDuration = (start: string, end?: string | null) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : new Date().getTime();
    const duration = Math.round((endTime - startTime) / (1000 * 60)); // in minutes
    return duration;
  };
  
  const handleStartTracking = () => {
    const now = new Date();
    const newEntry: TimeEntry = {
      id: `temp-${Date.now()}`,
      employeeId: userId,
      employeeName: userName,
      startTime: now.toISOString(),
      endTime: null,
      duration: 0,
      billable: true,
      notes: ''
    };
    
    setActiveTimeEntry(newEntry);
    setStartTime(now);
    setIsTracking(true);
  };
  
  const handleStopTracking = () => {
    if (!activeTimeEntry) return;
    
    const endTime = new Date();
    const duration = getDuration(activeTimeEntry.startTime);
    
    const completedEntry: TimeEntry = {
      ...activeTimeEntry,
      id: `entry-${Date.now()}`, // Replace with actual ID generation in production
      endTime: endTime.toISOString(),
      duration,
      notes
    };
    
    onAddTimeEntry(completedEntry);
    setActiveTimeEntry(null);
    setStartTime(null);
    setIsTracking(false);
    setNotes('');
  };
  
  const handleEdit = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setNotes(entry.notes || '');
  };
  
  const handleSaveEdit = () => {
    if (!editingEntry) return;
    
    const updatedEntry = {
      ...editingEntry,
      notes
    };
    
    onUpdateTimeEntry(updatedEntry);
    setEditingEntry(null);
    setNotes('');
  };
  
  const handleCancelEdit = () => {
    setEditingEntry(null);
    setNotes('');
  };

  const handleToggleBillable = (entry: TimeEntry) => {
    const updatedEntry = {
      ...entry,
      billable: !entry.billable
    };
    
    onUpdateTimeEntry(updatedEntry);
  };
  
  const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
  const billableMinutes = timeEntries.reduce((sum, entry) => entry.billable ? sum + (entry.duration || 0) : sum, 0);
  
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="bg-slate-50 pb-3 border-b">
          <CardTitle className="text-lg font-medium flex items-center">
            <Clock className="mr-2 h-5 w-5" />
            Time Tracking
          </CardTitle>
        </CardHeader>
        <CardContent className="p-4">
          {isTracking ? (
            <div className="space-y-4">
              <div className="p-4 border rounded-md bg-blue-50 border-blue-200">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{userName}</p>
                    <p className="text-sm text-slate-500">
                      Started: {startTime ? formatTime(startTime) : ''}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={handleStopTracking}
                      className="flex items-center gap-1"
                    >
                      <Pause className="h-4 w-4" /> Stop Tracking
                    </Button>
                  </div>
                </div>
                <div className="mt-3">
                  <Textarea
                    placeholder="Add notes about what you're working on..."
                    className="w-full"
                    value={notes}
                    onChange={e => setNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="flex justify-center py-4">
              <Button className="flex items-center gap-2" onClick={handleStartTracking}>
                <Play className="h-4 w-4" /> 
                Start Time Tracking
              </Button>
            </div>
          )}
          
          <div className="mt-6">
            <div className="flex justify-between mb-4">
              <div>
                <p className="text-sm font-medium">Total Time</p>
                <p className="text-2xl font-bold">{totalMinutes} minutes</p>
              </div>
              <div>
                <p className="text-sm font-medium">Billable Time</p>
                <p className="text-2xl font-bold">{billableMinutes} minutes</p>
              </div>
            </div>
            
            {timeEntries.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Employee</TableHead>
                    <TableHead>Time</TableHead>
                    <TableHead>Duration</TableHead>
                    <TableHead>Billable</TableHead>
                    <TableHead>Notes</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeEntries.map(entry => (
                    <TableRow key={entry.id}>
                      <TableCell>{entry.employeeName}</TableCell>
                      <TableCell>
                        {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Ongoing'}
                      </TableCell>
                      <TableCell>{entry.duration} min</TableCell>
                      <TableCell>
                        <Checkbox 
                          checked={entry.billable}
                          onCheckedChange={() => handleToggleBillable(entry)}
                        />
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {editingEntry?.id === entry.id ? (
                          <Textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            className="w-full h-24"
                          />
                        ) : (
                          entry.notes || '-'
                        )}
                      </TableCell>
                      <TableCell>
                        {editingEntry?.id === entry.id ? (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={handleSaveEdit}>
                              <Check className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                              Cancel
                            </Button>
                          </div>
                        ) : (
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => handleEdit(entry)}>
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="outline" 
                              className="text-red-500" 
                              onClick={() => onDeleteTimeEntry(entry.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <div className="text-center p-8 border border-dashed rounded-md">
                <Clock className="h-12 w-12 mx-auto text-slate-300 mb-3" />
                <h3 className="text-lg font-medium mb-1">No Time Entries Yet</h3>
                <p className="text-slate-500 mb-3">
                  Start tracking time for this work order using the button above.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
