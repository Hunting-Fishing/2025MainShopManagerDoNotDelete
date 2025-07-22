import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Users, Play, CheckCircle, Lock } from "lucide-react";

export const LearningPathViewer: React.FC = () => {
  const [selectedPath, setSelectedPath] = useState<any>(null);
  const [completedArticles] = useState<Set<string>>(new Set());

  const mockPaths = [
    {
      id: '1',
      title: 'New Shop Owner Onboarding',
      description: 'Complete onboarding path for new shop owners',
      difficulty_level: 'beginner',
      estimated_duration: '2-3 hours',
      target_role: 'Shop Owner',
      articles: ['Setting Up Your Shop Profile', 'First Work Order Walkthrough'],
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">Structured learning journeys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {mockPaths.map((path) => (
          <Card key={path.id} className="cursor-pointer hover:shadow-lg transition-shadow">
            <CardHeader>
              <Badge variant="secondary">{path.difficulty_level}</Badge>
              <CardTitle className="text-lg">{path.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
              <div className="flex items-center gap-2 mb-4">
                <BookOpen className="h-4 w-4" />
                <span className="text-sm">{path.articles.length} articles</span>
              </div>
              <Progress value={0} className="h-2" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};