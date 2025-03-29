
import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Calendar, Eye, Plus, Search, Tag, Wrench } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RepairPlan } from "@/types/repairPlan";
import { formatDate } from "@/utils/workOrderUtils";

interface RepairPlansListProps {
  repairPlans: RepairPlan[];
  title?: string;
  showFilters?: boolean;
  showHeader?: boolean;
  limit?: number;
}

export function RepairPlansList({ 
  repairPlans, 
  title = "Repair Plans", 
  showFilters = true,
  showHeader = true,
  limit
}: RepairPlansListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  
  // Filter repair plans based on search and filters
  const filteredPlans = repairPlans.filter(plan => {
    const matchesSearch = !searchQuery || 
      plan.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      plan.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || plan.status === statusFilter;
    const matchesPriority = priorityFilter === "all" || plan.priority === priorityFilter;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });
  
  // Apply limit if specified
  const displayedPlans = limit ? filteredPlans.slice(0, limit) : filteredPlans;
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft': return 'bg-slate-200 text-slate-800';
      case 'scheduled': return 'bg-blue-100 text-blue-800';
      case 'in-progress': return 'bg-yellow-100 text-yellow-800';
      case 'completed': return 'bg-green-100 text-green-800';
      case 'cancelled': return 'bg-red-100 text-red-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };
  
  const calculateProgress = (plan: RepairPlan) => {
    const tasksCompleted = plan.tasks.filter(task => task.completed).length;
    const totalTasks = plan.tasks.length;
    return totalTasks ? Math.round((tasksCompleted / totalTasks) * 100) : 0;
  };
  
  return (
    <Card>
      {showHeader && (
        <CardHeader className="bg-muted/50">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <CardTitle className="text-lg flex items-center">
              <Wrench className="mr-2 h-5 w-5" />
              {title}
            </CardTitle>
            <Link to="/repair-plans/new">
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                New Repair Plan
              </Button>
            </Link>
          </div>
        </CardHeader>
      )}
      
      {showFilters && (
        <div className="p-4 border-b">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Search repair plans..."
                className="pl-8 w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-3">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger className="w-[130px]">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      )}
      
      <CardContent className="p-0">
        {displayedPlans.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Wrench className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium">No repair plans found</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {searchQuery || statusFilter !== "all" || priorityFilter !== "all" 
                ? "Try adjusting your filters." 
                : "Create a new repair plan to get started."}
            </p>
            {!showFilters && !limit && (
              <Link to="/repair-plans/new" className="mt-4">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Repair Plan
                </Button>
              </Link>
            )}
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Title</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Scheduled Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {displayedPlans.map((plan) => {
                const progress = calculateProgress(plan);
                
                return (
                  <TableRow key={plan.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{plan.title}</div>
                        <div className="text-sm text-muted-foreground truncate max-w-xs">
                          {plan.description}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(plan.status)}>
                        {plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge className={getPriorityColor(plan.priority)}>
                        {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div className="w-full bg-slate-200 rounded-full h-2.5 mr-2">
                          <div className={`h-2.5 rounded-full ${progress === 100 ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${progress}%` }}></div>
                        </div>
                        <span className="text-xs whitespace-nowrap">{progress}%</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {plan.scheduledDate ? (
                        <div className="flex items-center text-sm">
                          <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                          {formatDate(plan.scheduledDate)}
                        </div>
                      ) : (
                        <span className="text-sm text-muted-foreground">Not scheduled</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end space-x-2">
                        <Link to={`/repair-plans/${plan.id}`}>
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Link to={`/work-orders/new?repairPlan=${plan.id}`}>
                          <Button variant="ghost" size="sm">
                            <Tag className="h-4 w-4" />
                          </Button>
                        </Link>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
        
        {limit && filteredPlans.length > limit && (
          <div className="p-4 text-center">
            <Link to="/repair-plans">
              <Button variant="outline" size="sm">
                View All Repair Plans
              </Button>
            </Link>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
