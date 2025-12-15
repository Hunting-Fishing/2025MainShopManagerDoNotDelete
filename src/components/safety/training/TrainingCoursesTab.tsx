import React from 'react';
import { Card, CardContent } from '@/components/ui/card';

interface Props { courses: any[]; loading: boolean; onCreate: (data: any) => void; }

export function TrainingCoursesTab({ courses, loading, onCreate }: Props) {
  if (loading) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>;
  return (
    <div className="space-y-4">
      {courses.length === 0 ? (
        <Card><CardContent className="py-12 text-center text-muted-foreground">No training courses configured</CardContent></Card>
      ) : (
        courses.map(course => (
          <Card key={course.id}><CardContent className="py-4">
            <h3 className="font-semibold">{course.course_name}</h3>
            <p className="text-sm text-muted-foreground">{course.description || 'No description'}</p>
          </CardContent></Card>
        ))
      )}
    </div>
  );
}
