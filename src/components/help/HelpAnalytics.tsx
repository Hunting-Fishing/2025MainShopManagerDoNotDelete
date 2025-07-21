
import React from 'react';
import { TrendingUp, Users, BookOpen, MessageSquare, Clock, Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface HelpMetric {
  id: string;
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'stable';
  icon: React.ReactNode;
}

interface PopularArticle {
  id: string;
  title: string;
  category: string;
  views: number;
  rating: number;
  helpfulness: number;
}

const helpMetrics: HelpMetric[] = [
  {
    id: '1',
    label: 'Total Help Views',
    value: '12,847',
    change: '+12.3%',
    trend: 'up',
    icon: <BookOpen className="h-4 w-4" />
  },
  {
    id: '2',
    label: 'Active Users',
    value: '3,421',
    change: '+8.7%',
    trend: 'up',
    icon: <Users className="h-4 w-4" />
  },
  {
    id: '3',
    label: 'Support Tickets',
    value: '234',
    change: '-15.2%',
    trend: 'down',
    icon: <MessageSquare className="h-4 w-4" />
  },
  {
    id: '4',
    label: 'Avg. Resolution Time',
    value: '2.3h',
    change: '-22.1%',
    trend: 'down',
    icon: <Clock className="h-4 w-4" />
  }
];

const popularArticles: PopularArticle[] = [
  {
    id: '1',
    title: 'Getting Started with Work Orders',
    category: 'tutorial',
    views: 2341,
    rating: 4.8,
    helpfulness: 95
  },
  {
    id: '2',
    title: 'Dashboard Overview Video',
    category: 'video',
    views: 1892,
    rating: 4.9,
    helpfulness: 98
  },
  {
    id: '3',
    title: 'Customer Management Guide',
    category: 'guide',
    views: 1567,
    rating: 4.6,
    helpfulness: 87
  },
  {
    id: '4',
    title: 'Common Login Issues',
    category: 'faq',
    views: 1234,
    rating: 4.5,
    helpfulness: 82
  },
  {
    id: '5',
    title: 'Inventory Setup Tutorial',
    category: 'tutorial',
    views: 987,
    rating: 4.7,
    helpfulness: 91
  }
];

const getTrendIcon = (trend: string) => {
  switch (trend) {
    case 'up':
      return <TrendingUp className="h-3 w-3 text-green-500" />;
    case 'down':
      return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />;
    default:
      return <TrendingUp className="h-3 w-3 text-muted-foreground" />;
  }
};

const getTrendColor = (trend: string) => {
  switch (trend) {
    case 'up':
      return 'text-green-600';
    case 'down':
      return 'text-red-600';
    default:
      return 'text-muted-foreground';
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

export const HelpAnalytics: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {helpMetrics.map((metric) => (
          <Card key={metric.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.label}
              </CardTitle>
              {metric.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <div className={`text-xs flex items-center gap-1 ${getTrendColor(metric.trend)}`}>
                {getTrendIcon(metric.trend)}
                {metric.change} from last month
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Popular Help Articles</CardTitle>
          <CardDescription>Most viewed and helpful content this month</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {popularArticles.map((article, index) => (
              <div key={article.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{article.title}</span>
                      <Badge variant={getCategoryColor(article.category) as any} className="text-xs">
                        {article.category}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {article.views.toLocaleString()} views
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm">
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {article.rating}
                  </div>
                  <div className="text-muted-foreground">
                    {article.helpfulness}% helpful
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Search Trends</CardTitle>
            <CardDescription>What users are looking for</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { query: 'work order status', count: 456 },
                { query: 'customer communication', count: 324 },
                { query: 'inventory tracking', count: 289 },
                { query: 'report generation', count: 234 },
                { query: 'user permissions', count: 198 }
              ].map((trend, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm">{trend.query}</span>
                  <Badge variant="outline">{trend.count}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Help Feedback</CardTitle>
            <CardDescription>User satisfaction ratings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { rating: 'Very Helpful', count: 1234, percentage: 65 },
                { rating: 'Helpful', count: 456, percentage: 24 },
                { rating: 'Somewhat Helpful', count: 123, percentage: 8 },
                { rating: 'Not Helpful', count: 45, percentage: 3 }
              ].map((feedback, index) => (
                <div key={index} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span>{feedback.rating}</span>
                    <span className="text-muted-foreground">{feedback.count}</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-300"
                      style={{ width: `${feedback.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
