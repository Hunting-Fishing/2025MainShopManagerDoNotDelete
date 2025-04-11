
import React, { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { TeamMemberHistoryRecord, fetchAllTeamHistory } from "@/utils/teamHistoryUtils";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDistanceToNow, format } from "date-fns";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { UserPlus, RefreshCw, UserX, Edit, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

export const TeamHistoryTab = () => {
  const [loading, setLoading] = useState(true);
  const [teamHistory, setTeamHistory] = useState<TeamMemberHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TeamMemberHistoryRecord[]>([]);
  const [actionTypeFilter, setActionTypeFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadTeamHistory = async () => {
    try {
      setLoading(true);
      const allHistory = await fetchAllTeamHistory();
      setTeamHistory(allHistory);
      setFilteredHistory(allHistory);
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

  useEffect(() => {
    loadTeamHistory();
  }, [toast]);

  useEffect(() => {
    let result = teamHistory;
    
    if (actionTypeFilter !== "all") {
      result = result.filter(record => record.action_type === actionTypeFilter);
    }
    
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(record => {
        const actionByName = record.action_by_name?.toLowerCase() || '';
        
        const detailsStr = JSON.stringify(record.details).toLowerCase();
        
        return actionByName.includes(search) || detailsStr.includes(search);
      });
    }
    
    setFilteredHistory(result);
  }, [teamHistory, actionTypeFilter, searchTerm]);

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

  const formatActionType = (actionType: string) => {
    return actionType
      .split('_')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const getActionIcon = (actionType: string) => {
    switch (actionType) {
      case 'creation':
        return <UserPlus className="h-4 w-4 mr-1" />;
      case 'update':
        return <Edit className="h-4 w-4 mr-1" />;
      case 'role_change':
        return <Shield className="h-4 w-4 mr-1" />;
      case 'status_change':
        return <RefreshCw className="h-4 w-4 mr-1" />;
      case 'deletion':
        return <UserX className="h-4 w-4 mr-1" />;
      default:
        return null;
    }
  };

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

  const handleRefresh = () => {
    loadTeamHistory();
    toast({
      title: "Refreshed",
      description: "Team history has been refreshed",
      duration: 2000
    });
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Team History</h2>
          <Skeleton className="h-9 w-32" />
        </div>
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

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
        <div>
          <h2 className="text-2xl font-semibold mb-2">Team History</h2>
          <p className="text-muted-foreground">
            Track all changes and activities related to your team members.
          </p>
        </div>
        
        <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 mt-4 md:mt-0 w-full md:w-auto">
          <div className="w-full md:w-auto">
            <Input 
              placeholder="Search history..." 
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full md:w-auto"
            />
          </div>
          <div className="w-full md:w-auto">
            <Select value={actionTypeFilter} onValueChange={setActionTypeFilter}>
              <SelectTrigger className="w-full md:w-[180px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="creation">Creation</SelectItem>
                <SelectItem value="update">Update</SelectItem>
                <SelectItem value="role_change">Role Change</SelectItem>
                <SelectItem value="status_change">Status Change</SelectItem>
                <SelectItem value="deletion">Deletion</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button 
            variant="outline" 
            onClick={handleRefresh} 
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
        </div>
      </div>

      {filteredHistory.length === 0 ? (
        <div className="text-center py-10 border rounded-lg bg-gray-50">
          <p className="text-muted-foreground">No team history records found.</p>
          {actionTypeFilter !== "all" || searchTerm ? (
            <p className="text-sm text-muted-foreground mt-2">Try adjusting your filters</p>
          ) : null}
        </div>
      ) : (
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
              {filteredHistory.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium whitespace-nowrap">
                    <div className="flex flex-col">
                      <span>{record.timestamp ? format(new Date(record.timestamp), 'MMM d, yyyy') : 'Unknown'}</span>
                      <span className="text-xs text-muted-foreground">
                        {record.timestamp ? format(new Date(record.timestamp), 'h:mm a') : ''}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {record.timestamp ? `(${formatDistanceToNow(new Date(record.timestamp), { addSuffix: true })})` : ''}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={`flex items-center ${getActionColor(record.action_type)}`}>
                      {getActionIcon(record.action_type)}
                      {formatActionType(record.action_type)}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">{getActionDetails(record)}</TableCell>
                  <TableCell className="whitespace-nowrap">
                    <span className="text-sm">{record.action_by_name || 'System'}</span>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};
