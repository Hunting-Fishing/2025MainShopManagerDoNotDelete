
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Filter, SlidersHorizontal } from "lucide-react";
import { getPendingFollowUps, completeFollowUp } from "@/data/interactionsData";
import { CustomerInteraction } from "@/types/interaction";
import { InteractionTypeBadge } from "@/components/interactions/InteractionTypeBadge";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { teamMembers } from "@/data/teamData";

export default function CustomerFollowUps() {
  const [followUps, setFollowUps] = useState<CustomerInteraction[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<CustomerInteraction[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<Date[] | undefined>([]);
  const [showCompleted, setShowCompleted] = useState(false);

  useEffect(() => {
    // Load all pending follow-ups
    const allFollowUps = getPendingFollowUps();
    setFollowUps(allFollowUps);
    setFilteredFollowUps(allFollowUps);
  }, []);

  // Handle marking a follow-up as complete
  const handleCompleteFollowUp = (followUpId: string) => {
    const updatedFollowUp = completeFollowUp(followUpId);
    
    if (updatedFollowUp) {
      // Update local state to remove or update the follow-up
      if (!showCompleted) {
        setFollowUps(followUps.filter(fu => fu.id !== followUpId));
        setFilteredFollowUps(filteredFollowUps.filter(fu => fu.id !== followUpId));
      } else {
        setFollowUps(followUps.map(fu => fu.id === followUpId ? updatedFollowUp : fu));
        setFilteredFollowUps(filteredFollowUps.map(fu => fu.id === followUpId ? updatedFollowUp : fu));
      }
      
      toast({
        title: "Follow-up completed",
        description: "The follow-up has been marked as completed.",
      });
    }
  };

  // Apply filters
  const applyFilters = () => {
    let filtered = [...followUps];
    
    // Filter by staff member
    if (staffFilter !== "all") {
      filtered = filtered.filter(fu => fu.staffMemberId === staffFilter);
    }
    
    // Filter by date range
    if (dateRange && dateRange.length === 2) {
      const [startDate, endDate] = dateRange;
      filtered = filtered.filter(fu => {
        const followUpDate = new Date(fu.followUpDate);
        return followUpDate >= startDate && followUpDate <= endDate;
      });
    }
    
    // Filter by completed status
    if (!showCompleted) {
      filtered = filtered.filter(fu => !fu.followUpCompleted);
    }
    
    setFilteredFollowUps(filtered);
    setIsFiltersOpen(false);
  };

  // Reset filters
  const resetFilters = () => {
    setStaffFilter("all");
    setDateRange(undefined);
    setShowCompleted(false);
    setFilteredFollowUps(followUps);
    setIsFiltersOpen(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Customer Follow-Ups</h1>
          <p className="text-muted-foreground">
            Manage and track customer follow-up tasks
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4 md:mt-0">
          <Sheet open={isFiltersOpen} onOpenChange={setIsFiltersOpen}>
            <SheetTrigger asChild>
              <Button variant="outline">
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <SheetHeader>
                <SheetTitle>Filter Follow-Ups</SheetTitle>
              </SheetHeader>
              <div className="py-6 space-y-6">
                <div className="space-y-2">
                  <Label>Staff Member</Label>
                  <Select value={staffFilter} onValueChange={setStaffFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Staff Members" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Staff Members</SelectItem>
                      {teamMembers.map(member => (
                        <SelectItem key={member.id} value={member.id}>
                          {member.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label>Date Range</Label>
                  <Calendar
                    mode="range"
                    selected={dateRange}
                    onSelect={setDateRange}
                    numberOfMonths={2}
                    className="border rounded-md p-3"
                  />
                </div>
                
                <div className="flex items-center gap-2">
                  <Label>Show Completed</Label>
                  <Switch
                    checked={showCompleted}
                    onCheckedChange={setShowCompleted}
                  />
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={applyFilters} className="flex-1">
                    Apply Filters
                  </Button>
                  <Button variant="outline" onClick={resetFilters} className="flex-1">
                    Reset
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      <Card>
        <CardHeader className="bg-slate-50 border-b">
          <div className="flex justify-between items-center">
            <CardTitle className="text-lg">Upcoming Follow-Ups</CardTitle>
            <div className="text-sm text-slate-500">
              Showing {filteredFollowUps.length} follow-ups
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {filteredFollowUps.length === 0 ? (
            <div className="text-center py-8 text-slate-500">
              No follow-ups found. 
            </div>
          ) : (
            <div className="divide-y">
              {filteredFollowUps.map(followUp => (
                <div key={followUp.id} className="p-4 hover:bg-slate-50">
                  <div className="flex flex-col md:flex-row justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <InteractionTypeBadge type={followUp.type} />
                        {followUp.followUpCompleted ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Due: {new Date(followUp.followUpDate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{followUp.description}</p>
                      <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-slate-500">
                        <p>Customer: {followUp.customerName}</p>
                        <p>Staff: {followUp.staffMemberName}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/customers/${followUp.customerId}`}>
                          View Customer
                        </Link>
                      </Button>
                      {!followUp.followUpCompleted && (
                        <Button 
                          size="sm" 
                          onClick={() => handleCompleteFollowUp(followUp.id)}
                        >
                          <ClipboardCheck className="mr-2 h-4 w-4" />
                          Mark Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
