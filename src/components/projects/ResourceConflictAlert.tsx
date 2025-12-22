import { AlertTriangle, Users, Truck, Ship, Car, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useResourceConflicts, ResourceConflict } from '@/hooks/useResourceConflicts';
import { Skeleton } from '@/components/ui/skeleton';

const resourceIcons = {
  employee: Users,
  equipment: Truck,
  vessel: Ship,
  vehicle: Car
};

function ConflictItem({ conflict }: { conflict: ResourceConflict }) {
  const [isOpen, setIsOpen] = useState(false);
  const Icon = resourceIcons[conflict.resourceType] || Users;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <div className={`p-3 rounded-lg border ${
        conflict.severity === 'critical' 
          ? 'bg-destructive/10 border-destructive/30' 
          : 'bg-yellow-500/10 border-yellow-500/30'
      }`}>
        <CollapsibleTrigger asChild>
          <Button variant="ghost" className="w-full p-0 h-auto hover:bg-transparent">
            <div className="flex items-center justify-between w-full">
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  conflict.severity === 'critical' ? 'bg-destructive/20' : 'bg-yellow-500/20'
                }`}>
                  <Icon className={`h-4 w-4 ${
                    conflict.severity === 'critical' ? 'text-destructive' : 'text-yellow-600'
                  }`} />
                </div>
                <div className="text-left">
                  <p className="font-medium text-foreground">{conflict.resourceName}</p>
                  <p className="text-xs text-muted-foreground capitalize">
                    {conflict.resourceType} • {conflict.assignments.length} overlapping assignments
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={conflict.severity === 'critical' ? 'destructive' : 'secondary'}>
                  {conflict.totalAllocation}% allocated
                </Badge>
                {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
              </div>
            </div>
          </Button>
        </CollapsibleTrigger>
        
        <CollapsibleContent>
          <div className="mt-3 pt-3 border-t border-border/50 space-y-2">
            <p className="text-xs text-muted-foreground">
              Overlap period: {format(conflict.overlapPeriod.start, 'MMM d, yyyy')} - {format(conflict.overlapPeriod.end, 'MMM d, yyyy')}
            </p>
            <div className="space-y-1">
              {conflict.assignments.map((assignment, idx) => (
                <div key={idx} className="flex items-center justify-between text-sm bg-background/50 rounded p-2">
                  <span className="text-foreground">{assignment.projectName}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      {format(assignment.startDate, 'MMM d')} - {format(assignment.endDate, 'MMM d')}
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {assignment.allocationPercent}%
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </div>
    </Collapsible>
  );
}

export function ResourceConflictAlert() {
  const { conflicts, hasConflicts, criticalCount, warningCount, isLoading } = useResourceConflicts();

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className