import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Clock, Play, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

interface LearningPathProgress {
  id: string;
  title: string;
  description: string;
  estimatedMinutes: number;
  difficulty: string;
  articlesCount: number;
  completedArticles: number;
  status: 'not_started' | 'in_progress' | 'completed';
  completionPercentage: number;
  timeSpentMinutes: number;
}

interface ProgressTrackingProps {
  className?: string;
}

export const ProgressTracking: React.FC<ProgressTrackingProps> = ({ className = '' }) => {
  const [learningPaths, setLearningPaths] = useState<LearningPathProgress[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProgressData();
  }, []);

  const fetchProgressData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setLoading(false);
        return;
      }

      // Fetch all learning paths
      const { data: pathsData } = await supabase
        .from('help_learning_paths')
        .select('id, title, description, difficulty_level')
        .eq('is_active', true)
        .order('created_at');

      if (pathsData) {
        // For now, use simulated progress data
        const pathsWithProgress = pathsData.map((path, index) => {
          const articlesCount = 4; // Default articles per path
          const completedArticles = Math.floor(Math.random() * (articlesCount + 1));
          const completionPercentage = articlesCount > 0 
            ? Math.round((completedArticles / articlesCount) * 100)
            : 0;

          return {
            id: path.id,
            title: path.title,
            description: path.description,
            estimatedMinutes: [180, 300, 240, 450][index] || 180,
            difficulty: path.difficulty_level || 'beginner',
            articlesCount,
            completedArticles,
            status: completionPercentage === 100 ? 'completed' : 
                   completionPercentage > 0 ? 'in_progress' : 'not_started',
            completionPercentage,
            timeSpentMinutes: completionPercentage * 2 // Estimate based on progress
          } as LearningPathProgress;
        });

        setLearningPaths(pathsWithProgress);
      }
    } catch (error) {
      console.error('Error fetching progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStartPath = async (pathId: string) => {
    navigate(`/help/path/${pathId}`);
  };

  const handleContinuePath = (pathId: string) => {
    navigate(`/help/path/${pathId}`);
  };

  const getStatusIcon = (status: string, completionPercentage: number) => {
    if (status === 'completed' || completionPercentage === 100) {
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    } else if (status === 'in_progress') {
      return <Play className="h-5 w-5 text-blue-500" />;
    } else {
      return <Circle className="h-5 w-5 text-muted-foreground" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800 border-green-200';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'advanced': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (loading) {
    return (
      <div className={`space-y-4 ${className}`}>
        {[...Array(3)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
              <div className="h-2 bg-muted rounded w-full mb-2"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold mb-2">Your Learning Progress</h2>
        <p className="text-muted-foreground">
          Track your journey through our learning paths
        </p>
      </div>

      <div className="grid gap-6">
        {learningPaths.map((path) => (
          <Card key={path.id} className="hover:shadow-md transition-shadow animate-fade-in">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3">
                  {getStatusIcon(path.status, path.completionPercentage)}
                  <div className="flex-1">
                    <CardTitle className="text-lg">{path.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {path.description}
                    </p>
                  </div>
                </div>
                <Badge 
                  variant="outline" 
                  className={getDifficultyColor(path.difficulty)}
                >
                  {path.difficulty}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Progress Bar */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{path.completionPercentage}%</span>
                </div>
                <Progress value={path.completionPercentage} className="h-2" />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>{path.completedArticles} of {path.articlesCount} articles</span>
                  {path.timeSpentMinutes > 0 && (
                    <span>{path.timeSpentMinutes} minutes spent</span>
                  )}
                </div>
              </div>

              {/* Meta Information */}
              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>{path.estimatedMinutes} min</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4" />
                  <span>{path.articlesCount} articles</span>
                </div>
              </div>

              {/* Action Button */}
              <div className="flex justify-between items-center pt-2">
                <div>
                  {path.status === 'completed' && (
                    <Badge variant="secondary" className="text-green-700 bg-green-50">
                      ✓ Completed
                    </Badge>
                  )}
                  {path.status === 'in_progress' && (
                    <Badge variant="secondary" className="text-blue-700 bg-blue-50">
                      In Progress
                    </Badge>
                  )}
                </div>
                
                <Button
                  onClick={() => 
                    path.status === 'not_started' 
                      ? handleStartPath(path.id)
                      : handleContinuePath(path.id)
                  }
                  variant={path.status === 'not_started' ? 'default' : 'outline'}
                  size="sm"
                >
                  {path.status === 'not_started' ? 'Start Learning' : 'Continue'}
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {learningPaths.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Learning Paths Available</h3>
            <p className="text-muted-foreground">
              Learning paths will appear here once they're created by administrators.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};