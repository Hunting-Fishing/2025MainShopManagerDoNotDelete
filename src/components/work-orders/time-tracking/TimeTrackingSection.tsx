
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { PlusCircle, Clock } from 'lucide-react';
import { TimeEntry } from '@/types/workOrder';
import { formatDuration } from '@/utils/workOrderUtils';
import { useToast } from '@/hooks/use-toast';

interface TimeTrackingSectionProps {
  workOrderId: string;
  onUpdateTimeEntries: (updatedEntries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  workOrderId,
  onUpdateTimeEntries
}) => {
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const { toast } = useToast();

  const handleOpenDialog = (entry?: TimeEntry) => {
    setCurrentEntry(entry || null);
    setShowDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDialog(false);
    setCurrentEntry(null);
  };

  const handleTimeEntryUpdated = () => {
    // In a real implementation, we would fetch the updated time entries
    // For now, we'll just show a success message
    toast({
      title: "Time entries updated",
      description: "The time entries have been updated successfully."
    });
    
    // We should fetch the updated entries here
    // For now, we'll just pass the current entries
    onUpdateTimeEntries(timeEntries);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-xl flex items-center">
          <Clock className="w-5 h-5 mr-2" />
          Time Tracking
        </CardTitle>
        <Button 
          size="sm" 
          onClick={() => handleOpenDialog()}
          className="bg-green-600 hover:bg-green-700"
        >
          <PlusCircle className="w-4 h-4 mr-2" />
          Add Time
        </Button>
      </CardHeader>
      <CardContent>
        {timeEntries.length === 0 ? (
          <div className="text-center py-6 text-muted-foreground">
            No time entries recorded yet.
          </div>
        ) : (
          <div className="space-y-4">
            {timeEntries.map((entry) => (
              <div 
                key={entry.id}
                className="p-3 bg-gray-50 rounded-lg border flex justify-between items-center"
              >
                <div>
                  <p className="font-medium">{entry.employeeName}</p>
                  <p className="text-sm text-muted-foreground">
                    {formatDuration(entry.duration)}
                  </p>
                </div>
                <div className="space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => handleOpenDialog(entry)}
                  >
                    Edit
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
        
        {/* Dialog for adding or editing time entries would be implemented here */}
        {showDialog && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded-lg w-full max-w-md">
              <h3 className="text-lg font-semibold mb-4">
                {currentEntry ? 'Edit Time Entry' : 'Add Time Entry'}
              </h3>
              
              <div className="space-y-4">
                <p>Time entry form would be implemented here</p>
              </div>
              
              <div className="mt-4 flex justify-end gap-3">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  handleTimeEntryUpdated();
                  handleCloseDialog();
                }}>
                  {currentEntry ? 'Update' : 'Save'}
                </Button>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
