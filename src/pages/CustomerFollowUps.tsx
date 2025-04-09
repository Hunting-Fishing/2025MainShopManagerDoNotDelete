import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardCheck, Filter, SlidersHorizontal } from "lucide-react";
import { getPendingFollowUps, completeFollowUp } from "@/services/customer/customerInteractionsService";
import { CustomerInteraction } from "@/types/interaction";
import { InteractionTypeBadge } from "@/components/interactions/InteractionTypeBadge";
import { toast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { DateRange } from "react-day-picker";
import { teamMembers } from "@/data/teamData";

export default function CustomerFollowUps() {
  const [followUps, setFollowUps] = useState<CustomerInteraction[]>([]);
  const [filteredFollowUps, setFilteredFollowUps] = useState<CustomerInteraction[]>([]);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);
  const [staffFilter, setStaffFilter] = useState<string>("all");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [showCompleted, setShowCompleted] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadFollowUps();
  }, []);

  const loadFollowUps = async () => {
    try {
      setLoading(true);
      const pendingFollowUps = await getPendingFollowUps();
      setFollowUps(pendingFollowUps);
      setFilteredFollowUps(pendingFollowUps);
    } catch (error) {
      console.error("Error loading follow-ups:", error);
      toast({
        title: "Error",
        description: "Failed to load follow-ups. Please try again.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCompleteFollowUp = async (followUpId: string) => {
    try {
      const updatedFollowUp = await completeFollowUp(followUpId);
      
      if (updatedFollowUp) {
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
    } catch (error) {
      console.error("Error completing follow-up:", error);
      toast({
        title: "Error",
        description: "Failed to complete follow-up. Please try again.",
        variant: "destructive"
      });
    }
  };

  const applyFilters = () => {
    let filtered = [...followUps];
    
    if (staffFilter !== "all") {
      filtered = filtered.filter(fu => fu.staff_member_id === staffFilter);
    }
    
    if (dateRange && dateRange.from && dateRange.to) {
      filtered = filtered.filter(fu => {
        if (!fu.follow_up_date) return false;
        const followUpDate = new Date(fu.follow_up_date);
        const from = dateRange.from as Date;
        const to = dateRange.to as Date;
        return followUpDate >= from && followUpDate <= to;
      });
    }
    
    if (!showCompleted) {
      filtered = filtered.filter(fu => !fu.follow_up_completed);
    }
    
    setFilteredFollowUps(filtered);
    setIsFiltersOpen(false);
  };

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
                    className="border rounded-md p-3 pointer-events-auto"
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
          {loading ? (
            <div className="text-center py-8 text-slate-500">
              Loading follow-ups...
            </div>
          ) : filteredFollowUps.length === 0 ? (
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
                        {followUp.follow_up_completed ? (
                          <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded">Completed</span>
                        ) : (
                          <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2.5 py-0.5 rounded">
                            Due: {new Date(followUp.follow_up_date as string).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                      <p className="font-medium">{followUp.description}</p>
                      <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-slate-500">
                        <p>Customer: {followUp.customer_name}</p>
                        <p>Staff: {followUp.staff_member_name}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        asChild
                      >
                        <Link to={`/customers/${followUp.customer_id}`}>
                          View Customer
                        </Link>
                      </Button>
                      {!followUp.follow_up_completed && (
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
