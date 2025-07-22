import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Clock, Trophy, Users, Play, CheckCircle, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface LearningPath {
  id: string;
  title: string;
  description: string;
  difficulty_level: string;
  estimated_duration: string;
  target_role: string;
  prerequisites: string[];
  learning_objectives: string[];
  completion_reward: string;
  is_active: boolean;
}

export const LearningPathViewer: React.FC = () => {
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [selectedPath, setSelectedPath] = useState<LearningPath | null>(null);
  const [completedArticles] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchLearningPaths();
  }, []);

  const fetchLearningPaths = async () => {
    try {
      const { data, error } = await supabase
        .from('help_learning_paths')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setLearningPaths((data as any) || []);
    } catch (error) {
      console.error('Error fetching learning paths:', error);
      toast({
        title: "Error",
        description: "Failed to load learning paths",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'beginner':
        return 'secondary';
      case 'intermediate':
        return 'default';
      case 'advanced':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Learning Paths</h2>
            <p className="text-muted-foreground">Structured learning journeys</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader>
                <div className="h-6 bg-muted rounded w-20 mb-2"></div>
                <div className="h-6 bg-muted rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-16 bg-muted rounded mb-4"></div>
                <div className="h-4 bg-muted rounded w-24 mb-4"></div>
                <div className="h-2 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Learning Paths</h2>
          <p className="text-muted-foreground">Structured learning journeys</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className="cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => setSelectedPath(path)}>
            <CardHeader>
              <Badge variant={getDifficultyColor(path.difficulty_level)}>
                {path.difficulty_level}
              </Badge>
              <CardTitle className="text-lg">{path.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">{path.description}</p>
              <div className="flex items-center gap-2 mb-2">
                <Clock className="h-4 w-4" />
                <span className="text-sm">{path.estimated_duration}</span>
              </div>
              <div className="flex items-center gap-2 mb-4">
                <Users className="h-4 w-4" />
                <span className="text-sm">{path.target_role}</span>
              </div>
              <Progress value={0} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">0% Complete</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {learningPaths.length === 0 && !loading && (
        <Card>
          <CardContent className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Available</h3>
            <p className="text-muted-foreground">Learning paths will appear here when available.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};