
import React, { useState, useEffect } from 'react';
import { BookOpen, Video, FileText, MessageSquare, Star, Clock, Users, Download, ExternalLink, Filter, SortAsc, Grid, List, Search, PlayCircle, Award, Bookmark, Share2, TrendingUp, Calendar, Code, Database, Settings, Shield, Zap, Wrench, ChartBar, Mail, Bell, Users2, CreditCard, Globe, Smartphone, Laptop, Monitor, Tablet } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';

interface HelpArticle {
  id: string;
  title: string;
  description: string;
  category: 'tutorial' | 'guide' | 'video' | 'faq' | 'webinar' | 'certification' | 'api' | 'integration' | 'troubleshooting' | 'best-practices';
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  estimatedTime: string;
  rating: number;
  views: number;
  tags: string[];
  lastUpdated: string;
  author?: string;
  downloadable?: boolean;
  interactive?: boolean;
  prerequisites?: string[];
  outcomes?: string[];
  resourceLinks?: Array<{ title: string; url: string; type: string }>;
  certificationEligible?: boolean;
  language?: string;
  version?: string;
  popularity?: 'trending' | 'popular' | 'new' | 'updated' | 'featured';
}

interface LearningPath {
  id: string;
  title: string;
  description: string;
  totalDuration: string;
  articlesCount: number;
  difficulty: string;
  completionRate: number;
  articles: string[];
  category: string;
  benefits: string[];
}

interface ResourceLibrary {
  id: string;
  title: string;
  type: 'template' | 'checklist' | 'worksheet' | 'document' | 'tool' | 'calculator';
  description: string;
  downloadUrl: string;
  category: string;
  size: string;
  format: string;
  downloads: number;
}

// Comprehensive Help Articles Database
const helpArticles: HelpArticle[] = [
  // Getting Started Section
  {
    id: '1',
    title: 'Complete Setup Guide: From Registration to First Work Order',
    description: 'Comprehensive guide covering account setup, team onboarding, and creating your first work order. Everything you need to get started.',
    category: 'tutorial',
    difficulty: 'beginner',
    estimatedTime: '20 min',
    rating: 4.9,
    views: 5641,
    tags: ['setup', 'getting-started', 'onboarding', 'work-orders'],
    lastUpdated: '2024-01-22',
    author: 'Support Team',
    downloadable: true,
    interactive: true,
    prerequisites: ['Business registration'],
    outcomes: ['Fully configured account', 'Team setup complete', 'First work order created'],
    certificationEligible: true,
    popularity: 'featured'
  },
  {
    id: '2',
    title: 'Dashboard Mastery: Complete Navigation Guide',
    description: 'Master every aspect of the dashboard including widgets, customization, keyboard shortcuts, and advanced features.',
    category: 'video',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    rating: 4.8,
    views: 4523,
    tags: ['dashboard', 'navigation', 'widgets', 'customization'],
    lastUpdated: '2024-01-20',
    author: 'UI/UX Team',
    interactive: true,
    resourceLinks: [
      { title: 'Dashboard Shortcuts Cheatsheet', url: '/resources/shortcuts.pdf', type: 'PDF' },
      { title: 'Widget Configuration Tool', url: '/tools/widget-config', type: 'Tool' }
    ],
    popularity: 'trending'
  },

  // Work Order Management
  {
    id: '3',
    title: 'Advanced Work Order Workflows & Automation',
    description: 'Learn to create complex work order workflows, set up automation rules, and integrate with external systems.',
    category: 'guide',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    rating: 4.7,
    views: 3210,
    tags: ['work-orders', 'automation', 'workflows', 'integration'],
    lastUpdated: '2024-01-18',
    author: 'Engineering Team',
    prerequisites: ['Basic work order knowledge', 'Admin permissions'],
    outcomes: ['Custom workflows created', 'Automation rules configured', 'Integration setup'],
    certificationEligible: true,
    downloadable: true
  },
  {
    id: '4',
    title: 'Work Order Template Library & Best Practices',
    description: 'Discover pre-built templates for common repair scenarios and learn industry best practices for work order management.',
    category: 'best-practices',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    rating: 4.6,
    views: 2987,
    tags: ['templates', 'best-practices', 'efficiency', 'standardization'],
    lastUpdated: '2024-01-16',
    downloadable: true,
    resourceLinks: [
      { title: 'Template Collection', url: '/resources/templates.zip', type: 'ZIP' },
      { title: 'Best Practices Checklist', url: '/resources/checklist.pdf', type: 'PDF' }
    ]
  },

  // Customer Management
  {
    id: '5',
    title: 'Customer Relationship Management Masterclass',
    description: 'Complete guide to managing customer relationships, communication strategies, and building long-term loyalty.',
    category: 'webinar',
    difficulty: 'intermediate',
    estimatedTime: '45 min',
    rating: 4.8,
    views: 4156,
    tags: ['crm', 'customers', 'communication', 'loyalty', 'retention'],
    lastUpdated: '2024-01-15',
    author: 'Sales Team',
    interactive: true,
    certificationEligible: true,
    prerequisites: ['Customer management basics'],
    outcomes: ['CRM strategy developed', 'Communication templates created', 'Loyalty program setup']
  },
  {
    id: '6',
    title: 'Customer Portal Configuration & Self-Service Setup',
    description: 'Set up customer portals, enable self-service options, and configure automated customer communications.',
    category: 'tutorial',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    rating: 4.5,
    views: 2134,
    tags: ['customer-portal', 'self-service', 'automation', 'configuration'],
    lastUpdated: '2024-01-12',
    downloadable: true,
    prerequisites: ['Admin access', 'Customer data'],
    outcomes: ['Portal configured', 'Self-service enabled', 'Automated communications setup']
  },

  // Inventory Management
  {
    id: '7',
    title: 'Inventory Management: From Basics to Advanced Analytics',
    description: 'Comprehensive training on inventory tracking, forecasting, vendor management, and advanced analytics.',
    category: 'certification',
    difficulty: 'advanced',
    estimatedTime: '60 min',
    rating: 4.9,
    views: 3876,
    tags: ['inventory', 'analytics', 'forecasting', 'vendors', 'optimization'],
    lastUpdated: '2024-01-10',
    author: 'Operations Team',
    certificationEligible: true,
    interactive: true,
    downloadable: true,
    prerequisites: ['Basic inventory knowledge', 'Analytics familiarity'],
    outcomes: ['Inventory optimized', 'Forecasting models created', 'Vendor relationships improved'],
    popularity: 'featured'
  },
  {
    id: '8',
    title: 'Barcode & RFID Integration Guide',
    description: 'Step-by-step guide to implementing barcode and RFID systems for inventory tracking and management.',
    category: 'integration',
    difficulty: 'expert',
    estimatedTime: '40 min',
    rating: 4.4,
    views: 1567,
    tags: ['barcode', 'rfid', 'integration', 'hardware', 'tracking'],
    lastUpdated: '2024-01-08',
    prerequisites: ['Hardware procurement', 'Technical knowledge'],
    outcomes: ['Barcode system integrated', 'RFID tracking enabled', 'Automated inventory updates'],
    resourceLinks: [
      { title: 'Hardware Compatibility List', url: '/resources/hardware.pdf', type: 'PDF' },
      { title: 'Integration API Documentation', url: '/api/inventory', type: 'API' }
    ]
  },

  // Financial Management
  {
    id: '9',
    title: 'Complete Invoicing & Payment Processing Setup',
    description: 'Master invoicing workflows, payment processing, and financial reporting for maximum efficiency.',
    category: 'tutorial',
    difficulty: 'intermediate',
    estimatedTime: '25 min',
    rating: 4.7,
    views: 3421,
    tags: ['invoicing', 'payments', 'financial', 'reporting'],
    lastUpdated: '2024-01-14',
    downloadable: true,
    interactive: true,
    outcomes: ['Invoicing automated', 'Payment processing enabled', 'Financial reports configured']
  },
  {
    id: '10',
    title: 'QuickBooks & Accounting Software Integration',
    description: 'Connect your favorite accounting software and automate financial data synchronization.',
    category: 'integration',
    difficulty: 'advanced',
    estimatedTime: '35 min',
    rating: 4.6,
    views: 2098,
    tags: ['quickbooks', 'accounting', 'integration', 'synchronization'],
    lastUpdated: '2024-01-11',
    prerequisites: ['Accounting software access', 'Admin permissions'],
    outcomes: ['Software integrated', 'Data synchronization enabled', 'Automated workflows'],
    resourceLinks: [
      { title: 'QuickBooks Integration Guide', url: '/integrations/quickbooks', type: 'Guide' },
      { title: 'API Keys Setup', url: '/settings/api', type: 'Settings' }
    ]
  },

  // Reporting & Analytics
  {
    id: '11',
    title: 'Business Intelligence & Advanced Reporting',
    description: 'Create powerful reports, dashboards, and analytics to drive business insights and decision-making.',
    category: 'guide',
    difficulty: 'advanced',
    estimatedTime: '50 min',
    rating: 4.8,
    views: 2765,
    tags: ['reporting', 'analytics', 'business-intelligence', 'dashboards'],
    lastUpdated: '2024-01-09',
    author: 'Analytics Team',
    certificationEligible: true,
    interactive: true,
    prerequisites: ['Data analysis basics', 'Business metrics understanding'],
    outcomes: ['Custom reports created', 'Dashboards configured', 'KPIs tracked'],
    popularity: 'popular'
  },

  // API & Integration
  {
    id: '12',
    title: 'API Documentation & Developer Guide',
    description: 'Complete API reference with examples, authentication, and integration patterns for developers.',
    category: 'api',
    difficulty: 'expert',
    estimatedTime: '45 min',
    rating: 4.5,
    views: 1876,
    tags: ['api', 'development', 'integration', 'authentication'],
    lastUpdated: '2024-01-07',
    author: 'Development Team',
    downloadable: true,
    prerequisites: ['Programming knowledge', 'API familiarity'],
    outcomes: ['API integrated', 'Custom applications built', 'Automated workflows'],
    resourceLinks: [
      { title: 'API Reference', url: '/docs/api', type: 'Documentation' },
      { title: 'Code Examples', url: '/examples', type: 'Code' },
      { title: 'Postman Collection', url: '/resources/postman.json', type: 'JSON' }
    ]
  },

  // Troubleshooting
  {
    id: '13',
    title: 'Common Issues & Troubleshooting Guide',
    description: 'Comprehensive troubleshooting guide covering login issues, data sync problems, and performance optimization.',
    category: 'troubleshooting',
    difficulty: 'beginner',
    estimatedTime: '15 min',
    rating: 4.6,
    views: 4321,
    tags: ['troubleshooting', 'issues', 'performance', 'optimization'],
    lastUpdated: '2024-01-21',
    downloadable: true,
    interactive: true,
    popularity: 'popular'
  },

  // Security & Compliance
  {
    id: '14',
    title: 'Security Best Practices & Compliance Guide',
    description: 'Essential security measures, compliance requirements, and data protection strategies for your business.',
    category: 'best-practices',
    difficulty: 'intermediate',
    estimatedTime: '30 min',
    rating: 4.7,
    views: 2543,
    tags: ['security', 'compliance', 'data-protection', 'privacy'],
    lastUpdated: '2024-01-13',
    certificationEligible: true,
    prerequisites: ['Admin access', 'Security awareness'],
    outcomes: ['Security measures implemented', 'Compliance achieved', 'Data protected']
  }
];

// Learning Paths
const learningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'Complete Beginner Bootcamp',
    description: 'Everything you need to know to get started, from setup to your first successful work order.',
    totalDuration: '2 hours',
    articlesCount: 6,
    difficulty: 'beginner',
    completionRate: 89,
    articles: ['1', '2', '9', '13'],
    category: 'getting-started',
    benefits: ['Complete setup', 'Workflow mastery', 'Common issue resolution']
  },
  {
    id: 'path-2',
    title: 'Business Operations Mastery',
    description: 'Advanced techniques for optimizing operations, inventory, and customer relationships.',
    totalDuration: '4 hours',
    articlesCount: 8,
    difficulty: 'advanced',
    completionRate: 67,
    articles: ['3', '5', '7', '11'],
    category: 'operations',
    benefits: ['Workflow automation', 'Advanced analytics', 'Operational efficiency']
  },
  {
    id: 'path-3',
    title: 'Developer Integration Track',
    description: 'Technical guides for developers building custom integrations and applications.',
    totalDuration: '3 hours',
    articlesCount: 5,
    difficulty: 'expert',
    completionRate: 45,
    articles: ['8', '10', '12'],
    category: 'development',
    benefits: ['API mastery', 'Custom integrations', 'Automated workflows']
  }
];

// Resource Library
const resourceLibrary: ResourceLibrary[] = [
  {
    id: 'res-1',
    title: 'Work Order Templates Collection',
    type: 'template',
    description: 'Pre-built templates for common automotive repairs and services.',
    downloadUrl: '/resources/work-order-templates.zip',
    category: 'work-orders',
    size: '2.4 MB',
    format: 'ZIP',
    downloads: 3456
  },
  {
    id: 'res-2',
    title: 'Customer Onboarding Checklist',
    type: 'checklist',
    description: 'Step-by-step checklist for onboarding new customers efficiently.',
    downloadUrl: '/resources/onboarding-checklist.pdf',
    category: 'customers',
    size: '567 KB',
    format: 'PDF',
    downloads: 2341
  },
  {
    id: 'res-3',
    title: 'Inventory Optimization Calculator',
    type: 'calculator',
    description: 'Excel tool for calculating optimal inventory levels and reorder points.',
    downloadUrl: '/resources/inventory-calculator.xlsx',
    category: 'inventory',
    size: '1.2 MB',
    format: 'XLSX',
    downloads: 1876
  },
  {
    id: 'res-4',
    title: 'Business Performance Dashboard Template',
    type: 'template',
    description: 'Ready-to-use dashboard template for tracking key business metrics.',
    downloadUrl: '/resources/dashboard-template.json',
    category: 'reporting',
    size: '45 KB',
    format: 'JSON',
    downloads: 987
  },
  {
    id: 'res-5',
    title: 'Security Audit Worksheet',
    type: 'worksheet',
    description: 'Comprehensive worksheet for conducting security audits and assessments.',
    downloadUrl: '/resources/security-audit.docx',
    category: 'security',
    size: '890 KB',
    format: 'DOCX',
    downloads: 654
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
    case 'webinar':
      return <PlayCircle className="h-4 w-4" />;
    case 'faq':
      return <MessageSquare className="h-4 w-4" />;
    case 'certification':
      return <Award className="h-4 w-4" />;
    case 'api':
      return <Code className="h-4 w-4" />;
    case 'integration':
      return <Zap className="h-4 w-4" />;
    case 'troubleshooting':
      return <Wrench className="h-4 w-4" />;
    case 'best-practices':
      return <Shield className="h-4 w-4" />;
    default:
      return <FileText className="h-4 w-4" />;
  }
};

const getResourceIcon = (type: string) => {
  switch (type) {
    case 'template':
      return <FileText className="h-4 w-4" />;
    case 'checklist':
      return <BookOpen className="h-4 w-4" />;
    case 'worksheet':
      return <FileText className="h-4 w-4" />;
    case 'document':
      return <FileText className="h-4 w-4" />;
    case 'tool':
      return <Wrench className="h-4 w-4" />;
    case 'calculator':
      return <ChartBar className="h-4 w-4" />;
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
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [sortBy, setSortBy] = useState<'date' | 'popularity' | 'rating'>('date');
  const [dbArticles, setDbArticles] = useState<HelpArticle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Use mock data for now, with DB integration available
  const allArticles = [...helpArticles, ...dbArticles];

  useEffect(() => {
    // Optionally load from database
    // loadArticles();
  }, []);

  const loadArticles = async () => {
    try {
      setIsLoading(true);
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
        difficulty: 'beginner' as any,
        estimatedTime: '5 min',
        rating: 4.5,
        views: article.view_count || 0,
        tags: article.tags || [],
        lastUpdated: article.updated_at
      }));

      setDbArticles(transformedArticles);
    } catch (error) {
      console.error('Error loading articles:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter and search logic
  const filteredArticles = allArticles.filter(article => {
    const matchesCategory = selectedCategory === 'all' || article.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'all' || article.difficulty === selectedDifficulty;
    const matchesSearch = searchQuery === '' || 
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesCategory && matchesDifficulty && matchesSearch;
  });

  // Sort articles
  const sortedArticles = [...filteredArticles].sort((a, b) => {
    switch (sortBy) {
      case 'popularity':
        return b.views - a.views;
      case 'rating':
        return b.rating - a.rating;
      case 'date':
      default:
        return new Date(b.lastUpdated).getTime() - new Date(a.lastUpdated).getTime();
    }
  });

  const categories = [
    { id: 'all', label: 'All Content', count: allArticles.length },
    { id: 'tutorial', label: 'Tutorials', count: allArticles.filter(a => a.category === 'tutorial').length },
    { id: 'guide', label: 'Guides', count: allArticles.filter(a => a.category === 'guide').length },
    { id: 'video', label: 'Videos', count: allArticles.filter(a => a.category === 'video').length },
    { id: 'webinar', label: 'Webinars', count: allArticles.filter(a => a.category === 'webinar').length },
    { id: 'certification', label: 'Certifications', count: allArticles.filter(a => a.category === 'certification').length },
    { id: 'api', label: 'API Docs', count: allArticles.filter(a => a.category === 'api').length },
    { id: 'integration', label: 'Integrations', count: allArticles.filter(a => a.category === 'integration').length },
    { id: 'troubleshooting', label: 'Troubleshooting', count: allArticles.filter(a => a.category === 'troubleshooting').length },
    { id: 'best-practices', label: 'Best Practices', count: allArticles.filter(a => a.category === 'best-practices').length }
  ];

  const difficulties = [
    { id: 'all', label: 'All Levels' },
    { id: 'beginner', label: 'Beginner' },
    { id: 'intermediate', label: 'Intermediate' },
    { id: 'advanced', label: 'Advanced' },
    { id: 'expert', label: 'Expert' }
  ];

  const renderArticleCard = (article: HelpArticle) => (
    <Card 
      key={article.id} 
      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:-translate-y-1"
      onClick={() => window.location.href = `/help?id=${article.id}`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            {getCategoryIcon(article.category)}
            <Badge variant="outline" className="text-xs">
              {article.category}
            </Badge>
            {article.popularity && (
              <Badge variant="secondary" className="text-xs">
                {article.popularity}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant={getDifficultyColor(article.difficulty) as any} className="text-xs">
              {article.difficulty}
            </Badge>
            {article.certificationEligible && (
              <Award className="h-4 w-4 text-yellow-500" />
            )}
          </div>
        </div>
        <CardTitle className="text-lg leading-tight">{article.title}</CardTitle>
        <CardDescription className="line-clamp-2">{article.description}</CardDescription>
        {article.author && (
          <div className="text-xs text-muted-foreground">
            By {article.author}
          </div>
        )}
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
        
        {article.prerequisites && article.prerequisites.length > 0 && (
          <div className="mb-3">
            <div className="text-xs font-medium text-muted-foreground mb-1">Prerequisites:</div>
            <div className="text-xs text-muted-foreground">
              {article.prerequisites.join(', ')}
            </div>
          </div>
        )}

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

        <div className="flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            Updated {new Date(article.lastUpdated).toLocaleDateString()}
          </div>
          <div className="flex items-center gap-2">
            {article.downloadable && (
              <Download className="h-3 w-3 text-muted-foreground" />
            )}
            {article.interactive && (
              <PlayCircle className="h-3 w-3 text-muted-foreground" />
            )}
            <ExternalLink className="h-3 w-3 text-muted-foreground" />
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderLearningPathCard = (path: LearningPath) => (
    <Card key={path.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <Badge variant="outline" className="text-xs">
            {path.category}
          </Badge>
          <Badge variant={getDifficultyColor(path.difficulty) as any} className="text-xs">
            {path.difficulty}
          </Badge>
        </div>
        <CardTitle className="text-lg">{path.title}</CardTitle>
        <CardDescription>{path.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span>{path.articlesCount} articles</span>
            <span>{path.totalDuration}</span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span>Completion Rate</span>
              <span>{path.completionRate}%</span>
            </div>
            <Progress value={path.completionRate} className="h-2" />
          </div>
          <div className="space-y-2">
            <div className="text-xs font-medium">Benefits:</div>
            <div className="flex flex-wrap gap-1">
              {path.benefits.map((benefit, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {benefit}
                </Badge>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  const renderResourceCard = (resource: ResourceLibrary) => (
    <Card key={resource.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            {getResourceIcon(resource.type)}
            <Badge variant="outline" className="text-xs">
              {resource.type}
            </Badge>
          </div>
          <Badge variant="secondary" className="text-xs">
            {resource.format}
          </Badge>
        </div>
        <CardTitle className="text-lg">{resource.title}</CardTitle>
        <CardDescription>{resource.description}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
          <span>{resource.size}</span>
          <span>{resource.downloads.toLocaleString()} downloads</span>
        </div>
        <Button 
          className="w-full" 
          variant="outline"
          onClick={(e) => {
            e.stopPropagation();
            window.open(resource.downloadUrl, '_blank');
          }}
        >
          <Download className="h-4 w-4 mr-2" />
          Download
        </Button>
      </CardContent>
    </Card>
  );

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
      <Tabs defaultValue="articles" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="articles" className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Articles ({allArticles.length})
          </TabsTrigger>
          <TabsTrigger value="paths" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Learning Paths ({learningPaths.length})
          </TabsTrigger>
          <TabsTrigger value="resources" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Resources ({resourceLibrary.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="articles" className="space-y-6 mt-6">
          {/* Search and Filters */}
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search articles, tags, or content..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center gap-2">
                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    {difficulties.map((difficulty) => (
                      <SelectItem key={difficulty.id} value={difficulty.id}>
                        {difficulty.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="date">Latest</SelectItem>
                    <SelectItem value="popularity">Popular</SelectItem>
                    <SelectItem value="rating">Rating</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex items-center border rounded-md">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <Grid className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Category Filters */}
            <div className="flex flex-wrap gap-2">
              {categories.map((category) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? 'default' : 'outline'}
                  onClick={() => setSelectedCategory(category.id)}
                  className="h-auto py-2 px-4"
                  size="sm"
                >
                  {category.label}
                  <Badge variant="secondary" className="ml-2">
                    {category.count}
                  </Badge>
                </Button>
              ))}
            </div>
          </div>

          {/* Articles Grid */}
          <div className={viewMode === 'grid' ? 'grid gap-4 md:grid-cols-2 lg:grid-cols-3' : 'space-y-4'}>
            {sortedArticles.map(renderArticleCard)}
          </div>

          {sortedArticles.length === 0 && (
            <div className="text-center py-12">
              <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-medium mb-2">No articles found</h3>
              <p className="text-muted-foreground">
                Try adjusting your search or filter criteria
              </p>
            </div>
          )}
        </TabsContent>

        <TabsContent value="paths" className="space-y-6 mt-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Structured Learning Paths</h3>
            <p className="text-muted-foreground mb-6">
              Follow curated learning paths designed to take you from beginner to expert in specific areas.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {learningPaths.map(renderLearningPathCard)}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="resources" className="space-y-6 mt-6">
          <div>
            <h3 className="text-xl font-semibold mb-4">Downloadable Resources</h3>
            <p className="text-muted-foreground mb-6">
              Templates, checklists, calculators, and other tools to help you succeed.
            </p>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {resourceLibrary.map(renderResourceCard)}
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
