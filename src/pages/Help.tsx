import React, { useState, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  HelpCircle, 
  Book, 
  MessageCircle, 
  FileText, 
  ExternalLink,
  Search,
  Video,
  Users,
  Lightbulb,
  ChevronRight,
  Star,
  Clock,
  MapPin
} from 'lucide-react';

// Help articles database
const helpArticles = [
  {
    id: '1',
    title: 'Getting Started with Work Orders',
    content: 'Learn how to create, manage, and track work orders effectively...',
    category: 'Work Orders',
    tags: ['basics', 'work-orders', 'getting-started'],
    relevantRoutes: ['/work-orders', '/dashboard'],
    difficulty: 'beginner',
    readTime: 5,
    rating: 4.8
  },
  {
    id: '2',
    title: 'Managing Customer Information',
    content: 'Complete guide to adding, editing, and organizing customer data...',
    category: 'Customers',
    tags: ['customers', 'data-management', 'contacts'],
    relevantRoutes: ['/customers'],
    difficulty: 'beginner',
    readTime: 3,
    rating: 4.9
  },
  {
    id: '3',
    title: 'Inventory Management Best Practices',
    content: 'Optimize your parts inventory with these proven strategies...',
    category: 'Inventory',
    tags: ['inventory', 'parts', 'optimization'],
    relevantRoutes: ['/inventory'],
    difficulty: 'intermediate',
    readTime: 8,
    rating: 4.7
  },
  {
    id: '4',
    title: 'API Integration Guide',
    content: 'Step-by-step guide to integrating with external systems...',
    category: 'Developer',
    tags: ['api', 'integration', 'development'],
    relevantRoutes: ['/developer', '/developer/api-docs'],
    difficulty: 'advanced',
    readTime: 15,
    rating: 4.6
  },
  {
    id: '5',
    title: 'E-commerce Setup and Configuration',
    content: 'Set up your online store and start selling parts online...',
    category: 'Shopping',
    tags: ['ecommerce', 'shopping', 'online-store'],
    relevantRoutes: ['/shopping', '/developer/shopping-controls'],
    difficulty: 'intermediate',
    readTime: 10,
    rating: 4.5
  },
  {
    id: '6',
    title: 'Setting Up User Roles and Permissions',
    content: 'Configure team access and security settings...',
    category: 'Security',
    tags: ['security', 'permissions', 'team-management'],
    relevantRoutes: ['/settings/security', '/developer/security'],
    difficulty: 'intermediate',
    readTime: 7,
    rating: 4.8
  }
];

const quickActions = [
  {
    title: 'Contact Support',
    description: 'Get help from our support team',
    icon: MessageCircle,
    action: 'contact'
  },
  {
    title: 'Schedule Demo',
    description: 'Book a personalized walkthrough',
    icon: Video,
    action: 'demo'
  },
  {
    title: 'Community Forum',
    description: 'Connect with other users',
    icon: Users,
    action: 'forum'
  },
  {
    title: 'Feature Request',
    description: 'Suggest new features',
    icon: Lightbulb,
    action: 'feature'
  }
];

const categories = ['All', 'Work Orders', 'Customers', 'Inventory', 'Developer', 'Shopping', 'Security'];

export default function Help() {
  const location = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [activeTab, setActiveTab] = useState('search');

  // Get contextual help based on current route
  const contextualHelp = useMemo(() => {
    const currentPath = location.pathname;
    return helpArticles.filter(article => 
      article.relevantRoutes.some(route => currentPath.startsWith(route))
    );
  }, [location.pathname]);

  // Filter articles based on search and category
  const filteredArticles = useMemo(() => {
    let filtered = helpArticles;

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(article => article.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(article =>
        article.title.toLowerCase().includes(query) ||
        article.content.toLowerCase().includes(query) ||
        article.tags.some(tag => tag.toLowerCase().includes(query))
      );
    }

    return filtered.sort((a, b) => b.rating - a.rating);
  }, [searchQuery, selectedCategory]);

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getCurrentPageContext = () => {
    const path = location.pathname;
    if (path.startsWith('/work-orders')) return 'Work Orders';
    if (path.startsWith('/customers')) return 'Customer Management';
    if (path.startsWith('/inventory')) return 'Inventory Management';
    if (path.startsWith('/developer')) return 'Developer Tools';
    if (path.startsWith('/shopping')) return 'E-commerce';
    if (path.startsWith('/settings')) return 'Settings';
    return 'Dashboard';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Help & Support</h1>
        <p className="text-muted-foreground">
          Find answers, learn features, and get the help you need
        </p>
      </div>

      {/* Context Banner */}
      {contextualHelp.length > 0 && (
        <Card className="border-primary/20 bg-primary/5">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Help for {getCurrentPageContext()}</CardTitle>
            </div>
            <CardDescription>
              Here are some helpful resources related to what you're currently working on
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {contextualHelp.slice(0, 4).map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-background rounded-lg border">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{article.title}</h4>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className={getDifficultyColor(article.difficulty)}>
                        {article.difficulty}
                      </Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {article.readTime}m
                      </span>
                    </div>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="search">Search & Browse</TabsTrigger>
          <TabsTrigger value="quick">Quick Actions</TabsTrigger>
          <TabsTrigger value="popular">Popular Articles</TabsTrigger>
        </TabsList>

        <TabsContent value="search" className="space-y-6">
          {/* Enhanced Search Bar */}
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search help articles, guides, and documentation..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Category Filter */}
                <div className="flex flex-wrap gap-2">
                  {categories.map((category) => (
                    <Button
                      key={category}
                      variant={selectedCategory === category ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category)}
                    >
                      {category}
                    </Button>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Search Results */}
          <div className="space-y-4">
            {filteredArticles.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <div className="flex flex-col items-center gap-4">
                    <Search className="h-12 w-12 text-muted-foreground" />
                    <div>
                      <h3 className="font-semibold">No articles found</h3>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search terms or browse by category
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              filteredArticles.map((article) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{article.title}</h3>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">{article.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          {article.content.substring(0, 120)}...
                        </p>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className={getDifficultyColor(article.difficulty)}>
                            {article.difficulty}
                          </Badge>
                          <Badge variant="outline">{article.category}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime} min read
                          </span>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground ml-4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="quick" className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Card key={index} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Icon className="h-6 w-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold">{action.title}</h3>
                        <p className="text-sm text-muted-foreground">{action.description}</p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        <TabsContent value="popular" className="space-y-6">
          <div className="grid gap-4">
            {helpArticles
              .sort((a, b) => b.rating - a.rating)
              .slice(0, 6)
              .map((article, index) => (
                <Card key={article.id} className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-bold">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{article.title}</h3>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs font-medium">{article.rating}</span>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {article.content.substring(0, 100)}...
                        </p>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{article.category}</Badge>
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {article.readTime}m
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}