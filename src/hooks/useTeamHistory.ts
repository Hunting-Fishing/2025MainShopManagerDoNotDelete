
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";

interface HistoryRecord {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  action: string;
  details: string;
  flagged: boolean;
  resolved: boolean;
}

export function useTeamHistory() {
  const [loading, setLoading] = useState(true);
  const [history, setHistory] = useState<HistoryRecord[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<HistoryRecord[]>([]);
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
      // In a real implementation, this would fetch data from Supabase
      // For now, we'll use mock data
      const mockData: HistoryRecord[] = [
        {
          id: "1",
          timestamp: "2023-05-15T12:30:00Z",
          userId: "user-123",
          userName: "John Smith",
          action: "Login",
          details: "User logged in from San Francisco, CA",
          flagged: false,
          resolved: false
        },
        {
          id: "2",
          timestamp: "2023-05-15T13:45:00Z",
          userId: "user-456",
          userName: "Jane Doe",
          action: "Update",
          details: "Updated customer information for Customer ID: CUST-789",
          flagged: true,
          resolved: false
        },
        {
          id: "3",
          timestamp: "2023-05-16T09:15:00Z",
          userId: "user-789",
          userName: "Bob Johnson",
          action: "Create",
          details: "Created a new work order WO-123 for vehicle servicing",
          flagged: false,
          resolved: false
        },
        {
          id: "4",
          timestamp: "2023-05-16T11:20:00Z",
          userId: "user-123",
          userName: "John Smith",
          action: "Delete",
          details: "Deleted inventory item INV-456",
          flagged: true,
          resolved: true
        },
        {
          id: "5",
          timestamp: "2023-05-17T14:05:00Z",
          userId: "user-456",
          userName: "Jane Doe",
          action: "Permission Change",
          details: "Changed role from 'User' to 'Admin'",
          flagged: false,
          resolved: false
        }
      ];

      setHistory(mockData);
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
          record.userName.toLowerCase().includes(term) ||
          record.userId.toLowerCase().includes(term) ||
          record.details.toLowerCase().includes(term) ||
          record.action.toLowerCase().includes(term)
      );
    }

    // Apply action type filter
    if (actionTypeFilter !== "all") {
      if (actionTypeFilter === "flagged") {
        filtered = filtered.filter((record) => record.flagged);
      } else {
        filtered = filtered.filter((record) =>
          record.action.toLowerCase().includes(actionTypeFilter.toLowerCase())
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
