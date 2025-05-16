
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Clock, Plus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface TimeEntrySectionProps {
  form: UseFormReturn<any>;
}

export const TimeEntrySection: React.FC<TimeEntrySectionProps> = ({ form }) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const timeEntries = form.watch("timeEntries") || [];

  return (
    <Card className="border-blue-100">
      <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-transparent">
        <CardTitle className="text-lg flex items-center justify-between">
          <div className="flex items-center">
            <Clock className="h-5 w-5 mr-2 text-blue-600" />
            Time Tracking
          </div>
          <Button 
            size="sm" 
            variant="ghost" 
            className="text-blue-600 hover:text-blue-800 hover:bg-blue-50"
            onClick={() => setShowAddDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Time
          </Button>
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        {timeEntries.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No time entries recorded.
          </div>
        ) : (
          <div>
            {/* Time entries would be displayed here */}
            <p className="text-sm text-muted-foreground">
              {timeEntries.length} time entries recorded.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
