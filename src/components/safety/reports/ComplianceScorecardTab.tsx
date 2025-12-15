import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface Props { score: any; loading: boolean; }

export function ComplianceScorecardTab({ score, loading }: Props) {
  if (loading) return <Card><CardContent className="py-12 text-center">Loading...</CardContent></Card>;
  return (
    <div className="space-y-4">
      <Card><CardHeader><CardTitle>Overall Compliance Score</CardTitle></CardHeader>
        <CardContent>
          <div className="text-center mb-6">
            <p className="text-6xl font-bold" style={{ color: (score?.overall || 0) >= 80 ? 'green' : (score?.overall || 0) >= 60 ? 'orange' : 'red' }}>{score?.overall || 0}%</p>
          </div>
          <div className="space-y-4">
            <div><div className="flex justify-between mb-1"><span>Incidents</span><span>{score?.incidents || 0}%</span></div><Progress value={score?.incidents || 0} /></div>
            <div><div className="flex justify-between mb-1"><span>Inspections</span><span>{score?.inspections || 0}%</span></div><Progress value={score?.inspections || 0} /></div>
            <div><div className="flex justify-between mb-1"><span>Certifications</span><span>{score?.certifications || 0}%</span></div><Progress value={score?.certifications || 0} /></div>
            <div><div className="flex justify-between mb-1"><span>Training</span><span>{score?.training || 0}%</span></div><Progress value={score?.training || 0} /></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
