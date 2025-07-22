import React, { useState } from 'react';
import { BookOpen, Clock, CheckCircle, PlayCircle, Award, Users, Target, ArrowRight, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useHelpLearningPaths } from '@/hooks/useHelp';

interface LearningPathViewerProps {
  pathId?: string;
}

export const LearningPathViewer: React.FC<LearningPathViewerProps> = ({ pathId }) => {
  const [completedArticles, setCompletedArticles] = useState<Set<string>>(new Set());
  const { data: learningPaths = [], isLoading } = useHelpLearningPaths();

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'default';
      case 'intermediate': return 'secondary';
      case 'advanced': return 'destructive';
      default: return 'outline';
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role.toLowerCase()) {
      case 'shop owner':
      case 'owner':
        return <Award className="h-4 w-4" />;
      case 'manager':
        return <Target className="h-4 w-4" />;
      case 'technician':
        return <Users className="h-4 w-4" />;
      default:
        return <BookOpen className="h-4 w-4" />;
    }
  };

  const toggleArticleCompletion = (articleTitle: string) => {
    setCompletedArticles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(articleTitle)) {
        newSet.delete(articleTitle);
      } else {
        newSet.add(articleTitle);
      }
      return newSet;
    });
  };

  const calculateProgress = (articles: string[]) => {
    return articles.length > 0 ? (completedArticles.size / articles.length) * 100 : 0;
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
        ))}
      </div>
    );
  }

  // If pathId is provided, show single path detail view
  if (pathId) {
    const path = learningPaths.find(p => p.id === pathId);
    if (!path) {
      return (
        <Card>
          <CardContent className="py-8 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Learning Path Not Found</h3>
            <p className="text-muted-foreground">The requested learning path could not be found.</p>
          </CardContent>
        </Card>
      );
    }

    const progress = calculateProgress(path.articles);

    return (
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getRoleIcon(path.target_role)}
                  <Badge variant="outline">{path.target_role}</Badge>
                  <Badge variant={getDifficultyColor(path.difficulty_level) as any}>
                    {path.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-2xl">{path.title}</CardTitle>
                <CardDescription className="text-lg">{path.description}</CardDescription>
              </div>
              <div className="text-right">
                <div className="text-sm text-muted-foreground mb-1">Progress</div>
                <div className="text-2xl font-bold">{Math.round(progress)}%</div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{path.estimated_duration}</span>
                </div>
                <div className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{path.articles.length} articles</span>
                </div>
                <div className="flex items-center gap-2">
                  <Star className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">4.8/5 rating</span>
                </div>
              </div>
              
              <Progress value={progress} className="h-2" />
              
              {path.prerequisites.length > 0 && (
                <div>
                  <h4 className="font-medium mb-2">Prerequisites</h4>
                  <div className="flex flex-wrap gap-2">
                    {path.prerequisites.map((prereq) => (
                      <Badge key={prereq} variant="outline" className="text-xs">
                        {prereq}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Learning Path Articles</CardTitle>
            <CardDescription>Complete articles in order for the best learning experience</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {path.articles.map((articleTitle, index) => {
                const isCompleted = completedArticles.has(articleTitle);
                const isLocked = index > 0 && !completedArticles.has(path.articles[index - 1]);
                
                return (
                  <div 
                    key={articleTitle}
                    className={`p-4 border rounded-lg transition-colors ${
                      isCompleted ? 'bg-green-50 border-green-200' : 
                      isLocked ? 'bg-muted/50 border-muted' : 
                      'bg-background border-border hover:bg-muted/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full border-2">
                          {isCompleted ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : isLocked ? (
                            <span className="text-muted-foreground text-sm">{index + 1}</span>
                          ) : (
                            <PlayCircle className="h-5 w-5 text-primary" />
                          )}
                        </div>
                        <div>
                          <h5 className={`font-medium ${isLocked ? 'text-muted-foreground' : ''}`}>
                            {articleTitle}
                          </h5>
                          <p className="text-sm text-muted-foreground">
                            Article {index + 1} of {path.articles.length}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {!isLocked && (
                          <>
                            {isCompleted ? (
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => toggleArticleCompletion(articleTitle)}
                              >
                                Mark Incomplete
                              </Button>
                            ) : (
                              <Button 
                                variant="default" 
                                size="sm"
                                onClick={() => toggleArticleCompletion(articleTitle)}
                              >
                                Mark Complete
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <ArrowRight className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {progress === 100 && (
          <Card className="bg-green-50 border-green-200">
            <CardContent className="py-6 text-center">
              <Award className="h-12 w-12 text-green-600 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-green-800 mb-2">
                Congratulations! Path Completed
              </h3>
              <p className="text-green-700 mb-4">
                You've successfully completed the {path.title} learning path.
              </p>
              <Button variant="default">
                Download Certificate
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    );
  }

  // Show all learning paths overview
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Learning Paths</h2>
        <p className="text-muted-foreground">
          Structured learning sequences designed to take you from beginner to expert in specific areas.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {learningPaths.map((path) => {
          const progress = calculateProgress(path.articles);
          
          return (
            <Card key={path.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg">
              <CardHeader>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    {getRoleIcon(path.target_role)}
                    <Badge variant="outline" className="text-xs">
                      {path.target_role}
                    </Badge>
                  </div>
                  <Badge variant={getDifficultyColor(path.difficulty_level) as any} className="text-xs">
                    {path.difficulty_level}
                  </Badge>
                </div>
                <CardTitle className="text-lg">{path.title}</CardTitle>
                <CardDescription>{path.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <BookOpen className="h-3 w-3" />
                        {path.articles.length} articles
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {path.estimated_duration}
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span>Progress</span>
                      <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>

                  <Separator />

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">
                      {path.prerequisites.length > 0 ? 
                        `${path.prerequisites.length} prerequisites` : 
                        'No prerequisites'
                      }
                    </div>
                    <Button size="sm" variant="outline">
                      Start Path
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {learningPaths.length === 0 && (
        <Card>
          <CardContent className="py-12 text-center">
            <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">No Learning Paths Available</h3>
            <p className="text-muted-foreground">
              Learning paths are being prepared and will be available soon.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};