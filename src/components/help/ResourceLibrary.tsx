import React, { useState } from 'react';
import { Download, FileText, Video, Calculator, ExternalLink, Search, Filter, Star, Wrench, Package } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useHelpResources, useHelpCategories } from '@/hooks/useHelp';
import { useToast } from '@/hooks/use-toast';

export const ResourceLibrary: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'popularity' | 'date' | 'name'>('popularity');

  const { data: resources = [], isLoading: resourcesLoading } = useHelpResources(selectedCategory, selectedType);
  const { data: categories = [], isLoading: categoriesLoading } = useHelpCategories();
  const { toast } = useToast();

  const getResourceTypeIcon = (type: string) => {
    switch (type) {
      case 'template':
        return <FileText className="h-4 w-4" />;
      case 'tool':
        return <Wrench className="h-4 w-4" />;
      case 'video':
        return <Video className="h-4 w-4" />;
      case 'document':
        return <FileText className="h-4 w-4" />;
      case 'calculator':
        return <Calculator className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getResourceTypeColor = (type: string) => {
    switch (type) {
      case 'template': return 'default';
      case 'tool': return 'secondary';
      case 'video': return 'destructive';
      case 'document': return 'outline';
      case 'calculator': return 'default';
      default: return 'outline';
    }
  };

  const handleDownload = async (resource: any) => {
    try {
      if (resource.download_url) {
        window.open(resource.download_url, '_blank');
        
        // Track download analytics
        toast({
          title: "Download Started",
          description: `Downloading ${resource.title}...`,
        });
        
        // Here you would typically increment download count in the database
      } else {
        toast({
          title: "Download Unavailable",
          description: "This resource is not available for download yet.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Download error:', error);
      toast({
        title: "Download Failed",
        description: "There was an error downloading this resource.",
        variant: "destructive",
      });
    }
  };

  // Filter and sort resources
  const filteredResources = resources
    .filter(resource => {
      const matchesSearch = searchQuery === '' || 
        resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resource.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
      
      return matchesSearch;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case 'popularity':
          return (b.download_count || 0) - (a.download_count || 0);
        case 'date':
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        case 'name':
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

  const resourceTypes = [
    { id: 'all', label: 'All Types', count: resources.length },
    { id: 'template', label: 'Templates', count: resources.filter(r => r.resource_type === 'template').length },
    { id: 'tool', label: 'Tools', count: resources.filter(r => r.resource_type === 'tool').length },
    { id: 'video', label: 'Videos', count: resources.filter(r => r.resource_type === 'video').length },
    { id: 'document', label: 'Documents', count: resources.filter(r => r.resource_type === 'document').length },
    { id: 'calculator', label: 'Calculators', count: resources.filter(r => r.resource_type === 'calculator').length },
  ];

  const featuredResources = resources.filter(r => r.download_count > 1000).slice(0, 3);

  if (resourcesLoading || categoriesLoading) {
    return (
      <div className="space-y-4">
        <div className="flex gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-10 w-32 bg-muted rounded animate-pulse"></div>
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
      <div>
        <h2 className="text-2xl font-bold mb-2">Resource Library</h2>
        <p className="text-muted-foreground">
          Templates, tools, calculators, and guides to help you succeed with your business.
        </p>
      </div>

      {/* Featured Resources */}
      {featuredResources.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Star className="h-5 w-5" />
            Popular Downloads
          </h3>
          <div className="grid gap-4 md:grid-cols-3">
            {featuredResources.map((resource) => (
              <Card key={resource.id} className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResourceTypeIcon(resource.resource_type)}
                      <Badge variant={getResourceTypeColor(resource.resource_type) as any} className="text-xs">
                        {resource.resource_type}
                      </Badge>
                    </div>
                    <Badge variant="secondary" className="text-xs">
                      Popular
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
                    <span>{resource.download_count.toLocaleString()} downloads</span>
                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                  </div>
                  <Button 
                    className="w-full" 
                    onClick={() => handleDownload(resource)}
                  >
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      <Tabs value={selectedType} onValueChange={setSelectedType} className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          {resourceTypes.map((type) => (
            <TabsTrigger key={type.id} value={type.id} className="flex items-center gap-2">
              {getResourceTypeIcon(type.id)}
              <span className="hidden sm:inline">{type.label}</span>
              <Badge variant="secondary" className="text-xs">
                {type.count}
              </Badge>
            </TabsTrigger>
          ))}
        </TabsList>

        <div className="mt-6 space-y-4">
          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search resources..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-2">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={sortBy} onValueChange={(value: any) => setSortBy(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Sort by" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="popularity">Most Popular</SelectItem>
                  <SelectItem value="date">Latest</SelectItem>
                  <SelectItem value="name">Name A-Z</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Resources Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredResources.map((resource) => (
              <Card key={resource.id} className="cursor-pointer transition-all duration-200 hover:shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {getResourceTypeIcon(resource.resource_type)}
                      <Badge variant={getResourceTypeColor(resource.resource_type) as any} className="text-xs">
                        {resource.resource_type}
                      </Badge>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {resource.help_categories?.name || 'General'}
                    </Badge>
                  </div>
                  <CardTitle className="text-lg">{resource.title}</CardTitle>
                  <CardDescription>{resource.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>{resource.download_count.toLocaleString()} downloads</span>
                      <span>{new Date(resource.created_at).toLocaleDateString()}</span>
                    </div>
                    
                    {resource.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {resource.tags.slice(0, 3).map((tag) => (
                          <Badge key={tag} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                        {resource.tags.length > 3 && (
                          <Badge variant="outline" className="text-xs">
                            +{resource.tags.length - 3}
                          </Badge>
                        )}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Button 
                        className="flex-1" 
                        onClick={() => handleDownload(resource)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                      {resource.file_url && (
                        <Button variant="outline" size="icon">
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Package className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Resources Found</h3>
                <p className="text-muted-foreground">
                  {searchQuery || selectedCategory !== 'all' ? 
                    'Try adjusting your search or filter criteria' : 
                    'Resources are being prepared and will be available soon'
                  }
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </Tabs>
    </div>
  );
};