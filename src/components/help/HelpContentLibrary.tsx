
import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, MessageSquare, Star, Clock, Users } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: 'tutorial' | 'guide' | 'video' | 'faq';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedTime: string;
  rating: number;
  views: number;
  tags: string[];
  lastUpdated: string;
}

const helpArticles: HelpArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Work Orders',
    description: 'Learn the basics of creating, managing, and tracking work orders in your shop.',
    category: 'tutorial',
    difficulty: 'beginner',
    estimatedTime: '5 min',
    rating: 4.8,
    views: 2341,
    tags: ['work-orders', 'getting-started', 'basics'],
    lastUpdated: '2024-01-15'
  },
  {
    id: '2',
    title: 'Advanced Customer Management',
    description: 'Deep dive into customer relationship management, communication tools, and analytics.',
    category: 'guide',
    difficulty: 'advanced',
    estimatedTime: '15 min',
    rating: 4.6,
    views: 1892,
    tags: ['customers', 'crm', 'analytics'],
    lastUpdated: '2024-01-10'
  },
  {
    id: '3',
    title: 'Video: Dashboard Overview',
    description: 'Visual walkthrough of the main dashboard features and navigation.',
    category: 'video',
    difficulty: 'beginner',
    estimatedTime: '8 min',
    rating: 4.9,
    views: 3456,
    tags: ['dashboard', 'overview', 'navigation'],
    lastUpdated: '2024-01-12'
  },
  {
    id: '4',
    title: 'Inventory Management Setup',
    description: 'Configure and optimize your inventory tracking system for maximum efficiency.',
    category: 'tutorial',
    difficulty: 'intermediate',
    estimatedTime: '12 min',
    rating: 4.7,
    views: 1567,
    tags: ['inventory', 'setup', 'configuration'],
    lastUpdated: '2024-01-08'
  },
  {
    id: '5',
    title: 'Common Login Issues',
    description: 'Troubleshoot authentication problems and security settings.',
    category: 'faq',
    difficulty: 'beginner',
    estimatedTime: '3 min',
    rating: 4.5,
    views: 987,
    tags: ['login', 'authentication', 'troubleshooting'],
    lastUpdated: '2024-01-14'
  },
  {
    id: '6',
    title: 'Setting Up Email Notifications',
    description: 'Configure automated email notifications for customers and staff.',
    category: 'guide',
    difficulty: 'intermediate',
    estimatedTime: '10 min',
    rating: 4.4,
    views: 1234,
    tags: ['email', 'notifications', 'automation'],
    lastUpdated: '2024-01-11'
  }
];

const getCategoryIcon = (category: string) => {
  switch (category) {
    case 'tutorial':
      return <BookOpen className="h-4 w-4" />;
    case 'guide':
      return <FileText className="h-4 w-4" />;
    case 'video':
      return <Video className="h-4 w-4" />;
    case 'faq':
      return <MessageSquare className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case 'beginner':
      return 'success';
    case 'intermediate':
      return 'warning';
    case 'advanced':
      return 'destructive';
    default:
      return 'secondary';
  }
};

const getCategoryColor = (category: string) => {
  switch (category) {
    case 'tutorial':
      return 'success';
    case 'guide':
      return 'info';
    case 'video':
      return 'warning';
    case 'faq':
      return 'secondary';
    default:
      return 'secondary';
  }
};

export const HelpContentLibrary: React.FC = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [articles, setArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      const { data, error } = await supabase
        .from('help_articles')
        .select('*')
        .eq('status', 'published')
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const transformedArticles = data.map(article => ({
        id: article.id,
        title: article.title,
        description: article.content.substring(0, 150) + '...',
        category: article.category as any,
        difficulty: 'beginner' as any, // You could add this field to your DB
        estimatedTime: '5 min', // You could calculate or store this
        rating: 4.5, // You could calculate from feedback
        views: article.view_count || 0,
        tags: article.tags || [],
        lastUpdated: article.updated_at
      }));

      setArticles(transformedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredArticles = selectedCategory === 'all' 
    ? articles 
    : articles.filter(article => article.category === selectedCategory);

  const categories = [
    { id: 'all', label: 'All Content', count: articles.length },
    { id: 'tutorial', label: 'Tutorials', count: articles.filter(a => a.category === 'tutorial').length },
    { id: 'guide', label: 'Guides', count: articles.filter(a => a.category === 'guide').length },
    { id: 'video', label: 'Videos', count: articles.filter(a => a.category === 'video').length },
    { id: 'faq', label: 'FAQ', count: articles.filter(a => a.category === 'faq').length }
  ];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap gap-2">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-10 w-24 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-64 bg-muted rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {categories.map((category) => (
          <Button
            key={category.id}
            variant={selectedCategory === category.id ? 'default' : 'outline'}
            onClick={() => setSelectedCategory(category.id)}
            className="h-auto py-2 px-4"
          >
            {category.label}
            <Badge variant="secondary" className="ml-2">
              {category.count}
            </Badge>
          </Button>
        ))}
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredArticles.map((article) => (
          <Card 
            key={article.id} 
            className="cursor-pointer transition-colors hover:bg-muted/50"
            onClick={() => window.location.href = `/help?id=${article.id}`}
          >
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  {getCategoryIcon(article.category)}
                  <Badge variant={getCategoryColor(article.category) as any} className="text-xs">
                    {article.category}
                  </Badge>
                </div>
                <Badge variant={getDifficultyColor(article.difficulty) as any} className="text-xs">
                  {article.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-lg">{article.title}</CardTitle>
              <CardDescription>{article.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {article.estimatedTime}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {article.views.toLocaleString()}
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                  {article.rating}
                </div>
              </div>
              <div className="flex flex-wrap gap-1 mb-3">
                {article.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {article.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{article.tags.length - 3} more
                  </Badge>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                Updated {new Date(article.lastUpdated).toLocaleDateString()}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};
