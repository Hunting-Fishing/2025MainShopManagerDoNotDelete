
import { useState } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "@/components/ui/use-toast";

interface DataField {
  id: string;
  name: string;
  category: string;
}

interface CustomReportBuilderProps {
  onGenerateReport: (config: ReportConfig) => void;
}

interface ReportConfig {
  title: string;
  description: string;
  fields: string[];
  filters: Record<string, any>;
  sorting: {
    field: string;
    direction: "asc" | "desc";
  };
  groupBy?: string;
}

const AVAILABLE_FIELDS: DataField[] = [
  // Financial fields
  { id: "revenue", name: "Revenue", category: "financial" },
  { id: "expenses", name: "Expenses", category: "financial" },
  { id: "profit", name: "Profit", category: "financial" },
  { id: "profit_margin", name: "Profit Margin", category: "financial" },
  { id: "average_ticket", name: "Average Ticket", category: "financial" },
  
  // Service fields
  { id: "service_count", name: "Service Count", category: "service" },
  { id: "labor_hours", name: "Labor Hours", category: "service" },
  { id: "completion_time", name: "Avg. Completion Time", category: "service" },
  { id: "on_time_percent", name: "On-Time Percentage", category: "service" },
  { id: "comeback_rate", name: "Comeback Rate", category: "service" },
  
  // Customer fields
  { id: "customer_count", name: "Customer Count", category: "customer" },
  { id: "new_customers", name: "New Customers", category: "customer" },
  { id: "repeat_rate", name: "Repeat Customer Rate", category: "customer" },
  { id: "satisfaction", name: "Customer Satisfaction", category: "customer" },
  
  // Inventory fields
  { id: "inventory_turnover", name: "Inventory Turnover", category: "inventory" },
  { id: "parts_cost", name: "Parts Cost", category: "inventory" },
  { id: "low_stock_count", name: "Low Stock Items", category: "inventory" },
  { id: "out_of_stock_count", name: "Out of Stock Items", category: "inventory" }
];

export function CustomReportBuilder({ onGenerateReport }: CustomReportBuilderProps) {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("fields");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [groupBy, setGroupBy] = useState("");
  const [sortField, setSortField] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");
  
  const handleToggleField = (fieldId: string) => {
    setSelectedFields((prev) => 
      prev.includes(fieldId) 
        ? prev.filter(id => id !== fieldId)
        : [...prev, fieldId]
    );
  };

  const handleGenerateReport = () => {
    if (!title) {
      toast({
        title: "Report title required",
        description: "Please provide a title for your report",
        variant: "destructive"
      });
      return;
    }

    if (selectedFields.length === 0) {
      toast({
        title: "No fields selected",
        description: "Please select at least one field for your report",
        variant: "destructive"
      });
      return;
    }

    const reportConfig: ReportConfig = {
      title,
      description,
      fields: selectedFields,
      filters: {}, // Could be expanded with more filter options
      sorting: {
        field: sortField || selectedFields[0],
        direction: sortDirection,
      },
      groupBy: groupBy || undefined
    };

    onGenerateReport(reportConfig);
    setOpen(false);
    
    toast({
      title: "Custom report generated",
      description: "Your report has been created successfully"
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Custom Report</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Create Custom Report</DialogTitle>
          <DialogDescription>
            Build your own customized report by selecting fields and parameters.
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="mt-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="fields">Fields</TabsTrigger>
            <TabsTrigger value="organization">Organization</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
          
          <TabsContent value="fields" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input
                id="report-title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Monthly Performance Report"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="report-description">Description (Optional)</Label>
              <Input
                id="report-description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Performance metrics for the current month"
              />
            </div>
            
            <div className="mt-4">
              <Label>Select Fields</Label>
              <div className="grid grid-cols-2 gap-3 mt-2 max-h-[300px] overflow-y-auto pr-2">
                {Object.entries(
                  AVAILABLE_FIELDS.reduce((acc, field) => {
                    if (!acc[field.category]) {
                      acc[field.category] = [];
                    }
                    acc[field.category].push(field);
                    return acc;
                  }, {} as Record<string, DataField[]>)
                ).map(([category, fields]) => (
                  <div key={category} className="border rounded-md p-3">
                    <h3 className="font-medium capitalize mb-2">{category}</h3>
                    <div className="space-y-2">
                      {fields.map((field) => (
                        <div key={field.id} className="flex items-center space-x-2">
                          <Checkbox 
                            id={`field-${field.id}`}
                            checked={selectedFields.includes(field.id)}
                            onCheckedChange={() => handleToggleField(field.id)}
                          />
                          <Label htmlFor={`field-${field.id}`}>{field.name}</Label>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="organization" className="space-y-4 pt-4">
            <div className="grid gap-2">
              <Label htmlFor="group-by">Group By (Optional)</Label>
              <select
                id="group-by"
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                value={groupBy}
                onChange={(e) => setGroupBy(e.target.value)}
              >
                <option value="">No Grouping</option>
                <option value="month">Month</option>
                <option value="week">Week</option>
                <option value="day">Day</option>
                <option value="service_type">Service Type</option>
                <option value="technician">Technician</option>
                <option value="location">Location</option>
              </select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="sort-by">Sort By</Label>
                <select
                  id="sort-by"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={sortField}
                  onChange={(e) => setSortField(e.target.value)}
                >
                  <option value="">Select Field</option>
                  {selectedFields.map((fieldId) => {
                    const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
                    return field ? (
                      <option key={field.id} value={field.id}>{field.name}</option>
                    ) : null;
                  })}
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="sort-direction">Sort Direction</Label>
                <select
                  id="sort-direction"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                  value={sortDirection}
                  onChange={(e) => setSortDirection(e.target.value as "asc" | "desc")}
                >
                  <option value="asc">Ascending</option>
                  <option value="desc">Descending</option>
                </select>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="preview" className="pt-4">
            <div className="border rounded-md p-4">
              <h3 className="font-medium text-lg">{title || "Untitled Report"}</h3>
              {description && <p className="text-sm text-muted-foreground mb-4">{description}</p>}
              
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium">Selected Fields:</h4>
                  {selectedFields.length > 0 ? (
                    <ul className="list-disc pl-5 mt-1">
                      {selectedFields.map((fieldId) => {
                        const field = AVAILABLE_FIELDS.find(f => f.id === fieldId);
                        return field ? (
                          <li key={field.id}>{field.name}</li>
                        ) : null;
                      })}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No fields selected</p>
                  )}
                </div>
                
                {groupBy && (
                  <div>
                    <h4 className="font-medium">Grouping:</h4>
                    <p className="text-sm">
                      {groupBy === "month" ? "Monthly" : 
                       groupBy === "week" ? "Weekly" : 
                       groupBy === "day" ? "Daily" : 
                       groupBy === "service_type" ? "By Service Type" : 
                       groupBy === "technician" ? "By Technician" : 
                       groupBy === "location" ? "By Location" : "None"}
                    </p>
                  </div>
                )}
                
                {sortField && (
                  <div>
                    <h4 className="font-medium">Sorting:</h4>
                    <p className="text-sm">
                      {AVAILABLE_FIELDS.find(f => f.id === sortField)?.name} ({sortDirection === "asc" ? "Ascending" : "Descending"})
                    </p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleGenerateReport}>Generate Report</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
