import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface Props { assignments: any[]; courses: any[]; loading: boolean; onAssign: (data: any) => void; onUpdate: (id: string, data: any) => void; }

export function TrainingAssignmentsTab({ assignments, loading }: Props) {
  if (loading) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>;
  return (
    <div className="space-y-4">
      {assignments.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No training assignments</CardContent></Card>
      ) : (
        assignments.map(assignment => (
          <Card key={assignment.id}><CardContent className="py-4 flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{assignment.course?.course_name || 'Course'}</h3>
              <p className="text-sm text-muted-foreground">{assignment.employee?.first_name} {assignment.employee?.last_name}</p>
            </div>
            <Badge variant={assignment.status === 'completed' ? 'default' : 'secondary'}>{assignment.status}</Badge>
          </CardContent></Card>
        ))
      )}
    </div>
  );
}
