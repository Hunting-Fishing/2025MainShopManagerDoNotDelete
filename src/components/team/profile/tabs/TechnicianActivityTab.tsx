
import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Search, AlertTriangle, Flag, Filter } from "lucide-react";
import { TeamMember } from "@/types/team";
import { format, parseISO } from "date-fns";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Textarea } from "@/components/ui/textarea";

interface TechnicianActivityTabProps {
  member: TeamMember;
}

export function TechnicianActivityTab({ member }: TechnicianActivityTabProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [flaggedOnly, setFlaggedOnly] = useState(false);
  const [sortBy, setSortBy] = useState("newest");
  const [activities, setActivities] = useState([]);
  const [filteredActivities, setFilteredActivities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [flagDialogOpen, setFlagDialogOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [flagReason, setFlagReason] = useState("");

  // This would fetch real data in a production environment
  useEffect(() => {
    // Simulate API call to fetch activities
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
    
    // In real implementation, this would be:
    // const fetchActivities = async () => {
    //   try {
    //     const { data } = await supabase.from('work_order_activities')
    //       .select('*')
    //       .eq('user_id', member.id)
    //       .order('timestamp', { ascending: false });
    //     
    //     setActivities(data || []);
    //   } catch (error) {
    //     console.error('Error fetching activities:', error);
    //   } finally {
    //     setIsLoading(false);
    //   }
    // };
    // fetchActivities();
    
    setTimeout(() => {
      setActivities(mockActivities);
      setIsLoading(false);
    }, 500);
  }, [member.id]);

  // Apply filters and search to activities
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

  // Handle flag dialog
  const openFlagDialog = (activity) => {
    setSelectedActivity(activity);
    setFlagReason("");
    setFlagDialogOpen(true);
  };
  
  const submitFlag = async () => {
    if (!selectedActivity || !flagReason.trim()) return;
    
    // In a real implementation, this would save to the database
    // Try {
    //   await recordFlaggedActivity(
    //     member.id,
    //     selectedActivity.id,
    //     selectedActivity.type,
    //     flagReason,
    //     currentUserId,
    //     currentUserName
    //   );
    //
    //   // Update local state to show the flag immediately
    //   setActivities(prevActivities => 
    //     prevActivities.map(act => 
    //       act.id === selectedActivity.id ? { ...act, flagged: true, flagReason } : act
    //     )
    //   );
    // } catch (error) {
    //   console.error('Error flagging activity:', error);
    // }
    
    // For the demo, just update the local state
    setActivities(prevActivities => 
      prevActivities.map(act => 
        act.id === selectedActivity.id ? { ...act, flagged: true, flagReason } : act
      )
    );
    
    setFlagDialogOpen(false);
  };

  const getActivityTypeIcon = (type: string) => {
    switch (type) {
      case "workOrder":
        return <Badge className="bg-blue-500">Work Order</Badge>;
      case "communication":
        return <Badge className="bg-green-500">Communication</Badge>;
      case "parts":
        return <Badge className="bg-purple-500">Parts</Badge>;
      case "invoice":
        return <Badge className="bg-amber-500">Invoice</Badge>;
      default:
        return <Badge className="bg-slate-500">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle>Activity History</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center items-center h-64">
          <p className="text-muted-foreground">Loading activity history...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="shadow-sm">
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Activity History</span>
            <div className="flex items-center gap-2">
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => setFlaggedOnly(!flaggedOnly)}
                className={flaggedOnly ? "bg-red-50 text-red-700 border-red-200" : ""}
              >
                <Flag className={`h-4 w-4 mr-1 ${flaggedOnly ? "text-red-500" : ""}`} />
                {flaggedOnly ? "Show All" : "Flagged Only"}
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-4">
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-grow">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search activities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-8"
                />
              </div>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="workOrder">Work Order</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="parts">Parts</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest first</SelectItem>
                  <SelectItem value="oldest">Oldest first</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {filteredActivities.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                {activities.length === 0 ? (
                  <>No activities recorded for this team member.</>
                ) : (
                  <>No activities match your filters.</>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredActivities.map((activity) => (
                  <div 
                    key={activity.id} 
                    className={`border rounded-lg p-4 relative hover:bg-slate-50 transition-colors ${
                      activity.flagged ? "border-red-300 bg-red-50" : ""
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex flex-wrap items-center gap-2 mb-1">
                          {getActivityTypeIcon(activity.type)}
                          <span className="text-muted-foreground text-xs">
                            {format(parseISO(activity.date), "PPP p")}
                          </span>
                        </div>
                        
                        <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">
                          {activity.description}
                        </p>
                        
                        {activity.flagged && (
                          <div className="mt-2 flex items-center text-xs text-red-600 bg-red-50 p-2 rounded border border-red-200">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            <span>Flagged: {activity.flagReason}</span>
                          </div>
                        )}
                      </div>
                      
                      <div className="ml-2">
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0"
                                onClick={() => openFlagDialog(activity)}
                                disabled={activity.flagged}
                              >
                                <Flag className={`h-4 w-4 ${activity.flagged ? "text-red-500" : "text-slate-400"}`} />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent side="left">
                              {activity.flagged ? "Already flagged" : "Flag this activity"}
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <AlertDialog open={flagDialogOpen} onOpenChange={setFlagDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Flag Activity</AlertDialogTitle>
            <AlertDialogDescription>
              Flag this activity for review. Please provide a reason why this activity requires attention.
            </AlertDialogDescription>
          </AlertDialogHeader>
          
          <div className="my-4">
            <p className="text-sm font-medium mb-2">Activity:</p>
            <p className="text-sm border p-2 rounded-md bg-slate-50">
              {selectedActivity?.description}
            </p>
            
            <p className="text-sm font-medium mt-4 mb-2">Reason for flagging:</p>
            <Textarea
              value={flagReason}
              onChange={(e) => setFlagReason(e.target.value)}
              placeholder="Explain why this activity requires review..."
              className="resize-none"
            />
          </div>
          
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={submitFlag}
              disabled={!flagReason.trim()}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Flag Activity
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
