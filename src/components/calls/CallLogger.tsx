
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Phone,
  Plus,
  Calendar,
  User,
  Clock,
  MessageSquare
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { WorkOrder } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { formatDate } from "@/utils/workOrders/formatters";

interface LoggedCall {
  id: string;
  date: string;
  duration: number;
  type: "incoming" | "outgoing" | "missed";
  notes: string;
  staffMember: string;
}

interface CallLoggerProps {
  workOrder: WorkOrder;
}

export function CallLogger({ workOrder }: CallLoggerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [calls, setCalls] = useState<LoggedCall[]>([]);
  const [formState, setFormState] = useState({
    date: new Date().toISOString().slice(0, 10),
    time: new Date().toTimeString().slice(0, 5),
    duration: 5,
    type: "outgoing",
    notes: "",
    staffMember: "Current User"
  });
  
  const handleLogCall = () => {
    const newCall: LoggedCall = {
      id: crypto.randomUUID(),
      date: `${formState.date}T${formState.time}:00Z`,
      duration: formState.duration,
      type: formState.type as "incoming" | "outgoing" | "missed",
      notes: formState.notes,
      staffMember: formState.staffMember
    };
    
    setCalls(prev => [newCall, ...prev]);
    setShowDialog(false);
    
    toast({
      title: "Call Logged",
      description: `Successfully logged a ${formState.duration} minute ${formState.type} call.`,
    });
  };
  
  const getCallTypeColor = (type: string) => {
    switch (type) {
      case "incoming":
        return "bg-green-100 text-green-800 border-green-300";
      case "outgoing":
        return "bg-blue-100 text-blue-800 border-blue-300";
      case "missed":
        return "bg-red-100 text-red-800 border-red-300";
      default:
        return "";
    }
  };
  
  return (
    <Card>
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center">
          <Phone className="h-5 w-5 mr-2 text-muted-foreground" />
          <CardTitle className="text-lg">Call Log</CardTitle>
        </div>
        
        <Button variant="outline" size="sm" onClick={() => setShowDialog(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Log Call
        </Button>
      </CardHeader>
      
      <CardContent>
        {calls.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No calls have been logged for this work order yet
          </div>
        ) : (
          <div className="space-y-4">
            {calls.map((call) => (
              <div key={call.id} className="border rounded-md p-4">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <Badge variant="outline" className={getCallTypeColor(call.type)}>
                      {call.type.charAt(0).toUpperCase() + call.type.slice(1)}
                    </Badge>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5 mr-1" />
                      {formatDate(call.date)}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {call.duration} minutes
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <User className="h-3.5 w-3.5 mr-1" />
                      {call.staffMember}
                    </div>
                  </div>
                  
                  {call.notes && (
                    <div className="bg-slate-50 p-3 rounded-md mt-2 w-full max-w-md">
                      <div className="flex items-center text-sm font-medium mb-1">
                        <MessageSquare className="h-3.5 w-3.5 mr-1" />
                        Notes
                      </div>
                      <p className="text-sm">{call.notes}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
      
      {/* Add Call Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log a Call</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formState.date}
                  onChange={(e) => setFormState({...formState, date: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formState.time}
                  onChange={(e) => setFormState({...formState, time: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="1"
                  value={formState.duration}
                  onChange={(e) => setFormState({...formState, duration: parseInt(e.target.value) || 0})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="type">Call Type</Label>
                <Select
                  value={formState.type}
                  onValueChange={(value) => setFormState({...formState, type: value})}
                >
                  <SelectTrigger id="type">
                    <SelectValue placeholder="Select call type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="incoming">Incoming</SelectItem>
                    <SelectItem value="outgoing">Outgoing</SelectItem>
                    <SelectItem value="missed">Missed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={formState.notes}
                onChange={(e) => setFormState({...formState, notes: e.target.value})}
                placeholder="Enter any notes about the call..."
                rows={3}
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleLogCall}>
              Log Call
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
