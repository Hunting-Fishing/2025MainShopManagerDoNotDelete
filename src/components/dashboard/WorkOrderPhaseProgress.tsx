
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { PhaseProgressItem } from "@/types/dashboard";
import { Loader2 } from "lucide-react";

interface WorkOrderPhaseProgressProps {
  data: PhaseProgressItem[];
  isLoading: boolean;
}

export function WorkOrderPhaseProgress({ data, isLoading }: WorkOrderPhaseProgressProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Phase Work Orders Progress</CardTitle>
          <CardDescription>Status of complex work orders with multiple phases</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Multi-Phase Work Orders Progress</CardTitle>
          <CardDescription>Status of complex work orders with multiple phases</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center justify-center h-64">
          <p className="text-muted-foreground">No multi-phase work orders found</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Multi-Phase Work Orders Progress</CardTitle>
        <CardDescription>Status of complex work orders with multiple phases</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {data.map((item) => (
          <div key={item.id} className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="font-medium truncate">{item.name}</span>
              <span className="text-sm text-muted-foreground">
                {item.completedPhases} / {item.totalPhases} phases
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Progress value={item.progress} className="h-2" />
              <span className="text-sm font-medium">{item.progress}%</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
