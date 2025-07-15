import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Target, Plus, Edit, Trash2, TrendingUp, TrendingDown, Minus } from "lucide-react";

interface ImpactMeasurement {
  id: string;
  measurement_name: string;
  measurement_type: string;
  category: string;
  description: string | null;
  baseline_value: number | null;
  baseline_date: string | null;
  current_value: number | null;
  target_value: number | null;
  unit_of_measure: string | null;
  measurement_period: string | null;
  last_measured_date: string | null;
  data_source: string | null;
  verification_method: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

interface ImpactMeasurementManagementProps {
  onSubmit?: () => Promise<void>;
}

export function ImpactMeasurementManagement({ onSubmit }: ImpactMeasurementManagementProps) {
  const { toast } = useToast();
  const [measurements, setMeasurements] = useState<ImpactMeasurement[]>([]);
  const [loading, setLoading] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeasurement, setEditingMeasurement] = useState<ImpactMeasurement | null>(null);
  const [formData, setFormData] = useState({
    measurement_name: "",
    measurement_type: "quantitative",
    category: "social",
    description: "",
    baseline_value: "",
    baseline_date: "",
    current_value: "",
    target_value: "",
    unit_of_measure: "",
    measurement_period: "monthly",
    last_measured_date: "",
    data_source: "",
    verification_method: "",
    notes: ""
  });

  useEffect(() => {
    loadMeasurements();
  }, []);

  const loadMeasurements = async () => {
    try {
      const { data, error } = await supabase
        .from("impact_measurements")
        .select("*")
        .order("last_measured_date", { ascending: false });

      if (error) throw error;
      setMeasurements(data || []);
    } catch (error) {
      console.error("Error loading impact measurements:", error);
      toast({
        title: "Error",
        description: "Failed to load impact measurements.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: profile } = await supabase
        .from("profiles")
        .select("shop_id")
        .eq("id", (await supabase.auth.getUser()).data.user?.id)
        .single();

      if (!profile?.shop_id) throw new Error("Shop not found");

      const measurementData = {
        ...formData,
        baseline_value: formData.baseline_value ? parseFloat(formData.baseline_value) : null,
        current_value: formData.current_value ? parseFloat(formData.current_value) : null,
        target_value: formData.target_value ? parseFloat(formData.target_value) : null,
        shop_id: profile.shop_id,
        created_by: (await supabase.auth.getUser()).data.user?.id
      };

      let result;
      if (editingMeasurement) {
        result = await supabase
          .from("impact_measurements")
          .update(measurementData)
          .eq("id", editingMeasurement.id)
          .select()
          .single();
      } else {
        result = await supabase
          .from("impact_measurements")
          .insert(measurementData)
          .select()
          .single();
      }

      if (result.error) throw result.error;

      toast({
        title: "Success",
        description: `Impact measurement ${editingMeasurement ? "updated" : "created"} successfully.`,
      });

      setIsDialogOpen(false);
      setEditingMeasurement(null);
      resetForm();
      loadMeasurements();

      if (onSubmit) {
        await onSubmit();
      }
    } catch (error) {
      console.error("Error saving impact measurement:", error);
      toast({
        title: "Error",
        description: "Failed to save impact measurement.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      measurement_name: "",
      measurement_type: "quantitative",
      category: "social",
      description: "",
      baseline_value: "",
      baseline_date: "",
      current_value: "",
      target_value: "",
      unit_of_measure: "",
      measurement_period: "monthly",
      last_measured_date: "",
      data_source: "",
      verification_method: "",
      notes: ""
    });
  };

  const deleteMeasurement = async (measurementId: string) => {
    if (!confirm("Are you sure you want to delete this impact measurement?")) return;

    try {
      const { error } = await supabase
        .from("impact_measurements")
        .delete()
        .eq("id", measurementId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Impact measurement deleted successfully.",
      });

      loadMeasurements();
    } catch (error) {
      console.error("Error deleting measurement:", error);
      toast({
        title: "Error",
        description: "Failed to delete impact measurement.",
        variant: "destructive",
      });
    }
  };

  const openEditDialog = (measurement: ImpactMeasurement) => {
    setEditingMeasurement(measurement);
    setFormData({
      measurement_name: measurement.measurement_name,
      measurement_type: measurement.measurement_type,
      category: measurement.category,
      description: measurement.description || "",
      baseline_value: measurement.baseline_value?.toString() || "",
      baseline_date: measurement.baseline_date || "",
      current_value: measurement.current_value?.toString() || "",
      target_value: measurement.target_value?.toString() || "",
      unit_of_measure: measurement.unit_of_measure || "",
      measurement_period: measurement.measurement_period || "monthly",
      last_measured_date: measurement.last_measured_date || "",
      data_source: measurement.data_source || "",
      verification_method: measurement.verification_method || "",
      notes: measurement.notes || ""
    });
    setIsDialogOpen(true);
  };

  const getProgressValue = (measurement: ImpactMeasurement) => {
    if (!measurement.baseline_value || !measurement.current_value || !measurement.target_value) return 0;
    
    const progress = ((measurement.current_value - measurement.baseline_value) / 
                     (measurement.target_value - measurement.baseline_value)) * 100;
    return Math.max(0, Math.min(100, progress));
  };

  const getTrendIcon = (measurement: ImpactMeasurement) => {
    if (!measurement.baseline_value || !measurement.current_value) return <Minus className="h-4 w-4 text-gray-400" />;
    
    if (measurement.current_value > measurement.baseline_value) {
      return <TrendingUp className="h-4 w-4 text-green-500" />;
    } else if (measurement.current_value < measurement.baseline_value) {
      return <TrendingDown className="h-4 w-4 text-red-500" />;
    } else {
      return <Minus className="h-4 w-4 text-gray-400" />;
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'social': return 'bg-blue-500';
      case 'environmental': return 'bg-green-500';
      case 'economic': return 'bg-purple-500';
      case 'educational': return 'bg-orange-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              Impact Measurements
            </CardTitle>
            <CardDescription>
              Track and measure social, environmental, and economic impact metrics
            </CardDescription>
          </div>
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button size="sm" className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Measurement
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingMeasurement ? "Edit" : "Add"} Impact Measurement
                </DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="measurement_name">Measurement Name</Label>
                    <Input
                      id="measurement_name"
                      value={formData.measurement_name}
                      onChange={(e) => setFormData({ ...formData, measurement_name: e.target.value })}
                      placeholder="e.g., Number of People Fed"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Category</Label>
                    <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="social">Social</SelectItem>
                        <SelectItem value="environmental">Environmental</SelectItem>
                        <SelectItem value="economic">Economic</SelectItem>
                        <SelectItem value="educational">Educational</SelectItem>
                        <SelectItem value="health">Health</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="measurement_type">Measurement Type</Label>
                    <Select value={formData.measurement_type} onValueChange={(value) => setFormData({ ...formData, measurement_type: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="quantitative">Quantitative</SelectItem>
                        <SelectItem value="qualitative">Qualitative</SelectItem>
                        <SelectItem value="binary">Binary (Yes/No)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="unit_of_measure">Unit of Measure</Label>
                    <Input
                      id="unit_of_measure"
                      value={formData.unit_of_measure}
                      onChange={(e) => setFormData({ ...formData, unit_of_measure: e.target.value })}
                      placeholder="e.g., people, kg, hours"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="Detailed description of what this measurement tracks"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="baseline_value">Baseline Value</Label>
                    <Input
                      id="baseline_value"
                      type="number"
                      step="0.01"
                      value={formData.baseline_value}
                      onChange={(e) => setFormData({ ...formData, baseline_value: e.target.value })}
                      placeholder="Starting value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="current_value">Current Value</Label>
                    <Input
                      id="current_value"
                      type="number"
                      step="0.01"
                      value={formData.current_value}
                      onChange={(e) => setFormData({ ...formData, current_value: e.target.value })}
                      placeholder="Current value"
                    />
                  </div>
                  <div>
                    <Label htmlFor="target_value">Target Value</Label>
                    <Input
                      id="target_value"
                      type="number"
                      step="0.01"
                      value={formData.target_value}
                      onChange={(e) => setFormData({ ...formData, target_value: e.target.value })}
                      placeholder="Target value"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="baseline_date">Baseline Date</Label>
                    <Input
                      id="baseline_date"
                      type="date"
                      value={formData.baseline_date}
                      onChange={(e) => setFormData({ ...formData, baseline_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="last_measured_date">Last Measured</Label>
                    <Input
                      id="last_measured_date"
                      type="date"
                      value={formData.last_measured_date}
                      onChange={(e) => setFormData({ ...formData, last_measured_date: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label htmlFor="measurement_period">Measurement Period</Label>
                    <Select value={formData.measurement_period} onValueChange={(value) => setFormData({ ...formData, measurement_period: value })}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="daily">Daily</SelectItem>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="quarterly">Quarterly</SelectItem>
                        <SelectItem value="annually">Annually</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="data_source">Data Source</Label>
                    <Input
                      id="data_source"
                      value={formData.data_source}
                      onChange={(e) => setFormData({ ...formData, data_source: e.target.value })}
                      placeholder="e.g., Manual count, Survey, System data"
                    />
                  </div>
                  <div>
                    <Label htmlFor="verification_method">Verification Method</Label>
                    <Input
                      id="verification_method"
                      value={formData.verification_method}
                      onChange={(e) => setFormData({ ...formData, verification_method: e.target.value })}
                      placeholder="e.g., Third-party audit, Photo evidence"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Notes</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Additional notes and observations"
                    rows={3}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? "Saving..." : editingMeasurement ? "Update" : "Create"} Measurement
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {measurements.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            No impact measurements configured yet. Create your first measurement to start tracking impact.
          </div>
        ) : (
          <div className="space-y-4">
            {measurements.map((measurement) => (
              <div key={measurement.id} className="border rounded-lg p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <h4 className="font-medium">{measurement.measurement_name}</h4>
                    <Badge className={getCategoryColor(measurement.category)}>
                      {measurement.category}
                    </Badge>
                    <Badge variant="outline" className="capitalize">
                      {measurement.measurement_type}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-2">
                    {getTrendIcon(measurement)}
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(measurement)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => deleteMeasurement(measurement.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {measurement.description && (
                  <p className="text-sm text-muted-foreground">{measurement.description}</p>
                )}

                <div className="grid grid-cols-4 gap-4 text-sm">
                  <div>
                    <Label className="text-muted-foreground">Baseline</Label>
                    <div className="font-medium">
                      {measurement.baseline_value !== null ? 
                        `${measurement.baseline_value}${measurement.unit_of_measure ? ` ${measurement.unit_of_measure}` : ''}` : 
                        'Not set'
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Current</Label>
                    <div className="font-medium">
                      {measurement.current_value !== null ? 
                        `${measurement.current_value}${measurement.unit_of_measure ? ` ${measurement.unit_of_measure}` : ''}` : 
                        'Not measured'
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Target</Label>
                    <div className="font-medium">
                      {measurement.target_value !== null ? 
                        `${measurement.target_value}${measurement.unit_of_measure ? ` ${measurement.unit_of_measure}` : ''}` : 
                        'Not set'
                      }
                    </div>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">Last Measured</Label>
                    <div className="font-medium">
                      {measurement.last_measured_date ? 
                        new Date(measurement.last_measured_date).toLocaleDateString() : 
                        'Never'
                      }
                    </div>
                  </div>
                </div>

                {measurement.baseline_value !== null && measurement.target_value !== null && (
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Progress to Target</span>
                      <span>{getProgressValue(measurement).toFixed(1)}%</span>
                    </div>
                    <Progress value={getProgressValue(measurement)} className="h-2" />
                  </div>
                )}

                {(measurement.data_source || measurement.verification_method) && (
                  <div className="grid grid-cols-2 gap-4 text-sm border-t pt-3">
                    {measurement.data_source && (
                      <div>
                        <Label className="text-muted-foreground">Data Source</Label>
                        <div>{measurement.data_source}</div>
                      </div>
                    )}
                    {measurement.verification_method && (
                      <div>
                        <Label className="text-muted-foreground">Verification</Label>
                        <div>{measurement.verification_method}</div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}