
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

export function DashboardFilters() {
  return (
    <div className="sticky top-0 z-10 mb-6 flex flex-wrap gap-2 bg-white/80 backdrop-blur-sm p-3 shadow-sm border border-gray-200 rounded-xl">
      <div className="relative flex-1 min-w-[200px]">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input 
          placeholder="Search..." 
          className="pl-9 rounded-full border-gray-200"
        />
      </div>
      <Select defaultValue="all">
        <SelectTrigger className="w-[180px] rounded-full border-gray-200">
          <SelectValue placeholder="Filter by status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Statuses</SelectItem>
          <SelectItem value="active">Active</SelectItem>
          <SelectItem value="completed">Completed</SelectItem>
          <SelectItem value="pending">Pending</SelectItem>
        </SelectContent>
      </Select>
      <Button variant="outline" className="rounded-full border-gray-200 hover:bg-gray-50">
        <Filter className="mr-2 h-4 w-4" />
        More Filters
      </Button>
    </div>
  );
}
