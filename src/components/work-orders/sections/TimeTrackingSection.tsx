
import React from 'react';
import { TimeEntry } from '@/types/workOrder';

interface TimeTrackingSectionProps {
  timeEntries: TimeEntry[];
  onUpdateTimeEntries: (entries: TimeEntry[]) => void;
}

export const TimeTrackingSection: React.FC<TimeTrackingSectionProps> = ({
  timeEntries,
  onUpdateTimeEntries
}) => {
  return (
    <div className="pt-8 mt-8 border-t border-gray-200">
      <div className="text-sm text-gray-500 mb-2">
        Note: Additional time tracking can be added after the work order is created.
      </div>
      
      {timeEntries.length > 0 && (
        <div>
          {/* Time entries list will go here */}
        </div>
      )}
    </div>
  );
};
