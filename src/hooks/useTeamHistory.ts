
import { useState, useEffect } from 'react';
import { fetchAllTeamHistory, TeamMemberHistoryRecord } from '@/utils/team/history';
import { useToast } from "@/components/ui/use-toast";

export function useTeamHistory() {
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
  }, []);

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

  const handleRefresh = () => {
    loadTeamHistory();
    toast({
      title: "Refreshed",
      description: "Team history has been refreshed",
      duration: 2000
    });
  };

  return {
    loading,
    teamHistory,
    filteredHistory,
    actionTypeFilter,
    setActionTypeFilter,
    searchTerm,
    setSearchTerm,
    handleRefresh
  };
}
