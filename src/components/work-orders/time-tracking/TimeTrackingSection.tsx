
import { useEffect, useState } from "react";
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TimeEntry } from "@/types/workOrder";
import { Clock, Play, Pause, Plus, Trash2, Edit } from "lucide-react";
import { useWorkOrderTimeTracking } from "@/hooks/workOrders/useWorkOrderTimeTracking";
import { formatTimeInHoursAndMinutes } from "@/utils/workOrders";
import { formatDate } from "@/utils/workOrders/formatters";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useEffect } from "react";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useAuth } from "@/hooks/useAuth";
import { useProfileStore } from "@/stores/profileStore";
import { useToast } from "@/hooks/use-toast";

interface TimeTrackingSectionProps {
  workOrderId: string;
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export function TimeTrackingSection({
  workOrderId,
  timeEntries,
  onUpdateTimeEntries
}: TimeTrackingSectionProps) {
  const { user } = useAuth();
  const profile = useProfileStore(state => state.profile);
  const { toast } = useToast();
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [showEditDialog, setShowEditDialog] = useState<boolean>(false);
  const [showAddDialog, setShowAddDialog] = useState<boolean>(false);
  const [editingEntry, setEditingEntry] = useState<TimeEntry | null>(null);
  const [formState, setFormState] = useState({
    startTime: '',
    endTime: '',
    notes: '',
    billable: true,
  });
  
  const {
    isTracking,
    activeEntry,
    loading,
    startTimeTracking,
    stopTimeTracking,
    fetchTimeEntries,
    updateTimeEntry,
    deleteTimeEntry
  } = useWorkOrderTimeTracking(workOrderId);

  // Load time entries when component mounts
  useEffect(() => {
    const loadTimeEntries = async () => {
      const entries = await fetchTimeEntries();
      onUpdateTimeEntries(entries);
    };
    
    loadTimeEntries();
  }, [workOrderId]);

  // Update elapsed time if tracking is active
  useEffect(() => {
    if (!isTracking || !activeEntry) {
      setElapsedTime(0);
      return;
    }

    const startTime = new Date(activeEntry.startTime).getTime();
    
    const timer = setInterval(() => {
      const currentTime = new Date().getTime();
      const elapsed = Math.floor((currentTime - startTime) / 1000 / 60);
      setElapsedTime(elapsed);
    }, 60000); // Update every minute
    
    // Initial calculation
    const currentTime = new Date().getTime();
    const elapsed = Math.floor((currentTime - startTime) / 1000 / 60);
    setElapsedTime(elapsed);

    return () => clearInterval(timer);
  }, [isTracking, activeEntry]);

  const handleStartTracking = () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }
    
    const userId = user.id;
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'Unknown User';
    
    startTimeTracking(userId, userName);
  };

  const handleStopTracking = async () => {
    const entryNotes = activeEntry?.notes || '';
    const completedEntry = await stopTimeTracking(entryNotes);
    
    if (completedEntry) {
      const updatedEntries = await fetchTimeEntries();
      onUpdateTimeEntries(updatedEntries);
    }
  };

  const handleEditEntry = (entry: TimeEntry) => {
    setEditingEntry(entry);
    setFormState({
      startTime: entry.startTime,
      endTime: entry.endTime || '',
      notes: entry.notes || '',
      billable: entry.billable
    });
    setShowEditDialog(true);
  };

  const handleDeleteEntry = async (entryId: string) => {
    const success = await deleteTimeEntry(entryId);
    if (success) {
      const updatedEntries = await fetchTimeEntries();
      onUpdateTimeEntries(updatedEntries);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingEntry) return;
    
    const updates: Partial<TimeEntry> = {
      notes: formState.notes,
      billable: formState.billable
    };
    
    if (formState.startTime !== editingEntry.startTime) {
      updates.startTime = formState.startTime;
    }
    
    if (formState.endTime !== editingEntry.endTime) {
      updates.endTime = formState.endTime;
      
      // Recalculate duration if both start and end times are provided
      if (formState.startTime && formState.endTime) {
        const startMs = new Date(formState.startTime).getTime();
        const endMs = new Date(formState.endTime).getTime();
        const durationMinutes = Math.round((endMs - startMs) / (1000 * 60));
        updates.duration = durationMinutes > 0 ? durationMinutes : 0;
      }
    }
    
    const success = await updateTimeEntry(editingEntry.id, updates);
    if (success) {
      const updatedEntries = await fetchTimeEntries();
      onUpdateTimeEntries(updatedEntries);
      setShowEditDialog(false);
    }
  };

  const handleAddNewEntry = () => {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);
    
    setFormState({
      startTime: oneHourAgo.toISOString(),
      endTime: now.toISOString(),
      notes: '',
      billable: true
    });
    
    setShowAddDialog(true);
  };

  const handleSaveNewEntry = async () => {
    if (!user || !profile) {
      toast({
        title: "Error",
        description: "User information not available",
        variant: "destructive"
      });
      return;
    }
    
    if (!formState.startTime || !formState.endTime) {
      toast({
        title: "Error",
        description: "Start time and end time are required",
        variant: "destructive"
      });
      return;
    }
    
    const userId = user.id;
    const userName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || user.email || 'Unknown User';
    
    const startMs = new Date(formState.startTime).getTime();
    const endMs = new Date(formState.endTime).getTime();
    const durationMinutes = Math.round((endMs - startMs) / (1000 * 60));
    
    if (durationMinutes <= 0) {
      toast({
        title: "Error",
        description: "End time must be after start time",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const { data, error } = await supabase
        .from('work_order_time_entries')
        .insert({
          work_order_id: workOrderId,
          employee_id: userId,
          employee_name: userName,
          start_time: formState.startTime,
          end_time: formState.endTime,
          duration: durationMinutes,
          notes: formState.notes,
          billable: formState.billable
        })
        .select()
        .single();
        
      if (error) throw error;
      
      const updatedEntries = await fetchTimeEntries();
      onUpdateTimeEntries(updatedEntries);
      setShowAddDialog(false);
      
      toast({
        title: "Time Entry Added",
        description: `Added ${formatTimeInHoursAndMinutes(durationMinutes)}`,
      });
    } catch (error) {
      console.error('Error adding time entry:', error);
      toast({
        title: "Error",
        description: "Failed to add time entry",
        variant: "destructive"
      });
    }
  };

  const totalBillableTime = timeEntries
    .filter(entry => entry.billable)
    .reduce((total, entry) => total + (entry.duration || 0), 0);

  return (
    <Card>
      <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-slate-500" />
          <CardTitle className="text-lg">Time Tracking</CardTitle>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddNewEntry}
          >
            <Plus className="mr-1 h-4 w-4" />
            Add Time
          </Button>
          {isTracking ? (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-red-500" 
              onClick={handleStopTracking}
              disabled={loading}
            >
              <Pause className="mr-1 h-4 w-4" />
              Stop Timer ({formatTimeInHoursAndMinutes(elapsedTime)})
            </Button>
          ) : (
            <Button 
              variant="outline" 
              size="sm" 
              className="text-green-500" 
              onClick={handleStartTracking}
              disabled={loading}
            >
              <Play className="mr-1 h-4 w-4" />
              Start Timer
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead>Start Time</TableHead>
                <TableHead>End Time</TableHead>
                <TableHead className="text-right">Duration</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-center">Billable</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {activeEntry && (
                <TableRow className="bg-green-50/30">
                  <TableCell>{activeEntry.employeeName}</TableCell>
                  <TableCell>{formatDate(activeEntry.startTime)}</TableCell>
                  <TableCell>In progress...</TableCell>
                  <TableCell className="text-right">{formatTimeInHoursAndMinutes(elapsedTime)}</TableCell>
                  <TableCell>{activeEntry.notes}</TableCell>
                  <TableCell className="text-center">{activeEntry.billable ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" disabled>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              )}
              
              {timeEntries
                .filter(entry => entry.endTime !== null) // Filter out active entry
                .map(entry => (
                <TableRow key={entry.id}>
                  <TableCell>{entry.employeeName}</TableCell>
                  <TableCell>{formatDate(entry.startTime)}</TableCell>
                  <TableCell>{formatDate(entry.endTime || '')}</TableCell>
                  <TableCell className="text-right">{formatTimeInHoursAndMinutes(entry.duration || 0)}</TableCell>
                  <TableCell>{entry.notes}</TableCell>
                  <TableCell className="text-center">{entry.billable ? "Yes" : "No"}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditEntry(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteEntry(entry.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              
              {(timeEntries.length === 0 && !activeEntry) && (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                    No time entries yet. Click "Start Timer" to begin tracking time.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
            
            <tfoot>
              <TableRow className="bg-slate-50 font-medium">
                <TableCell colSpan={3} className="text-right">
                  Total Billable Time:
                </TableCell>
                <TableCell className="text-right">
                  {formatTimeInHoursAndMinutes(totalBillableTime)}
                </TableCell>
                <TableCell colSpan={3}></TableCell>
              </TableRow>
            </tfoot>
          </Table>
        </div>
      </CardContent>
      
      {/* Edit Entry Dialog */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Start Time</Label>
                <Input
                  id="startTime"
                  type="datetime-local"
                  value={formState.startTime.slice(0, 16)}
                  onChange={(e) => setFormState({...formState, startTime: new Date(e.target.value).toISOString()})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="endTime">End Time</Label>
                <Input
                  id="endTime"
                  type="datetime-local"
                  value={formState.endTime ? formState.endTime.slice(0, 16) : ''}
                  onChange={(e) => setFormState({...formState, endTime: new Date(e.target.value).toISOString()})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formState.notes}
                onChange={(e) => setFormState({...formState, notes: e.target.value})}
                rows={3}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="billable"
                checked={formState.billable}
                onCheckedChange={(checked) => setFormState({...formState, billable: checked === true})}
              />
              <Label htmlFor="billable">Billable</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={loading}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Entry Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="addStartTime">Start Time</Label>
                <Input
                  id="addStartTime"
                  type="datetime-local"
                  value={formState.startTime.slice(0, 16)}
                  onChange={(e) => setFormState({...formState, startTime: new Date(e.target.value).toISOString()})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="addEndTime">End Time</Label>
                <Input
                  id="addEndTime"
                  type="datetime-local"
                  value={formState.endTime ? formState.endTime.slice(0, 16) : ''}
                  onChange={(e) => setFormState({...formState, endTime: new Date(e.target.value).toISOString()})}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="addNotes">Notes</Label>
              <Textarea
                id="addNotes"
                value={formState.notes}
                onChange={(e) => setFormState({...formState, notes: e.target.value})}
                rows={3}
                placeholder="Enter any notes about this work"
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox
                id="addBillable"
                checked={formState.billable}
                onCheckedChange={(checked) => setFormState({...formState, billable: checked === true})}
              />
              <Label htmlFor="addBillable">Billable</Label>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveNewEntry} disabled={loading}>
              Add Time Entry
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
