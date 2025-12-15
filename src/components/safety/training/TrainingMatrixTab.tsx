import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface Props { assignments: any[]; courses: any[]; loading: boolean; }

export function TrainingMatrixTab({ assignments, courses, loading }: Props) {
  if (loading) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>;
  return (
    <Card><CardHeader><CardTitle>Training Compliance Matrix</CardTitle></CardHeader>
      <CardContent>
        <p className="text-muted-foreground">Training matrix showing employee compliance across all required courses.</p>
        <p className="text-sm mt-2">{courses.length} courses, {assignments.length} assignments tracked</p>
      </CardContent>
    </Card>
  );
}
