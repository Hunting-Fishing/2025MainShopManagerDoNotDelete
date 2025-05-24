import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Plus, Trash2, Clock, DollarSign, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "@/components/ui/use-toast";
import { mockEquipmentData } from "@/data/equipmentData";

interface RepairStep {
  id: string;
  title: string;
  description: string;
  estimatedTime: number;
  estimatedCost: number;
  required: boolean;
  category: "diagnosis" | "repair" | "replacement" | "maintenance";
}

interface RepairPlan {
  title: string;
  description: string;
  equipmentId: string;
  priority: "low" | "medium" | "high" | "urgent";
  estimatedDuration: number;
  estimatedCost: number;
  steps: RepairStep[];
}

export default function CreateRepairPlan() {
  const navigate = useNavigate();
  const [plan, setPlan] = useState<RepairPlan>({
    title: "",
    description: "",
    equipmentId: "",
    priority: "medium",
    estimatedDuration: 0,
    estimatedCost: 0,
    steps: []
  });

  const [newStep, setNewStep] = useState<Omit<RepairStep, "id">>({
    title: "",
    description: "",
    estimatedTime: 0,
    estimatedCost: 0,
    required: true,
    category: "diagnosis"
  });

  // Use mock data for now - in a real app this would come from the API
  const equipment = mockEquipmentData;

  const addStep = () => {
    if (!newStep.title.trim()) {
      toast({
        title: "Error",
        description: "Step title is required",
        variant: "destructive"
      });
      return;
    }

    const step: RepairStep = {
      ...newStep,
      id: Date.now().toString()
    };

    setPlan(prev => ({
      ...prev,
      steps: [...prev.steps, step]
    }));

    // Reset form
    setNewStep({
      title: "",
      description: "",
      estimatedTime: 0,
      estimatedCost: 0,
      required: true,
      category: "diagnosis"
    });

    updateTotals([...plan.steps, step]);
  };

  const removeStep = (stepId: string) => {
    const updatedSteps = plan.steps.filter(step => step.id !== stepId);
    setPlan(prev => ({
      ...prev,
      steps: updatedSteps
    }));
    updateTotals(updatedSteps);
  };

  const updateTotals = (steps: RepairStep[]) => {
    const totalTime = steps.reduce((sum, step) => sum + step.estimatedTime, 0);
    const totalCost = steps.reduce((sum, step) => sum + step.estimatedCost, 0);
    
    setPlan(prev => ({
      ...prev,
      estimatedDuration: totalTime,
      estimatedCost: totalCost
    }));
  };

  const handleSubmit = () => {
    if (!plan.title.trim() || !plan.equipmentId || plan.steps.length === 0) {
      toast({
        title: "Error",
        description: "Please fill in all required fields and add at least one step",
        variant: "destructive"
      });
      return;
    }

    // Here you would submit the plan to your API
    console.log("Submitting repair plan:", plan);
    
    toast({
      title: "Success",
      description: "Repair plan created successfully",
    });
    
    navigate("/equipment");
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low": return "bg-green-100 text-green-800";
      case "medium": return "bg-yellow-100 text-yellow-800";
      case "high": return "bg-orange-100 text-orange-800";
      case "urgent": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "diagnosis": return "bg-blue-100 text-blue-800";
      case "repair": return "bg-purple-100 text-purple-800";
      case "replacement": return "bg-red-100 text-red-800";
      case "maintenance": return "bg-green-100 text-green-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Create Repair Plan</h1>
        <p className="text-muted-foreground">Plan and estimate repair work for equipment</p>
      </div>

      <div className="grid gap-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="title">Plan Title *</Label>
                <Input
                  id="title"
                  value={plan.title}
                  onChange={(e) => setPlan(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="e.g., Hydraulic System Overhaul"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="equipment">Equipment *</Label>
                <Select value={plan.equipmentId} onValueChange={(value) => setPlan(prev => ({ ...prev, equipmentId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select equipment" />
                  </SelectTrigger>
                  <SelectContent>
                    {equipment.map((item) => (
                      <SelectItem key={item.id} value={item.id}>
                        {item.name} - {item.model}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={plan.description}
                onChange={(e) => setPlan(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Describe the repair plan objectives and scope"
                rows={3}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="priority">Priority</Label>
              <Select value={plan.priority} onValueChange={(value: any) => setPlan(prev => ({ ...prev, priority: value }))}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Repair Steps */}
        <Card>
          <CardHeader>
            <CardTitle>Repair Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-bold">Steps</h2>
                <Button variant="outline" onClick={addStep}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Step
                </Button>
              </div>
              <div className="grid gap-4">
                {plan.steps.map((step) => (
                  <div key={step.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={step.required}
                        onChange={(e) => {
                          const updatedSteps = plan.steps.map(s => s.id === step.id ? { ...s, required: e.target.checked } : s);
                          setPlan(prev => ({ ...prev, steps: updatedSteps }));
                        }}
                      />
                      <span className="font-medium">{step.title}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-muted-foreground">Estimated Time: {step.estimatedTime} hours</span>
                      <span className="text-muted-foreground">Estimated Cost: ${step.estimatedCost.toFixed(2)}</span>
                      <Button variant="ghost" size="sm" onClick={() => removeStep(step.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              Plan Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <Clock className="h-5 w-5 text-blue-600" />
                  <span className="font-medium">Estimated Duration</span>
                </div>
                <div className="text-2xl font-bold text-blue-600">
                  {plan.estimatedDuration} hours
                </div>
              </div>
              
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <DollarSign className="h-5 w-5 text-green-600" />
                  <span className="font-medium">Estimated Cost</span>
                </div>
                <div className="text-2xl font-bold text-green-600">
                  ${plan.estimatedCost.toFixed(2)}
                </div>
              </div>
              
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <AlertCircle className="h-5 w-5 text-purple-600" />
                  <span className="font-medium">Priority</span>
                </div>
                <Badge className={getPriorityColor(plan.priority)}>
                  {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex gap-4 justify-end">
          <Button variant="outline" onClick={() => navigate("/equipment")}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            Create Repair Plan
          </Button>
        </div>
      </div>
    </div>
  );
}
