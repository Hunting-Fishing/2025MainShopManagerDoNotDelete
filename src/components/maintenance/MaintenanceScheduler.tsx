
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { CalendarIcon, CalendarPlus } from "lucide-react";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Equipment, MaintenanceFrequency, MaintenanceSchedule } from "@/types/equipment";
import { maintenanceFrequencyMap } from "@/data/equipmentData";
import { toast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { v4 as uuidv4 } from 'uuid';

interface MaintenanceSchedulerProps {
  equipmentList: Equipment[];
}

export function MaintenanceScheduler({ equipmentList }: MaintenanceSchedulerProps) {
  const [selectedEquipmentId, setSelectedEquipmentId] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [frequency, setFrequency] = useState<MaintenanceFrequency>("quarterly");
  const [nextDate, setNextDate] = useState<Date | undefined>(new Date());
  const [duration, setDuration] = useState<number>(2);
  const [technician, setTechnician] = useState<string>("");
  const [isRecurring, setIsRecurring] = useState<boolean>(true);
  const [enableNotifications, setEnableNotifications] = useState<boolean>(true);
  const [reminderDays, setReminderDays] = useState<number>(7);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  
  const navigate = useNavigate();
  
  const selectedEquipment = equipmentList.find(item => item.id === selectedEquipmentId);
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedEquipmentId || !description || !nextDate) {
      toast({
        title: "Missing Fields",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    // Create the maintenance schedule
    const newSchedule: MaintenanceSchedule = {
      frequencyType: frequency,
      nextDate: format(nextDate, "yyyy-MM-dd"),
      description,
      estimatedDuration: duration,
      technician: technician || undefined,
      isRecurring,
      notificationsEnabled: enableNotifications,
      reminderDays,
    };
    
    try {
      // In a real application, you would save this to the database
      console.log("New maintenance schedule created:", newSchedule);
      
      // Show success toast
      toast({
        title: "Schedule Created",
        description: "The maintenance schedule has been created successfully.",
      });
      
      // Reset form
      setDescription("");
      setFrequency("quarterly");
      setNextDate(new Date());
      setDuration(2);
      setTechnician("");
      
      // Navigate to equipment details
      navigate(`/equipment/${selectedEquipmentId}`);
    } catch (error) {
      console.error("Error creating maintenance schedule:", error);
      toast({
        title: "Error",
        description: "Failed to create maintenance schedule. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-lg">Schedule New Maintenance</CardTitle>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="equipment">Equipment</Label>
              <Select 
                value={selectedEquipmentId} 
                onValueChange={setSelectedEquipmentId}
              >
                <SelectTrigger id="equipment">
                  <SelectValue placeholder="Select equipment" />
                </SelectTrigger>
                <SelectContent>
                  {equipmentList.map((item) => (
                    <SelectItem key={item.id} value={item.id}>
                      {item.name} ({item.customer})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="frequency">Maintenance Frequency</Label>
              <Select 
                value={frequency} 
                onValueChange={(value) => setFrequency(value as MaintenanceFrequency)}
              >
                <SelectTrigger id="frequency">
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(maintenanceFrequencyMap).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="date">Next Due Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !nextDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {nextDate ? format(nextDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={nextDate}
                    onSelect={setNextDate}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="duration">Estimated Duration (hours)</Label>
              <Input
                id="duration"
                type="number"
                min="0.5"
                step="0.5"
                value={duration}
                onChange={(e) => setDuration(parseFloat(e.target.value))}
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              placeholder="Describe the maintenance task"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="technician">Assigned Technician (Optional)</Label>
            <Input
              id="technician"
              placeholder="Technician name"
              value={technician}
              onChange={(e) => setTechnician(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="recurring"
              checked={isRecurring}
              onCheckedChange={setIsRecurring}
            />
            <Label htmlFor="recurring">Recurring Maintenance</Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Switch
              id="notifications"
              checked={enableNotifications}
              onCheckedChange={setEnableNotifications}
            />
            <Label htmlFor="notifications">Enable Notifications</Label>
          </div>
          
          {enableNotifications && (
            <div className="space-y-2 pl-6">
              <Label htmlFor="reminderDays">Send Reminder (days before)</Label>
              <Input
                id="reminderDays"
                type="number"
                min="1"
                max="30"
                value={reminderDays}
                onChange={(e) => setReminderDays(parseInt(e.target.value))}
                className="max-w-[200px]"
              />
            </div>
          )}
          
          <div className="pt-2 flex justify-end">
            <Button type="submit" disabled={isSubmitting}>
              <CalendarPlus className="mr-2 h-4 w-4" />
              {isSubmitting ? "Creating Schedule..." : "Create Schedule"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
