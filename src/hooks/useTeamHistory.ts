
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { TeamMemberHistoryRecord, fetchAllTeamHistory } from "@/utils/team/history";

export function useTeamHistory() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<TeamMemberHistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<TeamMemberHistoryRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionTypeFilter, setActionTypeFilter] = useState("all");

  useEffect(() => {
    loadHistory();
  }, []);

  useEffect(() => {
    filterHistory();
  }, [history, searchTerm, actionTypeFilter]);

  const loadHistory = async () => {
    setLoading(true);
    try {
      // Use the existing fetchAllTeamHistory function to get real data from the database
      const historyData = await fetchAllTeamHistory(100, 0);
      setHistory(historyData);
    } catch (error) {
      console.error("Error loading team history:", error);
    } finally {
      setLoading(false);
    }
  };

  const filterHistory = () => {
    let filtered = [...history];

    // Apply search term filter
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (record) =>
          (record.action_by_name && record.action_by_name.toLowerCase().includes(term)) ||
          (record.action_type && record.action_type.toLowerCase().includes(term)) ||
          (record.details && JSON.stringify(record.details).toLowerCase().includes(term))
      );
    }

    // Apply action type filter
    if (actionTypeFilter !== "all") {
      if (actionTypeFilter === "flagged") {
        filtered = filtered.filter((record) => 
          record.details && record.details.flagged === true
        );
      } else {
        filtered = filtered.filter((record) =>
          record.action_type && record.action_type.toLowerCase() === actionTypeFilter.toLowerCase()
        );
      }
    }

    setFilteredHistory(filtered);
  };

  const handleRefresh = () => {
    loadHistory();
  };

  return {
    loading,
    history,
    filteredHistory,
    searchTerm,
    setSearchTerm,
    actionTypeFilter,
    setActionTypeFilter,
    handleRefresh
  };
}
