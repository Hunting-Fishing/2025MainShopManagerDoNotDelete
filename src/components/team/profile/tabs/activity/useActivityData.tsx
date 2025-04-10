
import { useState, useEffect } from "react";

export function useActivityData(memberId: string) {
  const [activities, setActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [filteredActivities, setFilteredActivities] = useState([]);

  // Fetch activity data
  useEffect(() => {
    setIsLoading(true);
    
    // Mock data for demonstration
    const mockActivities = [
      {
        id: "act1",
        type: "workOrder",
        date: "2023-12-01T15:20:00",
        description: "Completed work order #WO-2023-1201",
        flagged: false,
        workOrderId: "WO-2023-1201",
        customerId: "cust123"
      },
      {
        id: "act2",
        type: "workOrder",
        date: "2023-12-01T10:30:00",
        description: "Started work on work order #WO-2023-1205",
        flagged: false,
        workOrderId: "WO-2023-1205",
        customerId: "cust456"
      },
      {
        id: "act3",
        type: "communication",
        date: "2023-12-01T11:45:00",
        description: "Called customer about parts delay",
        flagged: true,
        flagReason: "Customer complained about rudeness",
        workOrderId: "WO-2023-1205",
        customerId: "cust456"
      },
      {
        id: "act4",
        type: "parts",
        date: "2023-12-01T14:15:00",
        description: "Requested additional parts for job",
        flagged: false,
        workOrderId: "WO-2023-1201",
        customerId: "cust123"
      },
      {
        id: "act5",
        type: "invoice",
        date: "2023-12-01T16:30:00",
        description: "Generated invoice #INV-2023-089",
        flagged: false,
        invoiceId: "INV-2023-089",
        customerId: "cust123"
      }
    ];
    
    // In a real implementation, this would fetch from Supabase
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 500);
  }, [memberId]);

  // Apply filters
  useEffect(() => {
    let filtered = [...activities];
    
    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(activity => 
        activity.description.toLowerCase().includes(query)
      );
    }
    
    // Apply type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter(activity => activity.type === typeFilter);
    }
    
    // Apply flagged filter
    if (flaggedOnly) {
      filtered = filtered.filter(activity => activity.flagged);
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      
      if (sortBy === "newest") {
        return dateB - dateA;
      } else {
        return dateA - dateB;
      }
    });
    
    setFilteredActivities(filtered);
  }, [activities, searchQuery, typeFilter, flaggedOnly, sortBy]);

  return {
    activities,
    isLoading,
    searchQuery,
    setSearchQuery,
    typeFilter,
    setTypeFilter,
    flaggedOnly,
    setFlaggedOnly,
    sortBy,
    setSortBy,
    filteredActivities,
    setActivities
  };
}
