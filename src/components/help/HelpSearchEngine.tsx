import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  BookOpen, 
  Video, 
  ExternalLink, 
  ChevronRight,
  Star,
  Clock,
  TrendingUp,
  Zap
} from 'lucide-react';

interface SearchSuggestion {
  query: string;
  category: string;
  resultCount: number;
}

interface QuickResult {
  id: string;
  title: string;
  snippet: string;
  category: string;
  type: 'article' | 'video' | 'guide';
  url: string;
  relevanceScore: number;
}

const popularSearches: SearchSuggestion[] = [
  { query: 'create work order', category: 'Work Orders', resultCount: 12 },
  { query: 'add customer', category: 'Customers', resultCount: 8 },
  { query: 'inventory setup', category: 'Inventory', resultCount: 15 },
  { query: 'API integration', category: 'Developer', resultCount: 6 },
  { query: 'payment setup', category: 'Shopping', resultCount: 9 },
  { query: 'user permissions', category: 'Security', resultCount: 7 }
];

const quickResults: QuickResult[] = [
  {
    id: '1',
    title: 'How to Create a Work Order',
    snippet: 'Step-by-step guide to creating and managing work orders...',
    category: 'Work Orders',
    type: 'guide',
    url: '/help/work-orders/create',
    relevanceScore: 0.95
  },
  {
    id: '2',
    title: 'Customer Management Basics',
    snippet: 'Learn how to add, edit, and organize customer information...',
    category: 'Customers',
    type: 'article',
    url: '/help/customers/basics',
    relevanceScore: 0.92
  },
  {
    id: '3',
    title: 'Setting Up Your Inventory',
    snippet: 'Configure parts, suppliers, and stock management...',
    category: 'Inventory',
    type: 'video',
    url: '/help/inventory/setup',
    relevanceScore: 0.89
  }
];

export function HelpSearchEngine() {
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<QuickResult[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Simulate search with debouncing
  useEffect(() => {
    if (searchQuery.trim().length > 2) {
      setIsSearching(true);
      const searchTimer = setTimeout(() => {
        // Simulate API search
        const filtered = quickResults.filter(result =>
          result.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.snippet.toLowerCase().includes(searchQuery.toLowerCase()) ||
          result.category.toLowerCase().includes(searchQuery.toLowerCase())
        );
        setSearchResults(filtered);
        setIsSearching(false);
      }, 300);

      return () => clearTimeout(searchTimer);
    } else {
      setSearchResults([]);
      setIsSearching(false);
    }
  }, [searchQuery]);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'video': return <Video className="h-4 w-4 text-blue-600" />;
      case 'guide': return <BookOpen className="h-4 w-4 text-green-600" />;
      default: return <BookOpen className="h-4 w-4 text-gray-600" />;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setSearchQuery(suggestion.query);
    setShowSuggestions(false);
  };

  return (
    <div className="space-y-6">
      {/* Search Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Smart Help Search
          </CardTitle>
          <CardDescription>
            Find answers instantly with our intelligent search engine
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              type="text"
              placeholder="Ask anything... e.g., 'How do I create a work order?'"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSuggestions(e.target.value.length > 0);
              }}
              onFocus={() => setShowSuggestions(searchQuery.length > 0)}
              className="pl-10 pr-4"
            />
            
            {/* Instant Suggestions Dropdown */}
            {showSuggestions && searchQuery.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1 bg-background border rounded-md shadow-lg z-50 max-h-64 overflow-y-auto">
                {searchQuery.length > 2 && searchResults.length > 0 && (
                  <div className="p-2 border-b">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Quick Results</p>
                    {searchResults.slice(0, 3).map((result) => (
                      <div key={result.id} className="flex items-center gap-3 p-2 hover:bg-muted rounded cursor-pointer">
                        {getTypeIcon(result.type)}
                        <div className="flex-1">
                          <p className="text-sm font-medium">{result.title}</p>
                          <p className="text-xs text-muted-foreground">{result.snippet.substring(0, 60)}...</p>
                        </div>
                        <Badge variant="outline" className="text-xs">{result.category}</Badge>
                      </div>
                    ))}
                  </div>
                )}
                
                <div className="p-2">
                  <p className="text-xs font-medium text-muted-foreground mb-2">Popular Searches</p>
                  {popularSearches
                    .filter(s => s.query.toLowerCase().includes(searchQuery.toLowerCase()))
                    .slice(0, 4)
                    .map((suggestion, index) => (
                      <div
                        key={index}
                        onClick={() => handleSuggestionClick(suggestion)}
                        className="flex items-center justify-between p-2 hover:bg-muted rounded cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <TrendingUp className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{suggestion.query}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">{suggestion.category}</Badge>
                          <span className="text-xs text-muted-foreground">{suggestion.resultCount}</span>
                        </div>
                      </div>
                    ))}
                </div>
              </div>
            )}
          </div>

          {isSearching && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <div className="animate-spin h-4 w-4 border-2 border-primary border-t-transparent rounded-full"></div>
                Searching...
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Search Results */}
      {searchResults.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Search Results</span>
              <Badge variant="secondary">{searchResults.length} found</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {searchResults.map((result) => (
                <div key={result.id} className="flex items-start gap-4 p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <div className="flex-shrink-0">
                    {getTypeIcon(result.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="font-medium">{result.title}</h3>
                        <p className="text-sm text-muted-foreground mt-1">{result.snippet}</p>
                        <div className="flex items-center gap-2 mt-2">
                          <Badge variant="outline">{result.category}</Badge>
                          <Badge variant="secondary" className="capitalize">{result.type}</Badge>
                          <div className="flex items-center gap-1 text-yellow-500">
                            <Star className="h-3 w-3 fill-current" />
                            <span className="text-xs">{(result.relevanceScore * 5).toFixed(1)}</span>
                          </div>
                        </div>
                      </div>
                      <ExternalLink className="h-4 w-4 text-muted-foreground" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Popular Searches when no query */}
      {!searchQuery && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Popular Searches
            </CardTitle>
            <CardDescription>
              See what other users are looking for
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              {popularSearches.map((search, index) => (
                <div
                  key={index}
                  onClick={() => handleSuggestionClick(search)}
                  className="flex items-center justify-between p-3 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Zap className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{search.query}</p>
                      <p className="text-xs text-muted-foreground">{search.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {search.resultCount} results
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Access */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Access</CardTitle>
          <CardDescription>
            Jump to commonly needed help topics
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-3">
            {[
              { label: 'Getting Started', icon: BookOpen, badge: 'New' },
              { label: 'Video Tutorials', icon: Video, badge: 'Popular' },
              { label: 'API Docs', icon: ExternalLink, badge: 'Developer' }
            ].map((item, index) => {
              const Icon = item.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2"
                >
                  <Icon className="h-6 w-6" />
                  <span className="text-sm">{item.label}</span>
                  <Badge variant="secondary" className="text-xs">{item.badge}</Badge>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}