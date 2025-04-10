
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMemberHistoryRecord, fetchTeamMemberHistory } from "@/utils/teamHistoryUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { supabase } from "@/lib/supabase";
import { formatDistanceToNow, format } from "date-fns";

export const TeamHistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [teamHistory, setTeamHistory] = useState<TeamMemberHistoryRecord[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const fetchAllTeamHistory = async () => {
      try {
        setLoading(true);
        // First, get all profiles to know which team members to fetch history for
        const { data: profiles } = await supabase
          .from('profiles')
          .select('id');

        if (!profiles || profiles.length === 0) {
          setTeamHistory([]);
          return;
        }

        // Fetch history for each team member and combine results
        const allHistory: TeamMemberHistoryRecord[] = [];
        for (const profile of profiles) {
          if (profile.id) {
            const historyRecords = await fetchTeamMemberHistory(profile.id);
            allHistory.push(...historyRecords);
          }
        }

        // Sort by timestamp (newest first)
        const sortedHistory = allHistory.sort((a, b) => {
          const timeA = new Date(a.timestamp || new Date()).getTime();
          const timeB = new Date(b.timestamp || new Date()).getTime();
          return timeB - timeA;
        });

        setTeamHistory(sortedHistory);
      } catch (error) {
        console.error("Failed to fetch team history:", error);
        toast({
          variant: "destructive",
          title: "Error fetching team history",
          description: "There was an issue retrieving the team history. Please try again."
        });
      } finally {
        setLoading(false);
      }
    };

    fetchAllTeamHistory();
  }, [toast]);

  // Function to get badge color for different action types
  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'creation':
        return "bg-green-100 text-green-800 hover:bg-green-200/50";
      case 'update':
        return "bg-blue-100 text-blue-800 hover:bg-blue-200/50";
      case 'role_change':
        return "bg-purple-100 text-purple-800 hover:bg-purple-200/50";
      case 'status_change':
        return "bg-amber-100 text-amber-800 hover:bg-amber-200/50";
      case 'deletion':
        return "bg-red-100 text-red-800 hover:bg-red-200/50";
      default:
        return "bg-gray-100 text-gray-800 hover:bg-gray-200/50";
    }
  };

  // Helper to format action type for display
  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Helper to get details for display
  const getActionDetails = (record: TeamMemberHistoryRecord) => {
    switch(record.action_type) {
      case 'role_change':
        return `Changed from "${record.details.previous_role || 'None'}" to "${record.details.new_role}"`;
      case 'status_change':
        return `Changed from "${record.details.previous_status || 'Active'}" to "${record.details.new_status}"`;
      case 'update':
        return record.details.fields ? 
          `Updated fields: ${Array.isArray(record.details.fields) ? record.details.fields.join(', ') : record.details.fields}` : 
          'Profile updated';
      case 'creation':
        return 'Team member added';
      case 'deletion':
        return 'Team member removed';
      default:
        return JSON.stringify(record.details);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Team History</h2>
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-4 rounded-md border p-3">
              <Skeleton className="h-12 w-12 rounded-full" />
              <div className="space-y-2 flex-1">
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-3 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (teamHistory.length === 0) {
    return (
      <div className="text-center py-10">
        <h2 className="text-xl font-semibold mb-2">Team History</h2>
        <p className="text-muted-foreground">No team history records found.</p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">Team History</h2>
      <p className="mb-4 text-muted-foreground">
        Track all changes and activities related to your team members.
      </p>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
              <TableHead>By</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teamHistory.map((record) => (
              <TableRow key={record.id}>
                <TableCell className="font-medium whitespace-nowrap">
                  <div className="flex flex-col">
                    <span>{format(new Date(record.timestamp || new Date()), 'MMM d, yyyy')}</span>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(record.timestamp || new Date()), 'h:mm a')}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      ({formatDistanceToNow(new Date(record.timestamp || new Date()), { addSuffix: true })})
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge className={`${getActionColor(record.action_type)}`}>
                    {formatActionType(record.action_type)}
                  </Badge>
                </TableCell>
                <TableCell>{getActionDetails(record)}</TableCell>
                <TableCell className="whitespace-nowrap">
                  <span className="text-sm">{record.action_by}</span>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};
